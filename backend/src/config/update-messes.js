const pool = require('./database');

async function updateMessDetails() {
  const client = await pool.connect();

  try {
    console.log('\n=== Updating Mess Details ===\n');

    // Update Mess 1 - Constables Mess
    await client.query(`
      UPDATE messes 
      SET 
        name = 'Constables Mess',
        contact_person = 'Charles Okumba',
        phone = '+254-712-345-678'
      WHERE id = 1
    `);
    console.log('✓ Updated Mess 1 - Constables Mess');

    // Update Mess 2 - Officers Mess
    await client.query(`
      UPDATE messes 
      SET 
        name = 'Officers Mess',
        contact_person = 'Patrick Musyoki',
        phone = '+254-723-456-789'
      WHERE id = 2
    `);
    console.log('✓ Updated Mess 2 - Officers Mess');

    // Update Mess 3 - NCOs Mess
    await client.query(`
      UPDATE messes 
      SET 
        name = 'NCOs Mess',
        contact_person = 'Chris Nyandoro',
        phone = '+254-734-567-890'
      WHERE id = 3
    `);
    console.log('✓ Updated Mess 3 - NCOs Mess');

    console.log('\n=== Updated Mess Details ===\n');

    // Show updated details
    const result = await client.query('SELECT * FROM messes ORDER BY id');
    
    result.rows.forEach((mess) => {
      console.log(`${mess.name}:`);
      console.log(`  Location: ${mess.location}`);
      console.log(`  Contact: ${mess.contact_person}`);
      console.log(`  Phone: ${mess.phone}`);
      console.log('');
    });

    console.log('=== All mess details updated successfully! ===\n');

  } catch (error) {
    console.error('Error updating mess details:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run if called directly
if (require.main === module) {
  updateMessDetails()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('Update failed:', error);
      process.exit(1);
    });
}

module.exports = updateMessDetails;
