const pool = require('./database');
const fs = require('fs');
const path = require('path');

async function addKenyanBeers() {
  const client = await pool.connect();

  try {
    console.log('Adding Kenyan beer brands to database...\n');

    // Read the SQL file
    const sql = fs.readFileSync(
      path.join(__dirname, 'add-kenyan-beers.sql'),
      'utf8'
    );

    // Execute the SQL
    await client.query(sql);

    console.log('✓ Beer brands added successfully!');

    // Show all products
    const result = await client.query('SELECT name, price_per_crate, bottles_per_crate FROM products ORDER BY name');
    
    console.log(`\n📦 Total Products: ${result.rows.length}\n`);
    console.log('Product List:');
    console.log('─────────────────────────────────────────────────────────');
    result.rows.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} - ${product.price_per_crate} KSH/crate (${product.bottles_per_crate} bottles)`);
    });
    console.log('─────────────────────────────────────────────────────────');

    console.log('\n=== Successfully added Kenyan beer brands! ===\n');

  } catch (error) {
    console.error('Error adding beer brands:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run if called directly
if (require.main === module) {
  addKenyanBeers()
    .then(() => {
      console.log('Migration completed!\n');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = addKenyanBeers;
