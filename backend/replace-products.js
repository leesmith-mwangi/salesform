#!/usr/bin/env node

/**
 * Replace Products Script
 * Clears all current products and adds the new product list
 */

const pool = require('./src/config/database');

// New products list with correct specifications
const NEW_PRODUCTS = [
  // Beers in cans (6 per packet)
  { name: 'Tusker Lager Can', unit_type: 'crate', units_per_package: 6 },
  { name: 'Balozi Lager Can', unit_type: 'crate', units_per_package: 6 },
  { name: 'White Cap Lager Can', unit_type: 'crate', units_per_package: 6 },
  { name: 'Guinness Lager Can', unit_type: 'crate', units_per_package: 6 },
  
  // Beers in bottles (24 per crate)
  { name: 'Guarana Can', unit_type: 'crate', units_per_package: 24 },
  { name: 'Tusker Lite', unit_type: 'crate', units_per_package: 24 },
  { name: 'Tusker Cider', unit_type: 'crate', units_per_package: 24 },
   { name: 'Balozi', unit_type: 'crate', units_per_package: 24 },
  // Spirits (per piece)
  { name: 'Smirnoff Vodka', unit_type: 'piece', units_per_package: 1 },
  { name: 'Gilbeys', unit_type: 'piece', units_per_package: 1 },
  { name: 'Kenya Cane', unit_type: 'piece', units_per_package: 1 },
  { name: 'Chrome Gin', unit_type: 'piece', units_per_package: 1 },
  { name: 'All Seasons', unit_type: 'piece', units_per_package: 1 },
  { name: 'Grants', unit_type: 'piece', units_per_package: 1 },
  { name: 'Richot', unit_type: 'piece', units_per_package: 1 },
  { name: 'Viceroy', unit_type: 'piece', units_per_package: 1 },
  { name: 'Kibao', unit_type: 'piece', units_per_package: 1 },
  { name: 'John Walker Black Label', unit_type: 'piece', units_per_package: 1 },
  { name: 'Red Label', unit_type: 'piece', units_per_package: 1 },
  { name: 'White House', unit_type: 'piece', units_per_package: 1 },
  { name: 'William Lawsons', unit_type: 'piece', units_per_package: 1 },
  { name: 'Hunters Choice', unit_type: 'piece', units_per_package: 1 },
  { name: 'Jameson', unit_type: 'piece', units_per_package: 1 },
  { name: 'Ballantines', unit_type: 'piece', units_per_package: 1 },
  { name: 'Singleton', unit_type: 'piece', units_per_package: 1 },
  { name: 'V&A', unit_type: 'piece', units_per_package: 1 },
  { name: 'Penasol', unit_type: 'piece', units_per_package: 1 },
  { name: 'Captain Morgan', unit_type: 'piece', units_per_package: 1 },
  { name: 'VAT 69', unit_type: 'piece', units_per_package: 1 },
  
  // Wines (per piece)
  { name: 'Cellar Cask', unit_type: 'piece', units_per_package: 1 },
  { name: '4th Street', unit_type: 'piece', units_per_package: 1 },
  { name: 'Four Cousins', unit_type: 'piece', units_per_package: 1 },
  
  // Other
  { name: 'Best Gin', unit_type: 'piece', units_per_package: 1 },
  { name: 'Delmonte', unit_type: 'crate', units_per_package: 24 },
  { name: 'Water 500ml', unit_type: 'crate', units_per_package: 24 }
];

async function replaceProducts() {
  console.log('\n🔄 Replacing Product List...\n');

  try {
    // Start transaction
    await pool.query('BEGIN');

    // Check if there are any distributions
    const distributionCheck = await pool.query('SELECT COUNT(*) as count FROM distributions');
    const hasDistributions = distributionCheck.rows[0].count > 0;

    if (hasDistributions) {
      console.log('⚠️  Warning: Existing distributions found!');
      console.log('   This will delete ALL products and their distribution history.');
      console.log('   Consider backing up your database first.\n');
      
      // Delete distributions first (to handle foreign key constraints)
      await pool.query('DELETE FROM distributions');
      console.log('✅ Cleared distribution history');
    }

    // Check if there's any inventory
    const inventoryCheck = await pool.query('SELECT COUNT(*) as count FROM inventory');
    const hasInventory = inventoryCheck.rows[0].count > 0;

    if (hasInventory) {
      await pool.query('DELETE FROM inventory');
      console.log('✅ Cleared inventory records');
    }

    // Delete all existing products
    const deleteResult = await pool.query('DELETE FROM products');
    console.log(`✅ Deleted ${deleteResult.rowCount} old products\n`);

    // Add new products
    console.log('➕ Adding new products...\n');
    let successCount = 0;

    for (const product of NEW_PRODUCTS) {
      try {
        const result = await pool.query(
          `INSERT INTO products (name, unit_type, units_per_package) 
           VALUES ($1, $2, $3) 
           RETURNING id, name, unit_type, units_per_package`,
          [product.name, product.unit_type, product.units_per_package]
        );
        
        const added = result.rows[0];
        const unitDesc = added.unit_type === 'piece' 
          ? 'per piece' 
          : `${added.units_per_package} per ${added.unit_type}`;
        
        console.log(`✅ Added: ${added.name.padEnd(30)} (${unitDesc})`);
        successCount++;
      } catch (err) {
        console.log(`❌ Failed to add: ${product.name} - ${err.message}`);
      }
    }

    // Commit transaction
    await pool.query('COMMIT');

    console.log(`\n📊 Summary:`);
    console.log(`   Total products added: ${successCount}`);
    console.log(`   Beers (cans): 4 products × 6 per packet`);
    console.log(`   Beers (bottles): 3 products × 24 per crate`);
    console.log(`   Spirits: 28 products (per piece)`);
    console.log(`   Wines: 3 products (per piece)`);
    console.log(`   Other: 3 products`);

    // Show final list
    console.log('\n📋 Final Product List:');
    const finalList = await pool.query(
      'SELECT id, name, unit_type, units_per_package FROM products ORDER BY id'
    );
    
    console.log('\n┌──────┬────────────────────────────────┬──────────┬──────────┐');
    console.log('│  ID  │ Product Name                   │   Type   │  Units   │');
    console.log('├──────┼────────────────────────────────┼──────────┼──────────┤');
    finalList.rows.forEach(p => {
      const id = p.id.toString().padStart(4);
      const name = p.name.padEnd(30).substring(0, 30);
      const type = p.unit_type.padEnd(8);
      const units = p.unit_type === 'piece' ? 'per piece' : `${p.units_per_package}/pkg`;
      console.log(`│ ${id} │ ${name} │ ${type} │ ${units.padEnd(8)} │`);
    });
    console.log('└──────┴────────────────────────────────┴──────────┴──────────┘');

    console.log('\n✅ Product list replacement complete!');
    console.log('\n💡 Next steps:');
    console.log('   1. Restart your frontend to see the new dropdown list');
    console.log('   2. Add initial stock for these products');
    console.log('   3. Set prices in the inventory when adding stock\n');

  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('\n❌ Error replacing products:', error.message);
    console.error('   Transaction rolled back. No changes made.\n');
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the script
replaceProducts();
