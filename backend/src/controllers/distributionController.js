const Distribution = require('../models/Distribution');
const Product = require('../models/Product');
const Mess = require('../models/Mess');

// Get all distributions
exports.getAllDistributions = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;

    const distributions = await Distribution.findAll(limit, offset);

    res.json({
      success: true,
      count: distributions.length,
      data: distributions
    });
  } catch (error) {
    next(error);
  }
};

// Get single distribution
exports.getDistribution = async (req, res, next) => {
  try {
    const { id } = req.params;

    const distribution = await Distribution.findById(id);

    if (!distribution) {
      return res.status(404).json({
        success: false,
        error: 'Distribution not found'
      });
    }

    res.json({
      success: true,
      data: distribution
    });
  } catch (error) {
    next(error);
  }
};

// Get distributions by mess
exports.getDistributionsByMess = async (req, res, next) => {
  try {
    const { messId } = req.params;
    const limit = parseInt(req.query.limit) || 100;

    const distributions = await Distribution.findByMess(messId, limit);
    console.log("distributions:", distributions);

    res.json({
      success: true,
      count: distributions.length,
      data: distributions
    });
  } catch (error) {
    next(error);
  }
};

// Get distributions by product
exports.getDistributionsByProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const limit = parseInt(req.query.limit) || 100;

    const distributions = await Distribution.findByProduct(productId, limit);


    res.json({
      success: true,
      count: distributions.length,
      data: distributions
    });
  } catch (error) {
    next(error);
  }
};

// Create distribution
exports.createDistribution = async (req, res, next) => {
  try {
    const {
      mess_id,
      product_id,
      quantity,
      price_per_unit,
      unit_type,
      attendant_id,
      distribution_date,
      notes
    } = req.body;

    // Validation
    if (!mess_id || !product_id || !quantity || !price_per_unit) {
      return res.status(400).json({
        success: false,
        error: 'mess_id, product_id, quantity, and price_per_unit are required'
      });
    }

    if (quantity <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Quantity must be greater than 0'
      });
    }

    if (price_per_unit <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Price must be greater than 0'
      });
    }

    // Check if product exists
    const product = await Product.findById(product_id);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Check if mess exists
    const mess = await Mess.findById(mess_id);
    if (!mess) {
      return res.status(404).json({
        success: false,
        error: 'Mess not found'
      });
    }

    // Create distribution (includes stock validation in the model)
    const distribution = await Distribution.create({
      mess_id,
      product_id,
      quantity,
      price_per_unit,
      unit_type: unit_type || product.unit_type,
      attendant_id: attendant_id || null,
      distribution_date,
      notes
    });

    // Get updated stock info
    const updatedProduct = await Product.getWithStock(product_id);

    const unitLabel = product.unit_type === 'piece' ? 'pieces' : 'crates';

    res.status(201).json({
      success: true,
      message: `Distributed ${quantity} ${unitLabel} of ${product.name} to ${mess.name}`,
      data: {
        distribution,
        updated_stock: {
          product_name: updatedProduct.name,
          current_stock: updatedProduct.current_stock,
          total_distributed: updatedProduct.total_distributed
        }
      }
    });
  } catch (error) {
    // Handle insufficient stock error
    if (error.message.includes('Insufficient stock')) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
    next(error);
  }
};

// Update distribution
exports.updateDistribution = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      mess_id,
      product_id,
      quantity,
      price_per_unit,
      distribution_date,
      notes
    } = req.body;

    // Check if distribution exists
    const existing = await Distribution.findById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Distribution not found'
      });
    }

    // Validate quantity if provided
    if (quantity !== undefined && quantity <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Quantity must be greater than 0'
      });
    }

    // Validate price if provided
    if (price_per_unit !== undefined && price_per_unit <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Price must be greater than 0'
      });
    }

    const distribution = await Distribution.update(id, {
      mess_id,
      product_id,
      quantity,
      price_per_unit,
      distribution_date,
      notes
    });

    res.json({
      success: true,
      message: 'Distribution updated successfully',
      data: distribution
    });
  } catch (error) {
    next(error);
  }
};

// Delete distribution
exports.deleteDistribution = async (req, res, next) => {
  try {
    const { id } = req.params;

    const distribution = await Distribution.findById(id);
    if (!distribution) {
      return res.status(404).json({
        success: false,
        error: 'Distribution not found'
      });
    }

    await Distribution.delete(id);

    res.json({
      success: true,
      message: 'Distribution deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get recent distributions
exports.getRecentDistributions = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const limit = parseInt(req.query.limit) || 50;

    const distributions = await Distribution.getRecentDistributions(days, limit);

    res.json({
      success: true,
      count: distributions.length,
      data: distributions
    });
  } catch (error) {
    next(error);
  }
};

// Get distribution summary by date range
exports.getDistributionSummary = async (req, res, next) => {
  try {
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({
        success: false,
        error: 'start_date and end_date are required'
      });
    }

    const summary = await Distribution.getSummaryByDateRange(start_date, end_date);

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    next(error);
  }
};

// Get detailed distributions grouped by mess with product breakdown
exports.getDetailedDistributionsByMess = async (req, res, next) => {
  try {
    const messDetails = await Distribution.getDetailedByMess();

    res.json({
      success: true,
      count: messDetails.length,
      data: messDetails
    });
  } catch (error) {
    next(error);
  }
};
