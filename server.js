const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Allows the server to accept JSON data payloads

// MongoDB Cloud Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('🚀 Connected to MongoDB Cloud Database'))
  .catch(err => console.error('❌ Database connection error:', err));

// 1. Define the Invoice Schema structure based on your UI fields
const invoiceSchema = new mongoose.Schema({
  client: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' }, // <--- Add this new line!
  status: { type: String, default: 'on_track' },
  due: { type: String, default: '2026-09-01' },
  stage: { type: String, default: 'Stage 0: Awaiting Payment' }
});

const Invoice = mongoose.model('Invoice', invoiceSchema);

// 2. API Routes
// GET: Fetch all invoices from the database
app.get('/api/invoices', async (req, res) => {
  try {
    const invoices = await Invoice.find();
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST: Add a brand new invoice to the database
app.post('/api/invoices', async (req, res) => {
  try {
    const newInvoice = new Invoice(req.body);
    const savedInvoice = await newInvoice.save();
    res.status(201).json(savedInvoice);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Start Server Listening
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`📡 Server running smoothly on port ${PORT}`);
});