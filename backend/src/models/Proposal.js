const mongoose = require('mongoose');

const ProposalItemSchema = new mongoose.Schema({
  name: String,
  qty: Number,
  unitPrice: Number,
  totalPrice: Number,
  notes: String
}, { _id: false });

const ProposalSchema = new mongoose.Schema({
  rfp: { type: mongoose.Schema.Types.ObjectId, ref: 'Rfp', required: true },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  vendorName: String,
  items: { type: [ProposalItemSchema], default: [] },
  total: Number,
  deliveryDays: Number,
  paymentTerms: String,
  warranty: String,
  contactEmail: String,
  rawEmail: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Proposal', ProposalSchema);