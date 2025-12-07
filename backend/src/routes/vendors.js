const express = require('express');
const router = express.Router();
const Vendor = require('../models/Vendor');

// Create vendor
router.post('/', async (req, res) => {
  try {
    const vendor = await Vendor.create(req.body);
    res.status(201).json(vendor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List vendors
router.get('/', async (req, res) => {
  try {
    const vendors = await Vendor.find().sort({ name: 1 });
    res.json(vendors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get vendor
router.get('/:id', async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) return res.status(404).json({ error: 'Not found' });
    res.json(vendor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update vendor
router.put('/:id', async (req, res) => {
  try {
    const updated = await Vendor.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete vendor
router.delete('/:id', async (req, res) => {
  try {
    await Vendor.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;