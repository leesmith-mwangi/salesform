const pool = require('./database');

async function updateViews() {
  const client = await pool.connect();

  try {
    console.log('\n=== Updating Database Views ===\n');

    // Drop existing views
    console.log('Dropping old views...');
    await client.query(`
      DROP VIEW IF EXISTS v_product_distribution_summary CASCADE;
      DROP VIEW IF EXISTS v_mess_distribution_summary CASCADE;
    `);
    console.log('✓ Old views dropped\n');

    // Create v_product_distribution_summary view
    console.log('Creating v_product_distribution_summary...');
    await client.query(`
      CREATE VIEW v_product_distribution_summary AS
      SELECT 
        p.id AS product_id,
        p.name AS product_name,
        p.unit_type,
        COUNT(d.id) AS distribution_count,
        COALESCE(SUM(d.quantity), 0) AS total_units_distributed,
        COALESCE(SUM(d.total_value), 0) AS total_revenue
      FROM products p
      LEFT JOIN distributions d ON p.id = d.product_id
      WHERE p.is_active = true
      GROUP BY p.id, p.name, p.unit_type
      ORDER BY total_revenue DESC;
    `);
    console.log('✓ v_product_distribution_summary created\n');

    // Create v_mess_distribution_summary view
    console.log('Creating v_mess_distribution_summary...');
    await client.query(`
      CREATE VIEW v_mess_distribution_summary AS
      SELECT 
        m.id AS mess_id,
        m.name AS mess_name,
        m.contact_person,
        m.phone,
        COUNT(d.id) AS distribution_count,
        COALESCE(SUM(d.quantity), 0) AS total_units_received,
        COALESCE(SUM(d.total_value), 0) AS total_value,
        MAX(d.distribution_date) AS last_distribution_date
      FROM messes m
      LEFT JOIN distributions d ON m.id = d.mess_id
      WHERE m.is_active = true
      GROUP BY m.id, m.name, m.contact_person, m.phone
      ORDER BY total_value DESC;
    `);
    console.log('✓ v_mess_distribution_summary created\n');

    // Verify views
    console.log('Verifying views...');
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.views 
      WHERE table_schema = 'public' 
      AND table_name LIKE 'v_%'
      ORDER BY table_name
    `);
    
    console.log('\n=== Current Views ===');
    result.rows.forEach(row => {
      console.log(`  ✓ ${row.table_name}`);
    });

    console.log('\n=== Views updated successfully! ===\n');

  } catch (error) {
    console.error('Error updating views:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run if called directly
if (require.main === module) {
  updateViews()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('Update failed:', error);
      process.exit(1);
    });
}

module.exports = updateViews;
