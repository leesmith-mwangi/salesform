const pool = require('../config/database');

class Distribution {
  // Get all distributions
  static async findAll(limit = 100, offset = 0) {
    const query = `
      SELECT
        d.*,
        p.name as product_name,
        p.units_per_package,
        p.unit_type,
        m.name as mess_name,
        m.location as mess_location
      FROM distributions d
      JOIN products p ON d.product_id = p.id
      JOIN messes m ON d.mess_id = m.id
      ORDER BY d.distribution_date DESC, d.created_at DESC
      LIMIT $1 OFFSET $2
    `;

    const result = await pool.query(query, [limit, offset]);
    return result.rows;
  }

  // Get distribution by ID
  static async findById(id) {
    const query = `
      SELECT
        d.*,
        p.name as product_name,
        p.units_per_package,
        p.unit_type,
        m.name as mess_name,
        m.location as mess_location,
        m.contact_person,
        m.phone
      FROM distributions d
      JOIN products p ON d.product_id = p.id
      JOIN messes m ON d.mess_id = m.id
      WHERE d.id = $1
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Get distributions by mess
  static async findByMess(messId, limit = 100) {
    const query = `
      SELECT
        d.*,
        p.name as product_name,
        p.units_per_package,
        p.unit_type
      FROM distributions d
      JOIN products p ON d.product_id = p.id
      WHERE d.mess_id = $1
      ORDER BY d.distribution_date DESC
      LIMIT $2
    `;

    const result = await pool.query(query, [messId, limit]);
    return result.rows;
  }

  // Get distributions by product
  static async findByProduct(productId, limit = 100) {
    const query = `
      SELECT
        d.*,
        m.name as mess_name,
        m.location as mess_location
      FROM distributions d
      JOIN messes m ON d.mess_id = m.id
      WHERE d.product_id = $1
      ORDER BY d.distribution_date DESC
      LIMIT $2
    `;

    const result = await pool.query(query, [productId, limit]);
    return result.rows;
  }

  // Create distribution (with stock validation)
  static async create(distributionData) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const {
        mess_id,
        product_id,
        quantity,
        price_per_unit,
        unit_type,
        attendant_id,
        distribution_date,
        notes
      } = distributionData;

      // Check available stock
      const stockQuery = `
        SELECT get_available_stock($1) as available_stock
      `;
      const stockResult = await client.query(stockQuery, [product_id]);
      const availableStock = parseInt(stockResult.rows[0].available_stock);

      if (availableStock < quantity) {
        const unitLabel = unit_type === 'piece' ? 'pieces' : 'crates';
        throw new Error(
          `Insufficient stock. Available: ${availableStock} ${unitLabel}, Requested: ${quantity} ${unitLabel}`
        );
      }

      // Create distribution
      const insertQuery = `
        INSERT INTO distributions (
          mess_id,
          product_id,
          quantity,
          price_per_unit,
          unit_type,
          attendant_id,
          distribution_date,
          notes
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `;

      const values = [
        mess_id,
        product_id,
        quantity,
        price_per_unit,
        unit_type || 'crate',
        attendant_id || null,
        distribution_date || new Date(),
        notes || null
      ];

      const result = await client.query(insertQuery, values);

      await client.query('COMMIT');
      return result.rows[0];

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Update distribution
  static async update(id, distributionData) {
    const {
      mess_id,
      product_id,
      quantity,
      price_per_unit,
      distribution_date,
      notes
    } = distributionData;

    const query = `
      UPDATE distributions
      SET
        mess_id = COALESCE($1, mess_id),
        product_id = COALESCE($2, product_id),
        quantity = COALESCE($3, quantity),
        price_per_unit = COALESCE($4, price_per_unit),
        distribution_date = COALESCE($5, distribution_date),
        notes = COALESCE($6, notes),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *
    `;

    const values = [
      mess_id,
      product_id,
      quantity,
      price_per_unit,
      distribution_date,
      notes,
      id
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Delete distribution
  static async delete(id) {
    const query = 'DELETE FROM distributions WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Get total distributed for a product
  static async getTotalDistributed(productId) {
    const query = `
      SELECT COALESCE(SUM(quantity), 0) as total
      FROM distributions
      WHERE product_id = $1
    `;

    const result = await pool.query(query, [productId]);
    return parseInt(result.rows[0].total);
  }

  // Get recent distributions
  static async getRecentDistributions(days = 30, limit = 50) {
    const query = `
      SELECT
        d.*,
        p.name as product_name,
        m.name as mess_name
      FROM distributions d
      JOIN products p ON d.product_id = p.id
      JOIN messes m ON d.mess_id = m.id
      WHERE d.distribution_date >= CURRENT_DATE - $1
      ORDER BY d.distribution_date DESC, d.created_at DESC
      LIMIT $2
    `;

    const result = await pool.query(query, [days, limit]);
    return result.rows;
  }

  // Get distribution summary by date range
  static async getSummaryByDateRange(startDate, endDate) {
    const query = `
      SELECT
        COUNT(d.id) as total_distributions,
        SUM(d.quantity) as total_crates,
        SUM(d.total_value) as total_revenue,
        COUNT(DISTINCT d.mess_id) as messes_served,
        COUNT(DISTINCT d.product_id) as products_distributed
      FROM distributions d
      WHERE d.distribution_date BETWEEN $1 AND $2
    `;

    const result = await pool.query(query, [startDate, endDate]);
    return result.rows[0];
  }

  // Get detailed distributions grouped by mess with product breakdown
  static async getDetailedByMess() {
    const query = `
      SELECT
        m.id as mess_id,
        m.name as mess_name,
        m.location as mess_location,
        COUNT(DISTINCT d.id) as total_distributions,
        SUM(d.quantity) as total_crates,
        SUM(d.total_value) as total_value,
        json_agg(
          json_build_object(
            'product_id', p.id,
            'product_name', p.name,
            'quantity', d.quantity,
            'price_per_unit', d.price_per_unit,
            'total_value', d.total_value,
            'distribution_date', d.distribution_date,
            'unit_type', d.unit_type
          ) ORDER BY p.name
        ) FILTER (WHERE d.id IS NOT NULL) as products
      FROM messes m
      LEFT JOIN distributions d ON m.id = d.mess_id
      LEFT JOIN products p ON d.product_id = p.id
      WHERE m.is_active = true
      GROUP BY m.id, m.name, m.location
      ORDER BY m.name
    `;

    const result = await pool.query(query);
    return result.rows;
  }
}

module.exports = Distribution;
