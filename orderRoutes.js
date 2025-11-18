const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// create order
router.post('/', async (req, res) => {
  const { userEmail, items, total } = req.body;
  if (!userEmail || !items || !items.length) return res.status(400).json({ success:false, message:'Invalid order data' });
  try {
    const order = new Order({ userEmail, items, total });
    await order.save();
    res.json({ success:true, message:'Order placed' });
  } catch (err) {
    console.error(err); res.status(500).json({ success:false, message:'Server error' });
  }
});

// get orders for user
router.get('/:email', async (req, res) => {
  try {
    const orders = await Order.find({ userEmail: req.params.email }).sort({ date: -1 });
    res.json({ success:true, orders });
  } catch (err) {
    console.error(err); res.status(500).json({ success:false, message:'Server error' });
  }
});

module.exports = router;
