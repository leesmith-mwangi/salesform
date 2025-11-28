const pool = require('./src/config/database');

async function clearAllData() {
  const client = await pool.connect();

  try {
    console.log('⚠️  CLEARING ALL DATA (INCLUDING PRODUCTS & MESSES)...\n');

    await client.query('BEGIN');

    // 1. Clear payments
    const payments = await client.query('DELETE FROM payments RETURNING id');
    console.log(`✅ Deleted ${payments.rowCount} payments`);

    // 2. Clear distributions
    const distributions = await client.query('DELETE FROM distributions RETURNING id');
    console.log(`✅ Deleted ${distributions.rowCount} distributions`);

    // 3. Clear inventory
    const inventory = await client.query('DELETE FROM inventory RETURNING id');
    console.log(`✅ Deleted ${inventory.rowCount} inventory records`);

    // 4. Clear attendants
    const attendants = await client.query('DELETE FROM attendants RETURNING id');
    console.log(`✅ Deleted ${attendants.rowCount} attendants`);

    // 5. Clear products
    const products = await client.query('DELETE FROM products RETURNING id');
    console.log(`✅ Deleted ${products.rowCount} products`);

    // 6. Clear messes
    const messes = await client.query('DELETE FROM messes RETURNING id');
    console.log(`✅ Deleted ${messes.rowCount} messes`);

    // 7. Clear sessions
    const sessions = await client.query('DELETE FROM sessions RETURNING id');
    console.log(`✅ Deleted ${sessions.rowCount} sessions`);

    // 8. Clear audit logs
    const audits = await client.query('DELETE FROM audit_logs RETURNING id');
    console.log(`✅ Deleted ${audits.rowCount} audit logs`);

    await client.query('COMMIT');

    console.log('\n═══════════════════════════════════════════════');
    console.log('✅ ALL DATA CLEARED!');
    console.log('═══════════════════════════════════════════════');
    console.log('\n⚠️  Everything deleted except:');
    console.log('   ✓ Users (admin account kept)');
    console.log('\n💡 Your database is now empty and ready for fresh data!');
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
clearAllData()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed:', error);
    process.exit(1);
  });
