const pool = require('../config/database');

class Inventory {
  // Get all inventory records
  static async findAll(limit = 100, offset = 0) {
    const query = `
      SELECT
        i.*,
        p.name as product_name,
        p.units_per_package,
        p.unit_type
      FROM inventory i
      JOIN products p ON i.product_id = p.id
      ORDER BY i.date_added DESC, i.created_at DESC
      LIMIT $1 OFFSET $2
    `;

    const result = await pool.query(query, [limit, offset]);
    return result.rows;
  }

  // Get inventory by ID
  static async findById(id) {
    const query = `
      SELECT
        i.*,
        p.name as product_name,
        p.units_per_package,
        p.unit_type
      FROM inventory i
      JOIN products p ON i.product_id = p.id
      WHERE i.id = $1
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Get inventory by product
  static async findByProduct(productId, limit = 50) {
    const query = `
      SELECT
        i.*,
        p.name as product_name,
        p.units_per_package,
        p.unit_type
      FROM inventory i
      JOIN products p ON i.product_id = p.id
      WHERE i.product_id = $1
      ORDER BY i.date_added DESC
      LIMIT $2
    `;

    const result = await pool.query(query, [productId, limit]);
    return result.rows;
  }

  // Add stock (create inventory record)
  static async addStock(inventoryData) {
    const {
      product_id,
      quantity,
      purchase_price_per_unit,
      unit_type,
      supplier_name,
      supplier_contact,
      date_added,
      notes
    } = inventoryData;

    const query = `
      INSERT INTO inventory (
        product_id,
        quantity,
        purchase_price_per_unit,
        unit_type,
        supplier_name,
        supplier_contact,
        date_added,
        notes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const values = [
      product_id,
      quantity,
      purchase_price_per_unit || null,
      unit_type || 'crate',
      supplier_name || null,
      supplier_contact || null,
      date_added || new Date(),
      notes || null
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Update inventory record
  static async update(id, inventoryData) {
    const {
      quantity,
      purchase_price_per_unit,
      supplier_name,
      supplier_contact,
      date_added,
      notes
    } = inventoryData;

    const query = `
      UPDATE inventory
      SET
        quantity = COALESCE($1, quantity),
        purchase_price_per_unit = COALESCE($2, purchase_price_per_unit),
        supplier_name = COALESCE($3, supplier_name),
        supplier_contact = COALESCE($4, supplier_contact),
        date_added = COALESCE($5, date_added),
        notes = COALESCE($6, notes),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *
    `;

    const values = [
      quantity,
      purchase_price_per_unit,
      supplier_name,
      supplier_contact,
      date_added,
      notes,
      id
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Delete inventory record
  static async delete(id) {
    const query = 'DELETE FROM inventory WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Get total stock purchased for a product
  static async getTotalPurchased(productId) {
    const query = `
      SELECT COALESCE(SUM(quantity), 0) as total
      FROM inventory
      WHERE product_id = $1
    `;

    const result = await pool.query(query, [productId]);
    return parseInt(result.rows[0].total);
  }

  // Get recent stock additions
  static async getRecentAdditions(days = 30, limit = 50) {
    const query = `
      SELECT
        i.*,
        p.name as product_name,
        p.units_per_package,
        p.unit_type
      FROM inventory i
      JOIN products p ON i.product_id = p.id
      WHERE i.date_added >= CURRENT_DATE - $1
      ORDER BY i.date_added DESC, i.created_at DESC
      LIMIT $2
    `;

    const result = await pool.query(query, [days, limit]);
    return result.rows;
  }

  // Get inventory summary by product
  static async getSummaryByProduct() {
    const query = `
      SELECT
        p.id as product_id,
        p.name as product_name,
        COUNT(i.id) as purchase_count,
        SUM(i.quantity) as total_crates_purchased,
        AVG(i.purchase_price_per_unit) as avg_purchase_price,
        MIN(i.date_added) as first_purchase_date,
        MAX(i.date_added) as last_purchase_date
      FROM products p
      LEFT JOIN inventory i ON p.id = i.product_id
      WHERE p.is_active = true
      GROUP BY p.id, p.name
      ORDER BY p.name
    `;

    const result = await pool.query(query);
    return result.rows;
  }
}

module.exports = Inventory;
