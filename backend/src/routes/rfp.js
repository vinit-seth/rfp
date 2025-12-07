const express = require('express');
const router = express.Router();
const Rfp = require('../models/Rfp');
const Vendor = require('../models/Vendor');
const Proposal = require('../models/Proposal');
const { parseRfpFromText, rankProposals } = require('../services/aiService');
const { sendRfpEmail } = require('../services/emailService');

// Create RFP from natural language
router.post('/', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'text is required' });
    const structured = await parseRfpFromText(text);
    const rfp = await Rfp.create({
      title: structured.title || (structured.items?.[0]?.name || 'Untitled RFP'),
      description: structured.description || text,
      items: structured.items || [],
      budget: structured.budget || null,
      deliveryDays: structured.deliveryDays || null,
      paymentTerms: structured.paymentTerms || null,
      warranty: structured.warranty || null
    });
    res.status(201).json(rfp);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get RFP by id
router.get('/:id', async (req, res) => {
  try {
    const rfp = await Rfp.findById(req.params.id);
    if (!rfp) return res.status(404).json({ error: 'Not found' });
    const proposals = await Proposal.find({ rfp: rfp._id }).populate('vendor');
    res.json({ rfp, proposals });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Send RFP to vendors
router.post('/:id/send', async (req, res) => {
  try {
    const { vendorIds } = req.body;
    if (!vendorIds || !Array.isArray(vendorIds)) return res.status(400).json({ error: 'vendorIds required' });
    const rfp = await Rfp.findById(req.params.id);
    if (!rfp) return res.status(404).json({ error: 'RFP not found' });

    const vendors = await Vendor.find({ _id: { $in: vendorIds } });

    const results = [];
    for (const v of vendors) {
      try {
        await sendRfpEmail(rfp, v);
        results.push({ vendorId: v._id, ok: true });
      } catch (err) {
        results.push({ vendorId: v._id, ok: false, error: err.message });
      }
    }

    res.json({ sent: results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Compare proposals & rank
router.get('/:id/compare', async (req, res) => {
  try {
    const rfp = await Rfp.findById(req.params.id);
    if (!rfp) return res.status(404).json({ error: 'Not found' });
    const proposals = await Proposal.find({ rfp: rfp._id }).populate('vendor');
    const ranking = await rankProposals(rfp.toObject(), proposals.map(p => p.toObject()));
    res.json({ proposals, ranking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /rfps/:id/recommend
router.post('/:id/recommend', async (req, res) => {
  try {
    const rfpId = req.params.id;
    const rfp = await Rfp.findById(rfpId);
    if (!rfp) return res.status(404).json({ message: 'RFP not found' });

    const proposals = await Proposal.find({ rfp: rfpId }).lean();
    if (!proposals || proposals.length === 0) {
      return res.status(200).json({ recommendation: null, message: 'No proposals available' });
    }

    // Call AI ranker
    const ranking = await rankProposals(rfp, proposals);
    return res.json({ recommendation: ranking });
  } catch (err) {
    console.error('Recommend error', err);
    return res.status(500).json({ message: 'Recommendation failed', error: err.message || err });
  }
});

module.exports = router;