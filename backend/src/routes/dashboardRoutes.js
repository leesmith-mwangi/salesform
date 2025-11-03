const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// Dashboard routes
router.get('/metrics', dashboardController.getDashboardMetrics);
router.get('/stock', dashboardController.getCurrentStock);
router.get('/messes', dashboardController.getMessSummaries);
router.get('/products', dashboardController.getProductSummaries);
router.get('/revenue', dashboardController.getRevenueByDateRange);
router.get('/revenue/mess', dashboardController.getRevenueByMess);
router.get('/revenue/product', dashboardController.getRevenueByProduct);
router.get('/activity', dashboardController.getActivityTimeline);

module.exports = router;
