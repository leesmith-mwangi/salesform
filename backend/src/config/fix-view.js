const pool = require('./database');
const fs = require('fs');
const path = require('path');

async function fixView() {
  const client = await pool.connect();

  try {
    console.log('Fixing v_current_stock view...');

    // Read the fix SQL file
    const fixSQL = fs.readFileSync(
      path.join(__dirname, 'fix-view.sql'),
      'utf8'
    );

    // Execute the fix
    await client.query(fixSQL);

    console.log('✓ View fixed successfully!');
    console.log('\nVerifying fix...');

    // Verify the fix
    const result = await client.query('SELECT * FROM v_current_stock ORDER BY product_name');
    
    console.log('\nCurrent Stock Status:');
    console.log('─────────────────────────────────────────────────────────────');
    result.rows.forEach(row => {
      console.log(`${row.product_name}:`);
      console.log(`  Total Purchased: ${row.total_purchased} crates`);
      console.log(`  Total Distributed: ${row.total_distributed} crates`);
      console.log(`  Available Stock: ${row.current_stock} crates`);
      console.log('');
    });

  } catch (error) {
    console.error('Error fixing view:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run fix if called directly
if (require.main === module) {
  fixView()
    .then(() => {
      console.log('\n=== Fix completed successfully! ===\n');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Fix failed:', error);
      process.exit(1);
    });
}

module.exports = fixView;
