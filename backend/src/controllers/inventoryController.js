const Inventory = require('../models/Inventory');
const Product = require('../models/Product');

// Get all inventory records
exports.getAllInventory = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;

    const inventory = await Inventory.findAll(limit, offset);

    res.json({
      success: true,
      count: inventory.length,
      data: inventory
    });
  } catch (error) {
    next(error);
  }
};

// Get inventory by ID
exports.getInventory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const inventory = await Inventory.findById(id);

    if (!inventory) {
      return res.status(404).json({
        success: false,
        error: 'Inventory record not found'
      });
    }

    res.json({
      success: true,
      data: inventory
    });
  } catch (error) {
    next(error);
  }
};

// Get inventory by product
exports.getInventoryByProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const limit = parseInt(req.query.limit) || 50;

    const inventory = await Inventory.findByProduct(productId, limit);

    res.json({
      success: true,
      count: inventory.length,
      data: inventory
    });
  } catch (error) {
    next(error);
  }
};

// Add stock
exports.addStock = async (req, res, next) => {
  try {
    const {
      product_id,
      quantity,
      purchase_price_per_unit,
      unit_type,
      supplier_name,
      supplier_contact,
      date_added,
      notes
    } = req.body;

    // Validation
    if (!product_id || !quantity) {
      return res.status(400).json({
        success: false,
        error: 'product_id and quantity are required'
      });
    }

    if (quantity <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Quantity must be greater than 0'
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

    const inventory = await Inventory.addStock({
      product_id,
      quantity,
      purchase_price_per_unit,
      unit_type: unit_type || product.unit_type,
      supplier_name,
      supplier_contact,
      date_added,
      notes
    });

    // Get updated product with stock info
    const updatedProduct = await Product.getWithStock(product_id);

    const unitLabel = product.unit_type === 'piece' ? 'pieces' : 'crates';

    res.status(201).json({
      success: true,
      message: `Added ${quantity} ${unitLabel} of ${product.name} to inventory`,
      data: {
        inventory,
        updated_stock: {
          product_name: updatedProduct.name,
          current_stock: updatedProduct.current_stock,
          total_added: updatedProduct.total_added
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update inventory record
exports.updateInventory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      quantity,
      purchase_price_per_unit,
      supplier_name,
      supplier_contact,
      date_added,
      notes
    } = req.body;

    // Check if inventory record exists
    const existing = await Inventory.findById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Inventory record not found'
      });
    }

    // Validate quantity if provided
    if (quantity !== undefined && quantity <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Quantity must be greater than 0'
      });
    }

    const inventory = await Inventory.update(id, {
      quantity,
      purchase_price_per_unit,
      supplier_name,
      supplier_contact,
      date_added,
      notes
    });

    res.json({
      success: true,
      message: 'Inventory record updated successfully',
      data: inventory
    });
  } catch (error) {
    next(error);
  }
};

// Delete inventory record
exports.deleteInventory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const inventory = await Inventory.findById(id);
    if (!inventory) {
      return res.status(404).json({
        success: false,
        error: 'Inventory record not found'
      });
    }

    await Inventory.delete(id);

    res.json({
      success: true,
      message: 'Inventory record deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get recent stock additions
exports.getRecentAdditions = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const limit = parseInt(req.query.limit) || 50;

    const inventory = await Inventory.getRecentAdditions(days, limit);

    res.json({
      success: true,
      count: inventory.length,
      data: inventory
    });
  } catch (error) {
    next(error);
  }
};

// Get inventory summary by product
exports.getInventorySummary = async (req, res, next) => {
  try {
    const summary = await Inventory.getSummaryByProduct();

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    next(error);
  }
};
