// backend/scripts/seedProposal.js
// Run from project root: node backend/scripts/seedProposal.js
require('dotenv').config({ path: './backend/.env' }); // prefer backend/.env when running from root
const mongoose = require('mongoose');

async function run() {
  const uri = process.env.DATABASE_URL || process.env.MONGODB_URI;
  if (!uri) {
    console.error('No DATABASE_URL / MONGODB_URI in environment');
    process.exit(1);
  }

  // connect with current API (don't pass old options)
  console.log('Connecting to MongoDB:', uri);
  await mongoose.connect(uri);

  // load models (use same model files as your app)
  const Rfp = require('../src/models/Rfp');
  const Proposal = require('../src/models/Proposal');
  const Vendor = require('../src/models/Vendor');

  // simple seed: create one RFP, one Vendor, one Proposal
  const rfp = await Rfp.create({
    title: 'Office Laptops Purchase Q1',
    description: 'Purchase 10 laptops with min 16GB RAM, 512GB SSD, 14-inch screen. Prefer Windows.',
    items: [
      { name: 'Laptop - 14 inch', qty: 10, specs: '16GB RAM, 512GB SSD', unitBudget: 70000 }
    ],
    budget: 700000,
    deliveryDays: 30,
    paymentTerms: 'Net 30',
    warranty: '1 year'
  });
  console.log('Created RFP', rfp._id.toString());

  const vendor = await Vendor.create({ name: 'Acme Supplies', email: 'vendor@example.com' });
  console.log('Created Vendor', vendor._id.toString());

  const proposal = await Proposal.create({
    rfp: rfp._id,
    vendor: vendor._id,
    vendorName: vendor.name,
    items: [
      { name: 'Laptop - 14 inch', qty: 10, unitPrice: 69000, totalPrice: 690000 }
    ],
    total: 690000,
    deliveryDays: 25,
    paymentTerms: 'Net 30',
    warranty: '2 years',
    contactEmail: vendor.email,
    rawEmail: 'Seeded proposal'
  });
  console.log('Created Proposal', proposal._id.toString());

  await mongoose.disconnect();
  console.log('Done. Disconnected.');
}

run().catch((err) => {
  console.error('Seed failed', err);
  process.exit(1);
});