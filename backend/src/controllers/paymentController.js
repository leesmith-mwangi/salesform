const Payment = require('../models/Payment');

// Get all payments
exports.getAllPayments = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;

    const payments = await Payment.findAll(limit, offset);

    res.json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error) {
    next(error);
  }
};

// Get single payment
exports.getPaymentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const payment = await Payment.findById(id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found'
      });
    }

    res.json({
      success: true,
      data: payment
    });
  } catch (error) {
    next(error);
  }
};

// Get payments by mess
exports.getPaymentsByMess = async (req, res, next) => {
  try {
    const { messId } = req.params;
    const limit = parseInt(req.query.limit) || 100;

    const payments = await Payment.findByMess(messId, limit);

    res.json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error) {
    next(error);
  }
};

// Create payment
exports.createPayment = async (req, res, next) => {
  try {
    const { mess_id, amount_paid, payment_date, payment_method, reference_number, notes } = req.body;

    // Validation
    if (!mess_id || !amount_paid) {
      return res.status(400).json({
        success: false,
        error: 'mess_id and amount_paid are required'
      });
    }

    if (amount_paid <= 0) {
      return res.status(400).json({
        success: false,
        error: 'amount_paid must be greater than 0'
      });
    }

    const payment = await Payment.create({
      mess_id,
      amount_paid,
      payment_date,
      payment_method,
      reference_number,
      notes
    });

    res.status(201).json({
      success: true,
      message: 'Payment recorded successfully',
      data: payment
    });
  } catch (error) {
    next(error);
  }
};

// Update payment
exports.updatePayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const payment = await Payment.update(id, updateData);

    if (!payment) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found'
      });
    }

    res.json({
      success: true,
      message: 'Payment updated successfully',
      data: payment
    });
  } catch (error) {
    next(error);
  }
};

// Delete payment
exports.deletePayment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const payment = await Payment.delete(id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found'
      });
    }

    res.json({
      success: true,
      message: 'Payment deleted successfully',
      data: payment
    });
  } catch (error) {
    next(error);
  }
};

// Get mess financial summary
exports.getMessFinancialSummary = async (req, res, next) => {
  try {
    const { messId } = req.params;

    const summary = await Payment.getMessFinancialSummary(messId);

    if (!summary) {
      return res.status(404).json({
        success: false,
        error: 'Mess not found'
      });
    }

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    next(error);
  }
};

// Get all mess financial summaries
exports.getAllMessFinancialSummaries = async (req, res, next) => {
  try {
    const summaries = await Payment.getAllMessFinancialSummaries();

    res.json({
      success: true,
      count: summaries.length,
      data: summaries
    });
  } catch (error) {
    next(error);
  }
};
