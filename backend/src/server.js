const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import routes
const productRoutes = require('./routes/productRoutes');
const messRoutes = require('./routes/messRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const distributionRoutes = require('./routes/distributionRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware (development)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// Basic health check route
app.get('/', (req, res) => {
  res.json({
    message: 'Sales & Distribution Management System API',
    status: 'running',
    version: '2.0.0',
    endpoints: {
      products: '/api/products',
      messes: '/api/messes',
      inventory: '/api/inventory',
      distributions: '/api/distributions',
      dashboard: '/api/dashboard'
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    database: 'connected'
  });
});

// API Routes
app.use('/api/products', productRoutes);
app.use('/api/messes', messRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/distributions', distributionRoutes);
app.use('/api/dashboard', dashboardRoutes);

// 404 handler (must be after all routes)
app.use(notFound);

// Error handler (must be last)
app.use(errorHandler);

// Start server
// Bind to 0.0.0.0 for Railway and other cloud platforms
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Server is running on port ${PORT}`);
  console.log(`📍 API endpoint: http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/\n`);
});

module.exports = app;
