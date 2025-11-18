require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const contactRoutes = require('./routes/contactRoutes');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// serve frontend static files (optional; file-based MPA will work if you open HTML directly)
// If you prefer to serve static from Express: put frontend files under backend/public and uncomment the next line
// app.use(express.static(path.join(__dirname, '..', 'frontend')));

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/restaurant';
mongoose.connect(MONGO_URI, { useNewUrlParser:true, useUnifiedTopology:true })
  .then(()=>console.log('✅ MongoDB connected'))
  .catch(err=>console.error('❌ MongoDB error', err));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// simple root
app.get('/', (req,res) => res.json({ ok:true }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=> console.log(`🚀 Server running on http://localhost:${PORT}`));
// ...
app.use('/api/contact', contactRoutes);
