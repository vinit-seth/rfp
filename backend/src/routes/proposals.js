const express = require('express');
const router = express.Router();
const Proposal = require('../models/Proposal');

/**
 * GET /proposals
 *
 * Returns proposals that are linked to:
 *
 * 1. A valid RFP
 * 2. A registered vendor
 *
 * Newest proposals are returned first.
 */
router.get('/', async (req, res) => {
  try {
    const proposals = await Proposal.find({
      rfp: { $ne: null },
      vendor: { $ne: null },
    })
      .populate('rfp')
      .populate('vendor')
      .sort({ createdAt: -1 })
      .lean();

    //    const proposals = await Proposal.find({}).populate('vendor').populate('rfp').sort({ createdAt: -1 });

    /*
     * Populate can return null if a referenced document
     * has been removed.
     *
     * Don't expose orphaned proposals to the UI.
     */
    const validProposals = proposals.filter(
      (proposal) =>
        proposal.rfp &&
        proposal.vendor
    );

    res.json(validProposals);
  } catch (err) {
    console.error(
      'List proposals error:',
      err
    );

    res.status(500).json({
      error: err.message,
    });
  }
});

/**
 * GET /proposals/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const proposal =
      await Proposal.findById(
        req.params.id
      )
        .populate('rfp')
        .populate('vendor')
        .lean();

    if (!proposal) {
      return res.status(404).json({
        error: 'Proposal not found',
      });
    }

    res.json(proposal);
  } catch (err) {
    console.error(
      'Get proposal error:',
      err
    );

    res.status(500).json({
      error: err.message,
    });
  }
});

module.exports = router;