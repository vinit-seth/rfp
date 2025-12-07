const mongoose = require('mongoose');
const logger = require('../utils/logger');

async function connectDB(uri) {
  try {
    await mongoose.connect(uri, { connectTimeoutMS: 10000 });
    logger.info('Connected to MongoDB');
  } catch (err) {
    logger.error('MongoDB connection error', err);
    throw err;
  }
}

module.exports = { connectDB };