const pool = require('../config/database');

class Dashboard {
  // Get complete dashboard metrics
  static async getMetrics() {
    const client = await pool.connect();

    try {
      // Get current stock summary
      const stockQuery = `
        SELECT
          COUNT(*) as total_products,
          SUM(current_stock) as total_stock_crates,
          SUM(total_purchased) as total_purchased_crates,
          SUM(total_distributed) as total_distributed_crates
        FROM v_current_stock
      `;
      const stockResult = await client.query(stockQuery);

      // Get distribution summary
      const distributionQuery = `
        SELECT
          COUNT(*) as total_distributions,
          SUM(quantity_crates) as total_crates_distributed,
          SUM(total_value) as total_revenue
        FROM distributions
      `;
      const distributionResult = await client.query(distributionQuery);

      // Get recent activity (last 30 days)
      const recentQuery = `
        SELECT
          COUNT(*) as recent_distributions,
          SUM(quantity_crates) as recent_crates,
          SUM(total_value) as recent_revenue
        FROM distributions
        WHERE distribution_date >= CURRENT_DATE - 30
      `;
      const recentResult = await client.query(recentQuery);

      // Get low stock products (less than 10 crates)
      const lowStockQuery = `
        SELECT
          product_id,
          product_name,
          current_stock
        FROM v_current_stock
        WHERE current_stock < 10
        ORDER BY current_stock ASC
      `;
      const lowStockResult = await client.query(lowStockQuery);

      // Get top products by revenue
      const topProductsQuery = `
        SELECT
          product_id,
          product_name,
          total_crates_distributed,
          total_revenue
        FROM v_product_distribution_summary
        ORDER BY total_revenue DESC
        LIMIT 5
      `;
      const topProductsResult = await client.query(topProductsQuery);

      // Get mess summaries
      const messQuery = `
        SELECT * FROM v_mess_distribution_summary
        ORDER BY total_value DESC
      `;
      const messResult = await client.query(messQuery);

      return {
        stock: stockResult.rows[0],
        distributions: distributionResult.rows[0],
        recent_activity: recentResult.rows[0],
        low_stock_alerts: lowStockResult.rows,
        top_products: topProductsResult.rows,
        mess_summaries: messResult.rows
      };

    } finally {
      client.release();
    }
  }

  // Get current stock details
  static async getCurrentStock() {
    const query = 'SELECT * FROM v_current_stock ORDER BY product_name';
    const result = await pool.query(query);
    return result.rows;
  }

  // Get mess distribution summaries
  static async getMessSummaries() {
    const query = 'SELECT * FROM v_mess_distribution_summary ORDER BY mess_name';
    const result = await pool.query(query);
    return result.rows;
  }

  // Get product distribution summaries
  static async getProductSummaries() {
    const query = 'SELECT * FROM v_product_distribution_summary ORDER BY total_revenue DESC';
    const result = await pool.query(query);
    return result.rows;
  }

  // Get revenue by date range
  static async getRevenueByDateRange(startDate, endDate) {
    const query = `
      SELECT
        distribution_date,
        COUNT(*) as distribution_count,
        SUM(quantity_crates) as total_crates,
        SUM(total_value) as daily_revenue
      FROM distributions
      WHERE distribution_date BETWEEN $1 AND $2
      GROUP BY distribution_date
      ORDER BY distribution_date DESC
    `;

    const result = await pool.query(query, [startDate, endDate]);
    return result.rows;
  }

  // Get revenue by mess
  static async getRevenueByMess(startDate = null, endDate = null) {
    let query = `
      SELECT
        m.id as mess_id,
        m.name as mess_name,
        COUNT(d.id) as distribution_count,
        SUM(d.quantity_crates) as total_crates,
        SUM(d.total_value) as total_revenue
      FROM messes m
      LEFT JOIN distributions d ON m.id = d.mess_id
    `;

    const values = [];
    if (startDate && endDate) {
      query += ' WHERE d.distribution_date BETWEEN $1 AND $2';
      values.push(startDate, endDate);
    }

    query += `
      GROUP BY m.id, m.name
      ORDER BY total_revenue DESC NULLS LAST
    `;

    const result = await pool.query(query, values);
    return result.rows;
  }

  // Get revenue by product
  static async getRevenueByProduct(startDate = null, endDate = null) {
    let query = `
      SELECT
        p.id as product_id,
        p.name as product_name,
        COUNT(d.id) as distribution_count,
        SUM(d.quantity_crates) as total_crates,
        SUM(d.total_value) as total_revenue,
        AVG(d.price_per_crate) as avg_price_per_crate
      FROM products p
      LEFT JOIN distributions d ON p.id = d.product_id
    `;

    const values = [];
    if (startDate && endDate) {
      query += ' WHERE d.distribution_date BETWEEN $1 AND $2';
      values.push(startDate, endDate);
    }

    query += `
      GROUP BY p.id, p.name
      ORDER BY total_revenue DESC NULLS LAST
    `;

    const result = await pool.query(query, values);
    return result.rows;
  }

  // Get activity timeline (recent distributions)
  static async getActivityTimeline(days = 7, limit = 50) {
    const query = `
      SELECT
        d.id,
        d.distribution_date,
        d.quantity_crates,
        d.total_value,
        p.name as product_name,
        m.name as mess_name,
        d.created_at
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
}

module.exports = Dashboard;
