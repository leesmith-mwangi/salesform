const pool = require('./database');
const fs = require('fs');
const path = require('path');

async function addPaymentsFeature() {
  const client = await pool.connect();

  try {
    console.log('Adding payment tracking feature...\n');

    // Read the migration SQL file
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, 'add-payments.sql'),
      'utf8'
    );

    // Execute the migration
    await client.query(migrationSQL);

    console.log('✓ Payments table created');
    console.log('✓ Financial summary view created');
    console.log('✓ Indexes and triggers added');

    console.log('\n=== Payment tracking feature added successfully! ===\n');

  } catch (error) {
    console.error('Error adding payment feature:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run migration if called directly
if (require.main === module) {
  addPaymentsFeature()
    .then(() => {
      console.log('Migration completed!\n');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = addPaymentsFeature;
