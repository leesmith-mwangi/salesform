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
          SUM(current_stock) as total_stock_units,
          SUM(total_added) as total_added_units,
          SUM(total_distributed) as total_distributed_units
        FROM v_current_stock
      `;
      const stockResult = await client.query(stockQuery);

      // Get distribution summary
      const distributionQuery = `
        SELECT
          COUNT(*) as total_distributions,
          SUM(quantity) as total_units_distributed,
          SUM(total_value) as total_revenue
        FROM distributions
      `;
      const distributionResult = await client.query(distributionQuery);

      // Get total purchase cost
      const purchaseCostQuery = `
        SELECT
          COALESCE(SUM(quantity * purchase_price_per_unit), 0) as total_purchase_cost
        FROM inventory
      `;
      const purchaseCostResult = await client.query(purchaseCostQuery);

      // Get profit summary
      const profitQuery = `
        SELECT
          COALESCE(SUM(d.total_value), 0) as total_revenue,
          COALESCE(SUM(d.quantity * COALESCE(avg_cost.avg_purchase_price, 0)), 0) as total_cost,
          COALESCE(SUM(d.total_value), 0) - COALESCE(SUM(d.quantity * COALESCE(avg_cost.avg_purchase_price, 0)), 0) as total_profit
        FROM distributions d
        LEFT JOIN (
          SELECT 
            product_id,
            AVG(purchase_price_per_unit) as avg_purchase_price
          FROM inventory
          GROUP BY product_id
        ) avg_cost ON d.product_id = avg_cost.product_id
      `;
      const profitResult = await client.query(profitQuery);

      // Get recent activity (last 30 days)
      const recentQuery = `
        SELECT
          COUNT(*) as recent_distributions,
          SUM(quantity) as recent_units,
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
          unit_type,
          total_units_distributed,
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
        purchase_costs: purchaseCostResult.rows[0],
        profit: profitResult.rows[0],
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

  // Get profit analysis by product
  static async getProfitAnalysisByProduct() {
    const query = `
      SELECT
        p.id as product_id,
        p.name as product_name,
        p.unit_type,
        -- Purchase data
        COALESCE(SUM(i.quantity * i.purchase_price_per_unit), 0) as total_purchase_cost,
        COALESCE(AVG(i.purchase_price_per_unit), 0) as avg_purchase_price,
        COALESCE(SUM(i.quantity), 0) as total_purchased_units,
        -- Distribution data
        COALESCE(SUM(d.quantity), 0) as total_distributed_units,
        COALESCE(SUM(d.total_value), 0) as total_revenue,
        COALESCE(AVG(d.price_per_unit), 0) as avg_selling_price,
        -- Profit calculations
        COALESCE(AVG(d.price_per_unit), 0) - COALESCE(AVG(i.purchase_price_per_unit), 0) as margin_per_unit,
        COALESCE(SUM(d.total_value), 0) - COALESCE(SUM(d.quantity * COALESCE(avg_cost.avg_purchase_price, 0)), 0) as total_profit,
        -- Profit percentage
        CASE 
          WHEN COALESCE(SUM(d.quantity * COALESCE(avg_cost.avg_purchase_price, 0)), 0) > 0 
          THEN ((COALESCE(SUM(d.total_value), 0) - COALESCE(SUM(d.quantity * COALESCE(avg_cost.avg_purchase_price, 0)), 0)) / 
                COALESCE(SUM(d.quantity * COALESCE(avg_cost.avg_purchase_price, 0)), 1) * 100)
          ELSE 0 
        END as profit_percentage
      FROM products p
      LEFT JOIN inventory i ON p.id = i.product_id
      LEFT JOIN distributions d ON p.id = d.product_id
      LEFT JOIN (
        SELECT 
          product_id,
          AVG(purchase_price_per_unit) as avg_purchase_price
        FROM inventory
        GROUP BY product_id
      ) avg_cost ON p.id = avg_cost.product_id
      WHERE p.is_active = true
      GROUP BY p.id, p.name, p.unit_type
      HAVING COALESCE(SUM(d.quantity), 0) > 0 OR COALESCE(SUM(i.quantity), 0) > 0
      ORDER BY total_profit DESC
    `;

    const result = await pool.query(query);
    return result.rows;
  }

  // Get overall profit summary
  static async getProfitSummary() {
    const query = `
      SELECT
        -- Total purchase costs
        COALESCE(SUM(i.quantity * i.purchase_price_per_unit), 0) as total_purchase_cost,
        COALESCE(SUM(i.quantity), 0) as total_purchased_units,
        -- Total revenue from distributions
        COALESCE(SUM(d.total_value), 0) as total_revenue,
        COALESCE(SUM(d.quantity), 0) as total_distributed_units,
        -- Cost of goods sold (based on avg purchase price per product)
        COALESCE(SUM(d.quantity * avg_cost.avg_purchase_price), 0) as total_cogs,
        -- Gross profit
        COALESCE(SUM(d.total_value), 0) - COALESCE(SUM(d.quantity * avg_cost.avg_purchase_price), 0) as gross_profit,
        -- Profit margin percentage
        CASE 
          WHEN COALESCE(SUM(d.quantity * avg_cost.avg_purchase_price), 0) > 0 
          THEN ((COALESCE(SUM(d.total_value), 0) - COALESCE(SUM(d.quantity * avg_cost.avg_purchase_price), 0)) / 
                COALESCE(SUM(d.quantity * avg_cost.avg_purchase_price), 1) * 100)
          ELSE 0 
        END as profit_margin_percentage
      FROM (
        SELECT DISTINCT product_id 
        FROM inventory
        UNION
        SELECT DISTINCT product_id 
        FROM distributions
      ) products
      LEFT JOIN inventory i ON products.product_id = i.product_id
      LEFT JOIN distributions d ON products.product_id = d.product_id
      LEFT JOIN (
        SELECT 
          product_id,
          AVG(purchase_price_per_unit) as avg_purchase_price
        FROM inventory
        GROUP BY product_id
      ) avg_cost ON products.product_id = avg_cost.product_id
    `;

    const result = await pool.query(query);
    return result.rows[0];
  }
}

module.exports = Dashboard;
