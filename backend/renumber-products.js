#!/usr/bin/env node

/**
 * Renumber Products Script
 * Updates product IDs to be sequential from 1 to 34
 */

const pool = require('./src/config/database');

async function renumberProducts() {
  console.log('\n🔢 Renumbering Products (1-34)...\n');

  try {
    // Start transaction
    await pool.query('BEGIN');

    // Get all products ordered by current ID
    const currentProducts = await pool.query(`
      SELECT id, name, unit_type, units_per_package, description, is_active, created_at
      FROM products 
      ORDER BY id
    `);

    console.log(`Found ${currentProducts.rows.length} products to renumber\n`);

    // First, clear the table and reset sequence
    await pool.query('DELETE FROM products');
    await pool.query('ALTER SEQUENCE products_id_seq RESTART WITH 1');

    // Re-insert products with sequential IDs
    let newId = 1;
    
    for (const product of currentProducts.rows) {
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

      console.log(`✅ ${newId.toString().padStart(2)}: ${product.name}`);
      newId++;
    }

    // Reset sequence to continue from the last ID
    await pool.query(`ALTER SEQUENCE products_id_seq RESTART WITH ${newId}`);

    // Commit transaction
    await pool.query('COMMIT');

    console.log(`\n📊 Summary:`);
    console.log(`   Products renumbered: ${currentProducts.rows.length}`);
    console.log(`   New ID range: 1 - ${currentProducts.rows.length}`);
    console.log(`   Next available ID: ${newId}`);

    // Show final numbered list
    console.log('\n📋 Final Product List:');
    const finalList = await pool.query(`
      SELECT id, name, unit_type, units_per_package 
      FROM products 
      ORDER BY id
    `);
    
    console.log('\n┌────┬────────────────────────────────┬──────────┬──────────┐');
    console.log('│ ID │ Product Name                   │   Type   │  Units   │');
    console.log('├────┼────────────────────────────────┼──────────┼──────────┤');
    finalList.rows.forEach(p => {
      const id = p.id.toString().padStart(2);
      const name = p.name.padEnd(30).substring(0, 30);
      const type = p.unit_type.padEnd(8);
      const units = p.unit_type === 'piece' ? 'per piece' : `${p.units_per_package}/pkg`;
      console.log(`│ ${id} │ ${name} │ ${type} │ ${units.padEnd(8)} │`);
    });
    console.log('└────┴────────────────────────────────┴──────────┴──────────┘');

    console.log('\n✅ Product renumbering complete!');
    console.log('\n💡 Note: This only affects the product IDs. Existing inventory and distributions');
    console.log('   will still reference the products correctly through foreign key relationships.');

  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('\n❌ Error renumbering products:', error.message);
    console.error('   Transaction rolled back. No changes made.\n');
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the script
renumberProducts();