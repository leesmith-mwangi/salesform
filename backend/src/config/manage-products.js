const pool = require('./database');

async function manageProducts() {
  const client = await pool.connect();

  try {
    console.log('\n=== Managing Products ===\n');

    // STEP 1: Remove price_per_crate column from products table
    console.log('Step 1: Removing price_per_crate column...');
    await client.query(`
      ALTER TABLE products 
      DROP COLUMN IF EXISTS price_per_crate CASCADE
    `);
    console.log('✓ Removed price_per_crate column from products table\n');

    // STEP 2: Add unit_type column to handle both crates and pieces
    console.log('Step 2: Adding unit_type column for crates/pieces...');
    await client.query(`
      ALTER TABLE products 
      ADD COLUMN IF NOT EXISTS unit_type VARCHAR(20) DEFAULT 'crate' CHECK (unit_type IN ('crate', 'piece'))
    `);
    console.log('✓ Added unit_type column (crate/piece)\n');

    // STEP 3: Rename bottles_per_crate to units_per_package for flexibility
    console.log('Step 3: Updating column names for flexibility...');
    await client.query(`
      DO $$ 
      BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='products' AND column_name='bottles_per_crate') THEN
          ALTER TABLE products RENAME COLUMN bottles_per_crate TO units_per_package;
        END IF;
      END $$;
    `);
    console.log('✓ Renamed bottles_per_crate to units_per_package\n');

    // STEP 4: Update inventory and distributions tables
    console.log('Step 4: Updating related tables...');
    
    // Update inventory table column names
    await client.query(`
      DO $$ 
      BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='inventory' AND column_name='quantity_crates') THEN
          ALTER TABLE inventory RENAME COLUMN quantity_crates TO quantity;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='inventory' AND column_name='unit_type') THEN
          ALTER TABLE inventory ADD COLUMN unit_type VARCHAR(20) DEFAULT 'crate';
        END IF;
      END $$;
    `);
    
    // Update distributions table column names
    await client.query(`
      DO $$ 
      BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='distributions' AND column_name='quantity_crates') THEN
          ALTER TABLE distributions RENAME COLUMN quantity_crates TO quantity;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='distributions' AND column_name='unit_type') THEN
          ALTER TABLE distributions ADD COLUMN unit_type VARCHAR(20) DEFAULT 'crate';
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='distributions' AND column_name='price_per_crate') THEN
          ALTER TABLE distributions RENAME COLUMN price_per_crate TO price_per_unit;
        END IF;
      END $$;
    `);
    
    console.log('✓ Updated inventory and distributions tables\n');

    // STEP 5: Update views to use new column names
    console.log('Step 5: Updating database views...');
    
    // Drop and recreate v_current_stock view
    await client.query(`
      DROP VIEW IF EXISTS v_current_stock CASCADE;
      
      CREATE VIEW v_current_stock AS
      SELECT 
        p.id AS product_id,
        p.name AS product_name,
        p.unit_type,
        COALESCE(
          (SELECT SUM(i.quantity) 
           FROM inventory i 
           WHERE i.product_id = p.id
           GROUP BY i.product_id), 
          0
        ) AS total_added,
        COALESCE(
          (SELECT SUM(d.quantity) 
           FROM distributions d 
           WHERE d.product_id = p.id
           GROUP BY d.product_id), 
          0
        ) AS total_distributed,
        COALESCE(
          (SELECT SUM(i.quantity) 
           FROM inventory i 
           WHERE i.product_id = p.id
           GROUP BY i.product_id), 
          0
        ) - COALESCE(
          (SELECT SUM(d.quantity) 
           FROM distributions d 
           WHERE d.product_id = p.id
           GROUP BY d.product_id), 
          0
        ) AS current_stock
      FROM products p
      WHERE p.is_active = true;
    `);
    
    console.log('✓ Updated database views\n');

    // STEP 6: Delete specific products (add IDs of products to delete)
    console.log('Step 6: Deleting specified products...');
    
    const productsToDelete = [
      // Add IDs here of products you want to delete
      // Example: 6, 7, 8
    ];

    // Delete by ID (if you specified IDs above)
    if (productsToDelete.length > 0) {
      await client.query(`
        DELETE FROM products 
        WHERE id = ANY($1)
      `, [productsToDelete]);
      console.log(`✓ Deleted ${productsToDelete.length} products\n`);
    }

    // STEP 7: Add new products (beers and spirits)
    console.log('Step 7: Adding new products...');
    
    const newProducts = [
      // Format: ['Product Name', units_per_package, unit_type, 'Description']
      // BEERS (sold in crates)
      ['Tusker Export', 24, 'crate', 'Tusker Export Premium Lager'],
      ['Bavaria', 24, 'crate', 'Bavaria Premium Beer'],
      
      // SPIRITS (sold per piece/bottle)
      ['Captain Morgan', 1, 'piece', 'Captain Morgan Spiced Rum 750ml'],
      ['Grants', 1, 'piece', 'Grants Whisky 750ml'],
      ['Johnnie Walker Red', 1, 'piece', 'Johnnie Walker Red Label 750ml'],
      ['Smirnoff Vodka', 1, 'piece', 'Smirnoff Vodka 750ml'],
      ['Kenya Cane', 1, 'piece', 'Kenya Cane Vodka 750ml'],
      ['Richot', 1, 'piece', 'Richot Brandy 750ml'],
      // Add more products here...
    ];

    if (newProducts.length > 0) {
      for (const [name, units, unitType, description] of newProducts) {
        await client.query(`
          INSERT INTO products (name, units_per_package, unit_type, description)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (name) DO NOTHING
        `, [name, units, unitType, description]);
      }
      console.log(`✓ Added ${newProducts.length} new products\n`);
    }

    // STEP 8: Show all current products
    console.log('\n=== Current Products List ===\n');
    const result = await client.query(`
      SELECT id, name, units_per_package, unit_type, description, is_active
      FROM products
      ORDER BY unit_type, name
    `);
    
    console.log(`Total Products: ${result.rows.length}\n`);
    
    // Group by unit type
    console.log('--- CRATES (Beers) ---');
    result.rows.filter(p => p.unit_type === 'crate').forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   ID: ${product.id}`);
      console.log(`   Units per package: ${product.units_per_package || 'N/A'}`);
      console.log(`   Description: ${product.description || 'N/A'}`);
      console.log('');
    });
    
    console.log('\n--- PIECES (Spirits) ---');
    result.rows.filter(p => p.unit_type === 'piece').forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   ID: ${product.id}`);
      console.log(`   Description: ${product.description || 'N/A'}`);
      console.log('');
    });

    console.log('\n=== Product management completed successfully! ===\n');
    console.log('✅ Changes made:');
    console.log('  - Removed price_per_crate (prices entered per distribution)');
    console.log('  - Added unit_type field (crate or piece)');
    console.log('  - Renamed columns for flexibility');
    console.log('  - Updated views and related tables\n');
    console.log('📝 Now you can:');
    console.log('  - Add stock in CRATES (beers) or PIECES (spirits)');
    console.log('  - Distribute stock with flexible pricing per transaction');
    console.log('  - Track both types of products separately\n');

  } catch (error) {
    console.error('Error managing products:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run if called directly
if (require.main === module) {
  manageProducts()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('Management failed:', error);
      process.exit(1);
    });
}

module.exports = manageProducts;
