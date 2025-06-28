// backend/src/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// Create Express app
const app = express();

// Trust proxy for deployment
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
}));

// Request logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// CORS configuration
// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173',
      'https://customer-segmentation-app-frontend.vercel.app', // Add this line
      'https://customer-segmentation-app-6kan.vercel.app', // Add this line if you have the old URL
      process.env.FRONTEND_URL
    ];
    
    console.log('🌐 CORS request from origin:', origin); // Debug log
    
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      console.log('✅ CORS allowed for:', origin);
      callback(null, true);
    } else {
      console.log('❌ CORS blocked for:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Customer Segmentation API is healthy! 🚀',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: '1.0.0'
  });
});

// Root endpoint
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Customer Segmentation API! 🎯',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      users: '/api/users',
      segmentation: '/api/segmentation',
      campaigns: '/api/campaigns',
      payments: '/api/payments'
    }
  });
});

// Import and use routes after basic setup
try {
  const authRoutes = require('./routes/auth');
  const userRoutes = require('./routes/users');
  const segmentationRoutes = require('./routes/segmentation');
  const campaignRoutes = require('./routes/campaigns');
  const paymentRoutes = require('./routes/payments');

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/segmentation', segmentationRoutes);
  app.use('/api/campaigns', campaignRoutes);
  app.use('/api/payments', paymentRoutes);
} catch (error) {
  console.log('⚠️  Some route modules not found, basic endpoints available');
}

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err.message);
  
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// Not found middleware
const notFound = (req, res, next) => {
  const error = new Error(`Not found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

// Apply error middleware
app.use(notFound);
app.use(errorHandler);

module.exports = app;