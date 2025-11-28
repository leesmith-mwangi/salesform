const pool = require('./database');

async function checkSchema() {
  const client = await pool.connect();

  try {
    console.log('\n=== Checking Database Schema ===\n');

    // Check inventory table
    console.log('--- INVENTORY TABLE ---');
    const inventoryColumns = await client.query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'inventory'
      ORDER BY ordinal_position
    `);
    inventoryColumns.rows.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type}`);
    });

    // Check distributions table
    console.log('\n--- DISTRIBUTIONS TABLE ---');
    const distributionsColumns = await client.query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'distributions'
      ORDER BY ordinal_position
    `);
    distributionsColumns.rows.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type}`);
    });

    // Check products table
    console.log('\n--- PRODUCTS TABLE ---');
    const productsColumns = await client.query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'products'
      ORDER BY ordinal_position
    `);
    productsColumns.rows.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type}`);
    });

    console.log('\n');

  } catch (error) {
    console.error('Error checking schema:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run if called directly
if (require.main === module) {
  checkSchema()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('Check failed:', error);
      process.exit(1);
    });
}

module.exports = checkSchema;
