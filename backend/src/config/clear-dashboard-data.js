const pool = require('./database');

async function clearDashboardData() {
  const client = await pool.connect();

  try {
    console.log('\n=== Clearing Dashboard Data ===\n');

    // Start transaction
    await client.query('BEGIN');

    // STEP 1: Clear transactions (has foreign keys to distributions and payments)
    console.log('Step 1: Clearing transactions...');
    const transactionsResult = await client.query('DELETE FROM transactions');
    console.log(`✓ Cleared ${transactionsResult.rowCount} transactions\n`);

    // STEP 2: Clear payments
    console.log('Step 2: Clearing payments...');
    const paymentsResult = await client.query('DELETE FROM payments');
    console.log(`✓ Cleared ${paymentsResult.rowCount} payments\n`);

    // STEP 3: Clear distributions
    console.log('Step 3: Clearing distributions...');
    const distributionsResult = await client.query('DELETE FROM distributions');
    console.log(`✓ Cleared ${distributionsResult.rowCount} distributions\n`);

    // STEP 4: Clear inventory
    console.log('Step 4: Clearing inventory records...');
    const inventoryResult = await client.query('DELETE FROM inventory');
    console.log(`✓ Cleared ${inventoryResult.rowCount} inventory records\n`);

    // Commit transaction
    await client.query('COMMIT');

    // STEP 5: Verify data cleared
    console.log('\n=== Verification ===\n');
    
    const verifyQuery = `
      SELECT
        (SELECT COUNT(*) FROM inventory) as inventory_count,
        (SELECT COUNT(*) FROM distributions) as distributions_count,
        (SELECT COUNT(*) FROM payments) as payments_count,
        (SELECT COUNT(*) FROM transactions) as transactions_count,
        (SELECT COUNT(*) FROM products WHERE is_active = true) as active_products,
        (SELECT COUNT(*) FROM messes) as messes_count,
        (SELECT COUNT(*) FROM attendants) as attendants_count
    `;
    
    const verification = await client.query(verifyQuery);
    const counts = verification.rows[0];
    
    console.log('Current database status:');
    console.log(`  Inventory records: ${counts.inventory_count}`);
    console.log(`  Distributions: ${counts.distributions_count}`);
    console.log(`  Payments: ${counts.payments_count}`);
    console.log(`  Transactions: ${counts.transactions_count}`);
    console.log(`\n  Products (active): ${counts.active_products}`);
    console.log(`  Messes: ${counts.messes_count}`);
    console.log(`  Attendants: ${counts.attendants_count}`);

    console.log('\n=== Dashboard data cleared successfully! ===\n');
    console.log('✅ What was cleared:');
    console.log('  - All inventory stock additions');
    console.log('  - All distributions to messes');
    console.log('  - All payment records');
    console.log('  - All transaction history\n');
    console.log('✅ What was preserved:');
    console.log('  - All products (beers & spirits)');
    console.log('  - All messes');
    console.log('  - All attendants\n');
    console.log('📝 Your dashboard should now show zero values.');
    console.log('   You can start fresh with new stock additions and distributions.\n');

  } catch (error) {
    // Rollback on error
    await client.query('ROLLBACK');
    console.error('Error clearing data:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run if called directly
if (require.main === module) {
  clearDashboardData()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('Clear operation failed:', error);
      process.exit(1);
    });
}

module.exports = clearDashboardData;
