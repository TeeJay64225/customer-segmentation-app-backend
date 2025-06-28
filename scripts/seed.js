const mongoose = require('mongoose');
const User = require('../src/models/User');
const Purchase = require('../src/models/Purchase');
require('dotenv').config();

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await User.deleteMany({});
    await Purchase.deleteMany({});
    console.log('✅ Existing data cleared');

    // Create admin user
    console.log('👑 Creating admin user...');
    const adminUser = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      password: 'Admin123!',
      role: 'admin',
      emailVerified: true,
      profile: {
        phone: '+233123456789',
        city: 'Accra',
        country: 'Ghana'
      }
    });
    console.log('✅ Admin user created');

    // Create test users
    console.log('👥 Creating test users...');
    const testUsers = [];
    const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emma', 'James', 'Lisa', 'Robert', 'Mary'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];

    for (let i = 1; i <= 20; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      
      const user = await User.create({
        firstName,
        lastName,
        email: `user${i}@example.com`,
        password: 'User123!',
        role: 'customer',
        emailVerified: Math.random() > 0.3, // 70% verified
        profile: {
          phone: `+23312345${String(i).padStart(4, '0')}`,
          city: ['Accra', 'Kumasi', 'Takoradi', 'Tamale', 'Cape Coast'][Math.floor(Math.random() * 5)],
          country: 'Ghana',
          gender: ['male', 'female'][Math.floor(Math.random() * 2)]
        }
      });
      testUsers.push(user);
    }
    console.log(`✅ Created ${testUsers.length} test users`);

    // Create sample purchases
    console.log('🛒 Creating sample purchases...');
    const categories = ['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports', 'Beauty', 'Automotive', 'Toys'];
    const products = {
      'Electronics': ['Smartphone', 'Laptop', 'Headphones', 'Tablet', 'Smart Watch'],
      'Clothing': ['T-Shirt', 'Jeans', 'Dress', 'Shoes', 'Jacket'],
      'Books': ['Novel', 'Textbook', 'Biography', 'Cookbook', 'Self-Help'],
      'Home & Garden': ['Furniture', 'Appliance', 'Decor', 'Tools', 'Plants'],
      'Sports': ['Equipment', 'Apparel', 'Shoes', 'Accessories', 'Supplements'],
      'Beauty': ['Skincare', 'Makeup', 'Perfume', 'Hair Care', 'Tools'],
      'Automotive': ['Parts', 'Accessories', 'Tools', 'Fluids', 'Electronics'],
      'Toys': ['Action Figures', 'Board Games', 'Educational', 'Electronic', 'Outdoor']
    };

    const purchases = [];
    for (let i = 0; i < 100; i++) {
      const randomUser = testUsers[Math.floor(Math.random() * testUsers.length)];
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];
      const randomProduct = products[randomCategory][Math.floor(Math.random() * products[randomCategory].length)];
      const quantity = Math.floor(Math.random() * 3) + 1;
      const unitPrice = Math.floor(Math.random() * 500) + 20;
      const totalPrice = quantity * unitPrice;
      
      const purchase = {
        userId: randomUser._id,
        customerId: randomUser.email,
        items: [{
          productId: `prod_${i}_${Date.now()}`,
          productName: randomProduct,
          category: randomCategory,
          sku: `SKU-${randomCategory.substring(0, 3).toUpperCase()}-${String(i).padStart(3, '0')}`,
          quantity,
          unitPrice,
          totalPrice,
          currency: 'GHS'
        }],
        totalAmount: totalPrice,
        currency: 'GHS',
        paymentMethod: ['card', 'mobile_money', 'bank_transfer'][Math.floor(Math.random() * 3)],
        paymentStatus: ['completed', 'pending', 'failed'][Math.floor(Math.random() * 3)],
        paystackReference: `ref_${Date.now()}_${i}`,
        transactionDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000), // Random date within last year
        deliveryInfo: {
          city: randomUser.profile.city,
          country: 'Ghana',
          deliveryStatus: ['delivered', 'shipped', 'processing'][Math.floor(Math.random() * 3)]
        }
      };
      
      purchases.push(purchase);
    }
    
    await Purchase.insertMany(purchases);
    console.log(`✅ Created ${purchases.length} sample purchases`);

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('👑 Admin: admin@example.com / Admin123!');
    console.log('👤 User: user1@example.com / User123!');
    console.log('👤 User: user2@example.com / User123!');
    console.log('... (user1 to user20@example.com)');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seeding
seedDatabase();