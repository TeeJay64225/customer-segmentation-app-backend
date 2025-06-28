const axios = require('axios');
const Purchase = require('../models/Purchase');

class PaymentService {
  constructor() {
    this.paystackBaseUrl = 'https://api.paystack.co';
    this.secretKey = process.env.PAYSTACK_SECRET_KEY;
  }

  // Initialize payment
  async initializePayment(paymentData) {
    try {
      const { email, amount, userId, items, metadata } = paymentData;

      const response = await axios.post(
        `${this.paystackBaseUrl}/transaction/initialize`,
        {
          email,
          amount: amount * 100, // Convert to kobo
          currency: 'GHS', // Ghana Cedis
          metadata: {
            userId,
            items,
            ...metadata
          },
          callback_url: `${process.env.FRONTEND_URL}/payment/callback`
        },
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.status) {
        // Create purchase record
        const purchase = new Purchase({
          userId,
          customerId: email,
          items,
          totalAmount: amount,
          paymentMethod: 'card',
          paymentStatus: 'pending',
          paystackReference: response.data.data.reference,
          metadata
        });

        await purchase.save();

        return {
          success: true,
          data: {
            authorization_url: response.data.data.authorization_url,
            access_code: response.data.data.access_code,
            reference: response.data.data.reference,
            purchaseId: purchase._id
          }
        };
      }

      throw new Error('Payment initialization failed');
    } catch (error) {
      console.error('Payment initialization error:', error);
      throw error;
    }
  }

  // Verify payment
  async verifyPayment(reference) {
    try {
      const response = await axios.get(
        `${this.paystackBaseUrl}/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`
          }
        }
      );

      if (response.data.status && response.data.data.status === 'success') {
        // Update purchase record
        const purchase = await Purchase.findOneAndUpdate(
          { paystackReference: reference },
          {
            paymentStatus: 'completed',
            metadata: {
              ...response.data.data,
              verifiedAt: new Date()
            }
          },
          { new: true }
        );

        return {
          success: true,
          data: {
            purchase,
            transaction: response.data.data
          }
        };
      }

      return {
        success: false,
        message: 'Payment verification failed',
        data: response.data.data
      };
    } catch (error) {
      console.error('Payment verification error:', error);
      throw error;
    }
  }

  // Get payment history
  async getPaymentHistory(userId, limit = 50) {
    try {
      const purchases = await Purchase.find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('userId', 'firstName lastName email');

      return {
        success: true,
        data: { purchases }
      };
    } catch (error) {
      console.error('Get payment history error:', error);
      throw error;
    }
  }

  // Process refund
  async processRefund(reference, amount) {
    try {
      const response = await axios.post(
        `${this.paystackBaseUrl}/refund`,
        {
          transaction: reference,
          amount: amount * 100 // Convert to kobo
        },
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.status) {
        // Update purchase record
        await Purchase.findOneAndUpdate(
          { paystackReference: reference },
          {
            paymentStatus: 'refunded',
            'metadata.refund': response.data.data
          }
        );

        return {
          success: true,
          data: response.data.data
        };
      }

      throw new Error('Refund processing failed');
    } catch (error) {
      console.error('Refund processing error:', error);
      throw error;
    }
  }

  // Handle webhook
  async handleWebhook(event) {
    try {
      const { event: eventType, data } = event;

      switch (eventType) {
        case 'charge.success':
          await this.handleSuccessfulCharge(data);
          break;
        case 'charge.failed':
          await this.handleFailedCharge(data);
          break;
        default:
          console.log(`Unhandled webhook event: ${eventType}`);
      }

      return { success: true };
    } catch (error) {
      console.error('Webhook handling error:', error);
      throw error;
    }
  }

  async handleSuccessfulCharge(data) {
    await Purchase.findOneAndUpdate(
      { paystackReference: data.reference },
      {
        paymentStatus: 'completed',
        'metadata.webhook': data
      }
    );
  }

  async handleFailedCharge(data) {
    await Purchase.findOneAndUpdate(
      { paystackReference: data.reference },
      {
        paymentStatus: 'failed',
        'metadata.webhook': data
      }
    );
  }
}

module.exports = new PaymentService();