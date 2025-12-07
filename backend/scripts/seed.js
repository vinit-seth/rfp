require('dotenv').config();
const mongoose = require('mongoose');
const Vendor = require('../src/models/Vendor');
const Rfp = require('../src/models/Rfp');
const Proposal = require('../src/models/Proposal');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rfp_db');
  console.log('Connected to DB');

  await Vendor.deleteMany({});
  await Rfp.deleteMany({});
  await Proposal.deleteMany({});

  const vendors = await Vendor.create([
    { name: 'Alpha Supplies', email: 'alpha@example.com', contactPerson: 'Arun' },
    { name: 'Beta Tech', email: 'beta@example.com', contactPerson: 'Bina' },
    { name: 'Gamma Traders', email: 'gamma@example.com', contactPerson: 'Gaurav' }
  ]);

  const rfp = await Rfp.create({
    title: 'Office Laptops Purchase Q1',
    description: 'Purchase 10 laptops with min 16GB RAM, 512GB SSD, 14-inch screen. Prefer Intel or AMD latest gen. Warranty 3 years.',
    items: [{ name: 'Laptop - 14 inch', qty: 10, specs: { ram: '16GB', storage: '512GB SSD', screen: '14 inch' }, unitBudget: 700 }],
    budget: 8000,
    deliveryDays: 21,
    paymentTerms: 'Net 30',
    warranty: '3 years'
  });

  console.log('Seeded vendors and rfp', vendors.length, rfp._id);
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
