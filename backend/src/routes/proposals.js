const express = require('express');
const router = express.Router();
const Proposal = require('../models/Proposal');

// list proposals
router.get('/', async (req, res) => {
  try {
    const proposals = await Proposal.find().populate('rfp vendor');
    res.json(proposals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// get one
router.get('/:id', async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id).populate('rfp vendor');
    if (!proposal) return res.status(404).json({ error: 'Not found' });
    res.json(proposal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;