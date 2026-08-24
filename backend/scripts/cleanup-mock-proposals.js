require('dotenv').config({
  path: require('path').resolve(__dirname, '../.env'),
});

const mongoose = require('mongoose');
const Proposal = require('../src/models/Proposal');

async function run() {
  try {
    const mongoUri =
      process.env.MONGODB_URI ||
      process.env.DATABASE_URL ||
      'mongodb://localhost:27017/rfp_db';

    console.log('Connecting to MongoDB...');

    await mongoose.connect(mongoUri);

    console.log('Connected to MongoDB');

    const res = await Proposal.deleteMany({
      vendorName: /mock/i,
    });

    console.log(`Deleted proposals: ${res.deletedCount}`);

    await mongoose.disconnect();

    console.log('MongoDB connection closed');
    process.exit(0);
  } catch (err) {
    console.error('Cleanup failed:', err);

    try {
      await mongoose.disconnect();
    } catch (disconnectErr) {
      // Ignore disconnect errors
    }

    process.exit(1);
  }
}

run();