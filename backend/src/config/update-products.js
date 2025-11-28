const pool = require('./database');

async function updateProducts() {
  const client = await pool.connect();

  try {
    console.log('\n=== Updating Product Details ===\n');

    // Example updates - modify these as needed
    
    // Update product name
    await client.query(`
      UPDATE products 
      SET name = 'Guinness Stout'
      WHERE id = 1
    `);
    console.log('✓ Updated Product 1 - Guinness Stout');

    // Update product price
    await client.query(`
      UPDATE products 
      SET price_per_crate = 3100.00
      WHERE id = 6
    `);
    console.log('✓ Updated Product 6 - Heineken price');

    // Update multiple fields
    await client.query(`
      UPDATE products 
      SET 
        name = 'Tusker Premium',
        price_per_crate = 2850.00,
        description = 'Tusker Premium Lager - Kenya''s Favorite'
      WHERE id = 2
    `);
    console.log('✓ Updated Product 2 - Tusker Premium');

    // Add more updates here as needed...
    // Example template:
    /*
    await client.query(`
      UPDATE products 
      SET 
        name = 'New Product Name',
        price_per_crate = 2500.00,
        bottles_per_crate = 24,
        description = 'Product description'
      WHERE id = X
    `);
    console.log('✓ Updated Product X');
    */

    console.log('\n=== Current Products After Update ===\n');

    // Show all products
    const result = await client.query(`
      SELECT id, name, price_per_crate, bottles_per_crate, description
      FROM products
      ORDER BY id
    `);
    
    result.rows.forEach((product) => {
      console.log(`ID: ${product.id}`);
      console.log(`  Name: ${product.name}`);
      console.log(`  Price: KSH ${parseFloat(product.price_per_crate).toLocaleString()}/crate`);
      console.log(`  Bottles: ${product.bottles_per_crate} per crate`);
      console.log(`  Description: ${product.description || 'N/A'}`);
      console.log('');
    });

    console.log('\n=== All product details updated successfully! ===\n');

  } catch (error) {
    console.error('Error updating product details:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run if called directly
if (require.main === module) {
  updateProducts()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('Update failed:', error);
      process.exit(1);
    });
}

module.exports = updateProducts;
