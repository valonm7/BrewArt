require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const giftCardRoutes = require('./routes/giftCardRoutes');
const orderRoutes = require('./routes/orderRoutes');
const menuRoutes = require('./routes/menuRoutes');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// Basic Route
app.get('/', (req, res) => {
  res.send('BrewArt Backend API Running!');
});

// Routes
app.use('/api/users', authRoutes);
app.use('/api/giftcards', giftCardRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/menu', menuRoutes);

const PORT = process.env.PORT || 5001; // Default to 5001 if .env is not set

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT} on all interfaces`);
});

module.exports = app; // For potential testing or if we split server setup