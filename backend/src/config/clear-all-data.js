const pool = require('./database');

async function clearAllData() {
  const client = await pool.connect();

  try {
    console.log('\n=== CLEARING ALL DATABASE DATA ===\n');
    console.log('⚠️  WARNING: This will delete EVERYTHING including products, messes, and attendants!\n');

    // Start transaction
    await client.query('BEGIN');

    // Clear in order of foreign key dependencies
    console.log('Step 1: Clearing transactions...');
    await client.query('DELETE FROM transactions');
    console.log('✓ Cleared transactions\n');

    console.log('Step 2: Clearing payments...');
    await client.query('DELETE FROM payments');
    console.log('✓ Cleared payments\n');

    console.log('Step 3: Clearing distributions...');
    await client.query('DELETE FROM distributions');
    console.log('✓ Cleared distributions\n');

    console.log('Step 4: Clearing inventory...');
    await client.query('DELETE FROM inventory');
    console.log('✓ Cleared inventory\n');

    console.log('Step 5: Clearing attendants...');
    await client.query('DELETE FROM attendants');
    console.log('✓ Cleared attendants\n');

    console.log('Step 6: Clearing messes...');
    await client.query('DELETE FROM messes');
    console.log('✓ Cleared messes\n');

    console.log('Step 7: Clearing products...');
    await client.query('DELETE FROM products');
    console.log('✓ Cleared products\n');

    // Reset sequences
    console.log('Step 8: Resetting ID sequences...');
    await client.query(`
      ALTER SEQUENCE products_id_seq RESTART WITH 1;
      ALTER SEQUENCE messes_id_seq RESTART WITH 1;
      ALTER SEQUENCE attendants_id_seq RESTART WITH 1;
      ALTER SEQUENCE inventory_id_seq RESTART WITH 1;
      ALTER SEQUENCE distributions_id_seq RESTART WITH 1;
      ALTER SEQUENCE payments_id_seq RESTART WITH 1;
      ALTER SEQUENCE transactions_id_seq RESTART WITH 1;
    `);
    console.log('✓ Reset all ID sequences to 1\n');

    // Commit transaction
    await client.query('COMMIT');

    console.log('\n=== ALL DATA CLEARED! ===\n');
    console.log('⚠️  Database is now completely empty.');
    console.log('📝 To restore basic data, run:');
    console.log('   node src/config/setup.js\n');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error clearing all data:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run if called directly
if (require.main === module) {
  clearAllData()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('Clear operation failed:', error);
      process.exit(1);
    });
}

module.exports = clearAllData;
