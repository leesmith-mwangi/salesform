#!/usr/bin/env node

/**
 * Replace All Products Script
 * 
 * This script will:
 * 1. Clear all existing products
 * 2. Add the new product list for the bar/beverage business
 */

const pool = require('./src/config/database');

const NEW_PRODUCTS = [
  // Beers - Cans (6 cans per packet)
  { name: 'Tusker Lager Can', unit_type: 'crate', units_per_package: 6 },
  { name: 'Balozi Lager Can', unit_type: 'crate', units_per_package: 6 },
  { name: 'White Cap Lager Can', unit_type: 'crate', units_per_package: 6 },
  { name: 'Guinness Lager Can', unit_type: 'crate', units_per_package: 6 },
  { name: 'Guarana Can', unit_type: 'crate', units_per_package: 6 },
  
  // Beers - Bottles (24 bottles per crate)
  { name: 'Tusker Lager', unit_type: 'crate', units_per_package: 24 },
  { name: 'Balozi Lager', unit_type: 'crate', units_per_package: 24 },
  { name: 'White Cap Lager', unit_type: 'crate', units_per_package: 24 },
  { name: 'Guinness Lager', unit_type: 'crate', units_per_package: 24 },
  { name: 'Tusker Lite', unit_type: 'crate', units_per_package: 24 },
  { name: 'Tusker Cider', unit_type: 'crate', units_per_package: 24 },
  
  // Spirits - Vodka
  { name: 'Smirnoff Vodka', unit_type: 'crate', units_per_package: 12 },
  
  // Spirits - Gin
  { name: 'Gilbeys Gin', unit_type: 'crate', units_per_package: 12 },
  { name: 'Kenya Cane', unit_type: 'crate', units_per_package: 12 },
  { name: 'Chrome Gin', unit_type: 'crate', units_per_package: 12 },
  { name: 'Best Gin', unit_type: 'crate', units_per_package: 12 },
  
  // Spirits - Brandy
  { name: 'All Seasons', unit_type: 'crate', units_per_package: 12 },
  { name: 'Richot', unit_type: 'crate', units_per_package: 12 },
  { name: 'Viceroy', unit_type: 'crate', units_per_package: 12 },
  { name: 'V&A', unit_type: 'crate', units_per_package: 12 },
  { name: 'Penasol', unit_type: 'crate', units_per_package: 12 },
  
  // Spirits - Whisky
  { name: 'Grants', unit_type: 'crate', units_per_package: 12 },
  { name: 'Kibao', unit_type: 'crate', units_per_package: 12 },
  { name: 'Johnnie Walker Black Label', unit_type: 'crate', units_per_package: 12 },
  { name: 'Johnnie Walker Red Label', unit_type: 'crate', units_per_package: 12 },
  { name: 'White Horse', unit_type: 'crate', units_per_package: 12 },
  { name: 'William Lawsons', unit_type: 'crate', units_per_package: 12 },
  { name: 'Hunters Choice', unit_type: 'crate', units_per_package: 12 },
  { name: 'Jameson', unit_type: 'crate', units_per_package: 12 },
  { name: 'Ballantines', unit_type: 'crate', units_per_package: 12 },
  { name: 'Singleton', unit_type: 'crate', units_per_package: 12 },
  { name: 'VAT 69', unit_type: 'crate', units_per_package: 12 },
  
  // Spirits - Rum
  { name: 'Captain Morgan', unit_type: 'crate', units_per_package: 12 },
  
  // Wines
  { name: 'Cellar Cask', unit_type: 'crate', units_per_package: 12 },
  { name: '4th Street', unit_type: 'crate', units_per_package: 12 },
  { name: 'Four Cousins', unit_type: 'crate', units_per_package: 12 },
  
  // Non-Alcoholic
  { name: 'Delmonte', unit_type: 'crate', units_per_package: 24 },
  { name: 'Water 500ml', unit_type: 'crate', units_per_package: 24 },
];

async function replaceAllProducts() {
  console.log('\n🔄 Product Replacement Tool\n');
  console.log('This will DELETE all existing products and replace them with the new list.');
  console.log('⚠️  WARNING: This will also delete all related distribution history!\n');

  try {
    // Start transaction
    await pool.query('BEGIN');

    // Delete all distributions first (foreign key constraint)
    console.log('🗑️  Deleting all distribution records...');
    const distributionsResult = await pool.query('DELETE FROM distributions');
    console.log(`   Deleted ${distributionsResult.rowCount} distribution records`);

    // Delete all inventory records
    console.log('🗑️  Deleting all inventory records...');
    const inventoryResult = await pool.query('DELETE FROM inventory');
    console.log(`   Deleted ${inventoryResult.rowCount} inventory records`);

    // Delete all products
    console.log('🗑️  Deleting all existing products...');
    const productsResult = await pool.query('DELETE FROM products');
    console.log(`   Deleted ${productsResult.rowCount} products\n`);

    // Add new products
    console.log('✨ Adding new products...\n');
    let addedCount = 0;

    for (const product of NEW_PRODUCTS) {
      const result = await pool.query(
        `INSERT INTO products (name, unit_type, units_per_package) 
         VALUES ($1, $2, $3) 
         RETURNING id, name`,
        [product.name, product.unit_type, product.units_per_package]
      );
      
      console.log(`   ✅ Added: ${result.rows[0].name} (ID: ${result.rows[0].id})`);
      addedCount++;
    }

    // Commit transaction
    await pool.query('COMMIT');

    console.log(`\n🎉 Success! Replaced all products.`);
    console.log(`   Total products now: ${addedCount}`);
    console.log(`\n📝 Product breakdown:`);
    console.log(`   - Beer cans (6 per packet): 5 products`);
    console.log(`   - Beer bottles (24 per crate): 7 products`);
    console.log(`   - Spirits (12 per crate): 25 products`);
    console.log(`   - Wines (12 per crate): 3 products`);
    console.log(`   - Non-alcoholic (24 per crate): 2 products`);
    console.log(`\n📝 Next steps:`);
    console.log(`   1. Start the application and add stock inventory`);
    console.log(`   2. Begin making distributions to messes/bars`);
    console.log(`   3. Track sales and profits\n`);

  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('❌ Error replacing products:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the replacement
replaceAllProducts();
