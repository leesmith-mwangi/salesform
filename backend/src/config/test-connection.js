const pool = require('./database');

async function testConnection() {
  console.log('\n=== Testing Database Connection ===\n');

  try {
    // Test basic connection
    console.log('1. Testing connection...');
    const client = await pool.connect();
    console.log('   ✓ Connected to PostgreSQL successfully');

    // Test database query
    console.log('\n2. Testing database query...');
    const result = await client.query('SELECT NOW() as current_time');
    console.log('   ✓ Query executed successfully');
    console.log(`   Current server time: ${result.rows[0].current_time}`);

    // Check if tables exist
    console.log('\n3. Checking database tables...');
    const tablesResult = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    if (tablesResult.rows.length === 0) {
      console.log('   ⚠ No tables found. Run setup: node src/config/setup.js');
    } else {
      console.log('   ✓ Found tables:');
      tablesResult.rows.forEach(row => {
        console.log(`     - ${row.table_name}`);
      });
    }

    // Check products
    console.log('\n4. Checking seed data...');
    const productsResult = await client.query('SELECT COUNT(*) as count FROM products');
    console.log(`   Products: ${productsResult.rows[0].count}`);

    const messesResult = await client.query('SELECT COUNT(*) as count FROM messes');
    console.log(`   Messes: ${messesResult.rows[0].count}`);

    // Check views
    console.log('\n5. Checking views...');
    const viewsResult = await client.query(`
      SELECT table_name
      FROM information_schema.views
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    if (viewsResult.rows.length > 0) {
      console.log('   ✓ Found views:');
      viewsResult.rows.forEach(row => {
        console.log(`     - ${row.table_name}`);
      });
    }

    client.release();

    console.log('\n=== ✓ All tests passed! Database is ready ===\n');

  } catch (error) {
    console.error('\n❌ Database connection test failed:');
    console.error('Error:', error.message);

    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Possible solutions:');
      console.error('   1. Make sure PostgreSQL is installed and running');
      console.error('   2. Check your .env file for correct database credentials');
      console.error('   3. Verify PostgreSQL is listening on the specified port');
    } else if (error.code === '3D000') {
      console.error('\n💡 Database does not exist. Create it with:');
      console.error('   sudo -u postgres psql -c "CREATE DATABASE salesform_db;"');
    } else if (error.code === '28P01') {
      console.error('\n💡 Authentication failed. Check your .env file:');
      console.error('   - DB_USER');
      console.error('   - DB_PASSWORD');
    }

    console.error('\n');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  testConnection()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = testConnection;
