require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const farmerRoutes = require('./routes/farmer');
const processorRoutes = require('./routes/processor');
const distributorRoutes = require('./routes/distributor');
const retailerRoutes = require('./routes/retailer');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // increased limit for base64 images

// Auth & Profile routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);

// Supply chain role routes
app.use('/api/v1/farmer', farmerRoutes);
app.use('/api/v1/processor', processorRoutes);
app.use('/api/v1/distributor', distributorRoutes);
app.use('/api/v1/retailer', retailerRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB Atlas');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

