const pool = require('./database');

async function fixInventorySchema() {
  const client = await pool.connect();

  try {
    console.log('\n=== Fixing Inventory Schema ===\n');

    // Rename purchase_price_per_crate to purchase_price_per_unit
    console.log('Renaming purchase_price_per_crate to purchase_price_per_unit...');
    await client.query(`
      ALTER TABLE inventory 
      RENAME COLUMN purchase_price_per_crate TO purchase_price_per_unit
    `);
    console.log('✓ Column renamed successfully\n');

    // Verify the change
    console.log('Verifying inventory table columns:');
    const result = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'inventory'
      ORDER BY ordinal_position
    `);
    
    result.rows.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type}`);
    });

    console.log('\n=== Fix completed successfully! ===\n');

  } catch (error) {
    console.error('Error fixing schema:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run if called directly
if (require.main === module) {
  fixInventorySchema()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('Fix failed:', error);
      process.exit(1);
    });
}

module.exports = fixInventorySchema;
