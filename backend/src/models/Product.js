const pool = require('../config/database');

class Product {
  // Get all products
  static async findAll(activeOnly = true) {
    const query = activeOnly
      ? 'SELECT * FROM products WHERE is_active = true ORDER BY name'
      : 'SELECT * FROM products ORDER BY name';

    const result = await pool.query(query);
    return result.rows;
  }

  // Get product by ID
  static async findById(id) {
    const query = 'SELECT * FROM products WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Get product by name
  static async findByName(name) {
    const query = 'SELECT * FROM products WHERE LOWER(name) = LOWER($1)';
    const result = await pool.query(query, [name]);
    return result.rows[0];
  }

  // Create new product
  static async create(productData) {
    const { name, unit_type, units_per_package, description } = productData;

    const query = `
      INSERT INTO products (name, unit_type, units_per_package, description)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const values = [name, unit_type || 'crate', units_per_package || 1, description || null];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Update product
  static async update(id, productData) {
    const { name, unit_type, units_per_package, description, is_active } = productData;

    const query = `
      UPDATE products
      SET
        name = COALESCE($1, name),
        unit_type = COALESCE($2, unit_type),
        units_per_package = COALESCE($3, units_per_package),
        description = COALESCE($4, description),
        is_active = COALESCE($5, is_active),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING *
    `;

    const values = [name, unit_type, units_per_package, description, is_active, id];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Delete product (soft delete)
  static async delete(id) {
    const query = `
      UPDATE products
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Get product with stock information
  static async getWithStock(id) {
    const query = `
      SELECT
        p.*,
        COALESCE(cs.current_stock, 0) as current_stock,
        COALESCE(cs.total_added, 0) as total_added,
        COALESCE(cs.total_distributed, 0) as total_distributed
      FROM products p
      LEFT JOIN v_current_stock cs ON p.id = cs.product_id
      WHERE p.id = $1
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Get all products with stock information
  static async getAllWithStock() {
    const query = `
      SELECT
        p.*,
        COALESCE(cs.current_stock, 0) as current_stock,
        COALESCE(cs.total_added, 0) as total_added,
        COALESCE(cs.total_distributed, 0) as total_distributed
      FROM products p
      LEFT JOIN v_current_stock cs ON p.id = cs.product_id
      WHERE p.is_active = true
      ORDER BY p.name
    `;

    const result = await pool.query(query);
    return result.rows;
  }
}

module.exports = Product;
