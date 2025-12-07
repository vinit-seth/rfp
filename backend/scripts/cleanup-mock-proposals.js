require('dotenv').config();
const mongoose = require('mongoose');
const Proposal = require('../src/models/Proposal');

async function run() {
  await mongoose.connect(process.env.DATABASE_URL || 'mongodb://localhost:27017/rpf', { useNewUrlParser: true, useUnifiedTopology: true });
  const res = await Proposal.deleteMany({ vendorName: /mock/i });
  console.log('Deleted proposals:', res.deletedCount);
  process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
