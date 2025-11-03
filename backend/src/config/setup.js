const pool = require('./database');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  const client = await pool.connect();

  try {
    console.log('Starting database setup...');

    // Read the schema file
    const schemaSQL = fs.readFileSync(
      path.join(__dirname, 'schema.sql'),
      'utf8'
    );

    // Execute the schema
    await client.query(schemaSQL);

    console.log('✓ Database schema created successfully');
    console.log('✓ Tables: products, messes, inventory, distributions, transactions');
    console.log('✓ Views created for reporting');
    console.log('✓ Seed data inserted (5 beer brands, 3 messes)');
    console.log('Database setup completed successfully!');

  } catch (error) {
    console.error('Error setting up database:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run setup if called directly
if (require.main === module) {
  setupDatabase()
    .then(() => {
      console.log('\n=== Database is ready to use ===\n');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Setup failed:', error);
      process.exit(1);
    });
}

module.exports = setupDatabase;
