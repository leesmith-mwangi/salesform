const Product = require('../models/Product');

// Get all products
exports.getAllProducts = async (req, res, next) => {
  try {
    const { with_stock } = req.query;

    const products = with_stock === 'true'
      ? await Product.getAllWithStock()
      : await Product.findAll();

    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    next(error);
  }
};

// Get single product
exports.getProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { with_stock } = req.query;

    const product = with_stock === 'true'
      ? await Product.getWithStock(id)
      : await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// Create product
exports.createProduct = async (req, res, next) => {
  try {
    const { name, price_per_crate, bottles_per_crate, description } = req.body;

    // Validation
    if (!name || !price_per_crate) {
      return res.status(400).json({
        success: false,
        error: 'Name and price_per_crate are required'
      });
    }

    if (price_per_crate <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Price must be greater than 0'
      });
    }

    // Check if product already exists
    const existing = await Product.findByName(name);
    if (existing) {
      return res.status(409).json({
        success: false,
        error: 'Product with this name already exists'
      });
    }

    const product = await Product.create({
      name,
      price_per_crate,
      bottles_per_crate: bottles_per_crate || 30,
      description
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// Update product
exports.updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, price_per_crate, bottles_per_crate, description, is_active } = req.body;

    // Check if product exists
    const existing = await Product.findById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Validate price if provided
    if (price_per_crate !== undefined && price_per_crate <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Price must be greater than 0'
      });
    }

    // Check for duplicate name if name is being changed
    if (name && name !== existing.name) {
      const duplicate = await Product.findByName(name);
      if (duplicate) {
        return res.status(409).json({
          success: false,
          error: 'Product with this name already exists'
        });
      }
    }

    const product = await Product.update(id, {
      name,
      price_per_crate,
      bottles_per_crate,
      description,
      is_active
    });

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// Delete product (soft delete)
exports.deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    await Product.delete(id);

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
