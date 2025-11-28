const pool = require('./src/config/database');

async function clearTestData() {
  const client = await pool.connect();

  try {
    console.log('🗑️  Clearing test data...\n');

    await client.query('BEGIN');

    // 1. Clear payments (if any)
    const payments = await client.query('DELETE FROM payments RETURNING id');
    console.log(`✅ Deleted ${payments.rowCount} payments`);

    // 2. Clear distributions
    const distributions = await client.query('DELETE FROM distributions RETURNING id');
    console.log(`✅ Deleted ${distributions.rowCount} distributions`);

    // 3. Clear inventory
    const inventory = await client.query('DELETE FROM inventory RETURNING id');
    console.log(`✅ Deleted ${inventory.rowCount} inventory records`);

    // 4. Clear sessions (if any)
    const sessions = await client.query('DELETE FROM sessions RETURNING id');
    console.log(`✅ Deleted ${sessions.rowCount} sessions`);

    // 5. Clear audit logs (if any)
    const audits = await client.query('DELETE FROM audit_logs RETURNING id');
    console.log(`✅ Deleted ${audits.rowCount} audit logs`);

    await client.query('COMMIT');

    console.log('\n═══════════════════════════════════════════════');
    console.log('✅ TEST DATA CLEARED SUCCESSFULLY!');
    console.log('═══════════════════════════════════════════════');
    console.log('\n📝 What was cleared:');
    console.log('   ✓ All distributions');
    console.log('   ✓ All inventory records');
    console.log('   ✓ All payments');
    console.log('   ✓ All sessions');
    console.log('   ✓ All audit logs');
    console.log('\n📋 What was kept:');
    console.log('   ✓ Products (beer brands)');
    console.log('   ✓ Messes');
    console.log('   ✓ Users (admin account)');
    console.log('   ✓ Attendants');
    console.log('\n💡 You can now start fresh with clean data!');
    console.log('═══════════════════════════════════════════════\n');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error clearing data:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

// Run the script
clearTestData()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed:', error);
    process.exit(1);
  });
