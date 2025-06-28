const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

// Import the main app
const app = require('./src/app');

// Configuration
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

// Database connection function
const connectDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB Atlas successfully');
    console.log(`📊 Database: ${mongoose.connection.name}`);
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    process.exit(1);
  }
};

// Start server function
const startServer = () => {
  app.listen(PORT, () => {
    console.log('🚀 Server is running!');
    console.log(`📍 Environment: ${process.env.NODE_ENV}`);
    console.log(`🌐 Server URL: http://localhost:${PORT}`);
    console.log(`📋 Health Check: http://localhost:${PORT}/api/health`);
    console.log('💡 Press Ctrl+C to stop the server');
  });
};

// Initialize application
const initializeApp = async () => {
  try {
    console.log('🔧 Initializing Customer Segmentation API...');
    await connectDatabase();
    startServer();
  } catch (error) {
    console.error('❌ Failed to initialize application:', error.message);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('🚨 Unhandled Promise Rejection:', err.message);
  console.log('🔄 Shutting down server due to unhandled promise rejection');
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('🚨 Uncaught Exception:', err.message);
  console.log('🔄 Shutting down server due to uncaught exception');
  process.exit(1);
});

// Start the application
initializeApp();