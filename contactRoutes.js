// backend/routes/contactRoutes.js
const express = require('express');
const router = express.Router();
const Inquiry = require('../models/Inquiry');

// POST /api/contact
router.post('/', async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) return res.status(400).json({ success:false, message:'Please provide name, email and message' });

  try {
    const inquiry = new Inquiry({ name, email, message });
    await inquiry.save();
    res.json({ success:true, message:'Thank you — we received your enquiry and will respond shortly.' });
  } catch (err) {
    console.error('Contact save error', err);
    res.status(500).json({ success:false, message:'Server error' });
  }
});

module.exports = router;
