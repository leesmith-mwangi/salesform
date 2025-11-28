const pool = require('./database');
const fs = require('fs');
const path = require('path');

async function addAttendants() {
  const client = await pool.connect();

  try {
    console.log('Adding attendants feature...\n');

    // Read the migration SQL file
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, 'add-attendants.sql'),
      'utf8'
    );

    // Execute the migration
    await client.query(migrationSQL);

    console.log('✓ Attendants table created');
    console.log('✓ Sample attendants added');
    console.log('✓ Distributions table updated');

    console.log('\n=== Attendants by Mess ===\n');

    // Show attendants
    const result = await client.query(`
      SELECT 
        m.name as mess_name,
        a.name as attendant_name,
        a.phone,
        a.role
      FROM attendants a
      JOIN messes m ON a.mess_id = m.id
      WHERE a.is_active = true
      ORDER BY m.id, a.role, a.name
    `);
    
    let currentMess = '';
    result.rows.forEach((row) => {
      if (row.mess_name !== currentMess) {
        console.log(`\n${row.mess_name}:`);
        currentMess = row.mess_name;
      }
      console.log(`  - ${row.attendant_name} (${row.role}) - ${row.phone}`);
    });

    console.log('\n\n=== Attendants feature added successfully! ===\n');

  } catch (error) {
    console.error('Error adding attendants:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run migration if called directly
if (require.main === module) {
  addAttendants()
    .then(() => {
      console.log('Migration completed!\n');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = addAttendants;
