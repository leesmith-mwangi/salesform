const pool = require('./src/config/database');

async function manageProducts() {
  const client = await pool.connect();

  try {
    console.log('📦 PRODUCT MANAGEMENT TOOL\n');
    console.log('═══════════════════════════════════════════════\n');

    // Show current products
    const products = await client.query(`
      SELECT 
        id, 
        name, 
        units_per_package, 
        unit_type,
        is_active,
        created_at
      FROM products 
      ORDER BY name
    `);

    console.log('📋 CURRENT PRODUCTS:');
    console.table(products.rows);

    console.log('\n═══════════════════════════════════════════════');
    console.log('💡 HOW TO MANAGE PRODUCTS:');
    console.log('═══════════════════════════════════════════════\n');

    console.log('1️⃣  ADD NEW PRODUCT:');
    console.log('   Run this SQL or use the script below:\n');
    console.log(`   INSERT INTO products (name, units_per_package, unit_type, description)`);
    console.log(`   VALUES ('Product Name', 24, 'crate', 'Description');`);
    console.log('');

    console.log('2️⃣  DELETE A PRODUCT:');
    console.log('   Run this SQL (replace ID with actual product ID):\n');
    console.log(`   DELETE FROM products WHERE id = 1;`);
    console.log('');

    console.log('3️⃣  UPDATE A PRODUCT:');
    console.log('   Run this SQL:\n');
    console.log(`   UPDATE products SET name = 'New Name', units_per_package = 30`);
    console.log(`   WHERE id = 1;`);
    console.log('');

    console.log('4️⃣  DEACTIVATE (HIDE) A PRODUCT:');
    console.log('   Instead of deleting, you can deactivate:\n');
    console.log(`   UPDATE products SET is_active = false WHERE id = 1;`);
    console.log('');

    console.log('5️⃣  REACTIVATE A PRODUCT:');
    console.log(`   UPDATE products SET is_active = true WHERE id = 1;`);
    console.log('');

    console.log('═══════════════════════════════════════════════\n');

    await pool.end();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the tool
manageProducts();
