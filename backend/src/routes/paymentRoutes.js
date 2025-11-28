const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// Payment routes
router.get('/', paymentController.getAllPayments);
router.get('/:id', paymentController.getPaymentById);
router.post('/', paymentController.createPayment);
router.put('/:id', paymentController.updatePayment);
router.delete('/:id', paymentController.deletePayment);

// Mess-specific payment routes
router.get('/mess/:messId', paymentController.getPaymentsByMess);
router.get('/mess/:messId/summary', paymentController.getMessFinancialSummary);

// Financial summaries for all messes
router.get('/summaries/all', paymentController.getAllMessFinancialSummaries);

module.exports = router;
