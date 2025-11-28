const pool = require('./database');

async function viewAndUpdateMesses() {
  const client = await pool.connect();

  try {
    console.log('\n=== Current Mess Details ===\n');

    // Show current messes
    const result = await client.query('SELECT * FROM messes ORDER BY id');
    
    result.rows.forEach((mess) => {
      console.log(`ID: ${mess.id}`);
      console.log(`Name: ${mess.name}`);
      console.log(`Location: ${mess.location}`);
      console.log(`Contact Person: ${mess.contact_person}`);
      console.log(`Phone: ${mess.phone}`);
      console.log('─────────────────────────────────────────');
    });

    console.log('\n=== Update Mess Details ===\n');
    console.log('You can update mess details by running SQL commands.');
    console.log('Example SQL to update phone number:');
    console.log('UPDATE messes SET phone = \'+254-XXX-XXX-XXX\' WHERE id = 1;');
    console.log('\nExample SQL to update contact person:');
    console.log('UPDATE messes SET contact_person = \'New Name\' WHERE id = 1;');

  } catch (error) {
    console.error('Error:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run if called directly
if (require.main === module) {
  viewAndUpdateMesses()
    .then(() => {
      console.log('\n');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed:', error);
      process.exit(1);
    });
}

module.exports = viewAndUpdateMesses;
