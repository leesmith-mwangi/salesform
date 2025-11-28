const Dashboard = require('../models/Dashboard');

// Get complete dashboard metrics
exports.getDashboardMetrics = async (req, res, next) => {
  try {
    const metrics = await Dashboard.getMetrics();

    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    next(error);
  }
};

// Get current stock
exports.getCurrentStock = async (req, res, next) => {
  try {
    const stock = await Dashboard.getCurrentStock();

    res.json({
      success: true,
      data: stock
    });
  } catch (error) {
    next(error);
  }
};

// Get mess summaries
exports.getMessSummaries = async (req, res, next) => {
  try {
    const summaries = await Dashboard.getMessSummaries();

    res.json({
      success: true,
      data: summaries
    });
  } catch (error) {
    next(error);
  }
};

// Get product summaries
exports.getProductSummaries = async (req, res, next) => {
  try {
    const summaries = await Dashboard.getProductSummaries();

    res.json({
      success: true,
      data: summaries
    });
  } catch (error) {
    next(error);
  }
};

// Get revenue by date range
exports.getRevenueByDateRange = async (req, res, next) => {
  try {
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({
        success: false,
        error: 'start_date and end_date are required'
      });
    }

    const revenue = await Dashboard.getRevenueByDateRange(start_date, end_date);

    res.json({
      success: true,
      count: revenue.length,
      data: revenue
    });
  } catch (error) {
    next(error);
  }
};

// Get revenue by mess
exports.getRevenueByMess = async (req, res, next) => {
  try {
    const { start_date, end_date } = req.query;

    const revenue = await Dashboard.getRevenueByMess(start_date, end_date);

    res.json({
      success: true,
      data: revenue
    });
  } catch (error) {
    next(error);
  }
};

// Get revenue by product
exports.getRevenueByProduct = async (req, res, next) => {
  try {
    const { start_date, end_date } = req.query;

    const revenue = await Dashboard.getRevenueByProduct(start_date, end_date);

    res.json({
      success: true,
      data: revenue
    });
  } catch (error) {
    next(error);
  }
};

// Get activity timeline
exports.getActivityTimeline = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const limit = parseInt(req.query.limit) || 50;

    const activity = await Dashboard.getActivityTimeline(days, limit);

    res.json({
      success: true,
      count: activity.length,
      data: activity
    });
  } catch (error) {
    next(error);
  }
};

// Get profit analysis by product
exports.getProfitAnalysisByProduct = async (req, res, next) => {
  try {
    const analysis = await Dashboard.getProfitAnalysisByProduct();

    res.json({
      success: true,
      count: analysis.length,
      data: analysis
    });
  } catch (error) {
    next(error);
  }
};

// Get profit summary
exports.getProfitSummary = async (req, res, next) => {
  try {
    const summary = await Dashboard.getProfitSummary();

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    next(error);
  }
};
