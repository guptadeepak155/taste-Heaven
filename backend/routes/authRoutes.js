const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// signup
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ success:false, message:'Missing fields' });
  try {
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ success:false, message:'Email already registered' });
    const hash = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hash });
    await user.save();
    res.json({ success:true, message:'Account created' });
  } catch (err) {
    console.error(err); res.status(500).json({ success:false, message:'Server error' });
  }
});

// login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ success:false, message:'Missing fields' });
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ success:false, message:'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ success:false, message:'Invalid credentials' });
    // return minimal user info
    res.json({ success:true, user: { name: user.name, email: user.email } });
  } catch (err) {
    console.error(err); res.status(500).json({ success:false, message:'Server error' });
  }
});

module.exports = router;
