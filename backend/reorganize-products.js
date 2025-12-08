#!/usr/bin/env node

/**
 * Reorganize Products Script
 * Arranges products in logical order from 1-34
 */

const pool = require('./src/config/database');

// Define the desired product order
const PRODUCT_ORDER = [
  // Beers in Cans (6 per packet) - IDs 1-4
  'Tusker Lager Can',
  'Balozi Lager Can', 
  'White Cap Lager Can',
  'Guinness Lager Can',
  
  // Beers in Bottles/Crates (24 per crate) - IDs 5-9
  'Tusker Lite',
  'Tusker Cider', 
  'Guarana Can',
  'Delmonte',
  'Water 500ml',
  
  // Spirits (per piece) - IDs 10-29
  'Smirnoff Vodka',
  'Gilbeys',
  'Kenya Cane',
  'Chrome Gin',
  'Best Gin',
  'All Seasons',
  'Grants',
  'Richot',
  'Viceroy',
  'Kibao',
  'John Walker Black Label',
  'Red Label',
  'White House',
  'William Lawsons',
  'Hunters Choice',
  'Jameson',
  'Ballantines',
  'Singleton',
  'V&A',
  'Captain Morgan',
  
  // More Spirits - IDs 30-32
  'Penasol',
  'VAT 69',
  
  // Wines (per piece) - IDs 33-34
  'Cellar Cask',
  '4th Street',
  'Four Cousins'
];

async function reorganizeProducts() {
  console.log('\n🔄 Reorganizing Products (1-34) by Category...\n');

  try {
    // Start transaction
    await pool.query('BEGIN');

    // Get all current products
    const currentProducts = await pool.query(`
      SELECT id, name, unit_type, units_per_package, description, is_active, created_at
      FROM products 
      ORDER BY name
    `);

    console.log(`Found ${currentProducts.rows.length} products to reorganize\n`);

    // Create a map of products by name for easy lookup
    const productMap = {};
    currentProducts.rows.forEach(product => {
      productMap[product.name] = product;
    });

    // Clear the table and reset sequence
    await pool.query('DELETE FROM products');
    await pool.query('ALTER SEQUENCE products_id_seq RESTART WITH 1');

    // Re-insert products in the desired order
    let newId = 1;
    let categoryCount = { beers_cans: 0, beers_bottles: 0, spirits: 0, wines: 0 };
    
    for (const productName of PRODUCT_ORDER) {
      const product = productMap[productName];
      
      if (!product) {
        console.log(`⚠️  Product not found: ${productName}`);
        continue;
      }

      // Determine category for display
      let category = '';
      if (newId <= 4) {
        category = 'Beer (Cans)';
        categoryCount.beers_cans++;
      } else if (newId <= 9) {
        category = 'Beer (Bottles)';
        categoryCount.beers_bottles++;
      } else if (newId <= 32) {
        category = 'Spirits';
        categoryCount.spirits++;
      } else {
        category = 'Wines';
        categoryCount.wines++;
      }

      await pool.query(`
        INSERT INTO products (id, name, unit_type, units_per_package, description, is_active, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
      `, [
        newId,
        product.name,
        product.unit_type,
        product.units_per_package,
        product.description,
        product.is_active,
        product.created_at
      ]);

      const unitDesc = product.unit_type === 'piece' 
        ? 'per piece' 
        : `${product.units_per_package} per ${product.unit_type}`;

      console.log(`✅ ${newId.toString().padStart(2)}: ${product.name.padEnd(30)} [${category}] (${unitDesc})`);
      newId++;
    }

    // Reset sequence to continue from the last ID
    await pool.query(`ALTER SEQUENCE products_id_seq RESTART WITH ${newId}`);

    // Commit transaction
    await pool.query('COMMIT');

    console.log(`\n📊 Summary by Category:`);
    console.log(`   🍺 Beer Cans (6/packet):     IDs 1-4   (${categoryCount.beers_cans} items)`);
    console.log(`   🍻 Beer Bottles (24/crate):  IDs 5-9   (${categoryCount.beers_bottles} items)`);  
    console.log(`   🥃 Spirits (per piece):      IDs 10-32 (${categoryCount.spirits} items)`);
    console.log(`   🍷 Wines (per piece):        IDs 33-35 (${categoryCount.wines} items)`);
    console.log(`   📦 Total Products:           ${newId - 1}`);

    // Show final organized list
    console.log('\n📋 Final Organized Product List:');
    const finalList = await pool.query(`
      SELECT id, name, unit_type, units_per_package 
      FROM products 
      ORDER BY id
    `);
    
    console.log('\n┌────┬────────────────────────────────┬──────────┬──────────────┐');
    console.log('│ ID │ Product Name                   │   Type   │    Units     │');
    console.log('├────┼────────────────────────────────┼──────────┼──────────────┤');
    
    let currentCategory = '';
    finalList.rows.forEach(p => {
      // Add category headers
      let newCategory = '';
      if (p.id <= 4) newCategory = '🍺 BEER CANS';
      else if (p.id <= 9) newCategory = '🍻 BEER BOTTLES';
      else if (p.id <= 32) newCategory = '🥃 SPIRITS';
      else newCategory = '🍷 WINES';
      
      if (newCategory !== currentCategory) {
        console.log(`├────┼────────────────────────────────┼──────────┼──────────────┤`);
        console.log(`│    │ ${newCategory.padEnd(30)} │          │              │`);
        console.log(`├────┼────────────────────────────────┼──────────┼──────────────┤`);
        currentCategory = newCategory;
      }
      
      const id = p.id.toString().padStart(2);
      const name = p.name.padEnd(30).substring(0, 30);
      const type = p.unit_type.padEnd(8);
      const units = p.unit_type === 'piece' ? 'per piece' : `${p.units_per_package}/${p.unit_type}`;
      console.log(`│ ${id} │ ${name} │ ${type} │ ${units.padEnd(12)} │`);
    });
    console.log('└────┴────────────────────────────────┴──────────┴──────────────┘');

    console.log('\n✅ Product reorganization complete!');
    console.log('\n🎯 Products are now arranged by category with sequential numbering:');
    console.log('   • Beer Cans: 1-4');
    console.log('   • Beer Bottles: 5-9'); 
    console.log('   • Spirits: 10-32');
    console.log('   • Wines: 33-35');

  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('\n❌ Error reorganizing products:', error.message);
    console.error('   Transaction rolled back. No changes made.\n');
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the script
reorganizeProducts();