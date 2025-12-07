const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  name: String,
  qty: Number,
  specs: mongoose.Schema.Types.Mixed,
  unitBudget: Number
}, { _id: false });

const RfpSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  items: { type: [ItemSchema], default: [] },
  budget: { type: Number },
  deliveryDays: { type: Number },
  paymentTerms: { type: String },
  warranty: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Rfp', RfpSchema);