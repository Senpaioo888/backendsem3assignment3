const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const productRoutes = require('./routes/productRoutes');
const labRoutes = require('./routes/labRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend assets for interactive lab management dashboard
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname));

// Primary API Routes - Supports both /api/products (as requested in Assignment 3 PDF)
// and /api/equipment for lab equipment naming convention
app.use('/api/products', productRoutes);
app.use('/api/equipment', productRoutes);

// Smart Lab Domain Specific Routes (Assignments, Repairs, Usage Reports, AI Predictive Maintenance)
app.use('/api', labRoutes);

// Root route redirects to dashboard UI or gives basic API status
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    system: 'Smart Lab Equipment Management & Inventory System',
    timestamp: new Date()
  });
});

// Centralized Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`  Smart Lab Equipment & Inventory Management System    `);
    console.log(`  Server running on port: http://localhost:${PORT}     `);
    console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`=======================================================`);
  });
}

module.exports = app;
