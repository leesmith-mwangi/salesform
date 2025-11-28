const pool = require('./database');

async function updateAttendants() {
  const client = await pool.connect();

  try {
    console.log('\n=== Updating Attendant Details ===\n');

    // Update Constables Mess attendants
    await client.query(`
      UPDATE attendants 
      SET 
        name = 'Charles Okumba',
        phone = '+254-720-111-222'
      WHERE id = 1
    `);
    console.log('✓ Updated Attendant 1 - Charles Okumba');

    await client.query(`
      UPDATE attendants 
      SET 
        name = 'Emmanuel Kimutai',
        phone = '+254-720-111-333'
      WHERE id = 2
    `);
    console.log('✓ Updated Attendant 2 - Emmanuel Kimutai');

    await client.query(`
      UPDATE attendants 
      SET 
        name = '',
        phone = '+254-720-111-444'
      WHERE id = 3
    `);
    console.log('✓ Updated Attendant 3 - (Empty - for future use)');

    // Update Officers Mess attendants
    await client.query(`
      UPDATE attendants 
      SET 
        name = 'Patrick Musyoki',
        phone = '+254-721-222-333'
      WHERE id = 4
    `);
    console.log('✓ Updated Attendant 4 - Patrick Musyoki');

    await client.query(`
      UPDATE attendants 
      SET 
        name = 'Jerrad Muisyo',
        phone = '+254-721-222-444'
      WHERE id = 5
    `);
    console.log('✓ Updated Attendant 5 - Jerrad Muisyo');

    // Update NCOs Mess attendants
    await client.query(`
      UPDATE attendants 
      SET 
        name = 'Chris Nyandoro',
        phone = '+254-722-333-444'
      WHERE id = 6
    `);
    console.log('✓ Updated Attendant 6 - Chris Nyandoro');

    await client.query(`
      UPDATE attendants 
      SET 
        name = '',
        phone = '+254-722-333-555'
      WHERE id = 7
    `);
    console.log('✓ Updated Attendant 7 - (Empty - for future use)');

    await client.query(`
      UPDATE attendants 
      SET 
        name = '',
        phone = '+254-722-333-666'
      WHERE id = 8
    `);
    console.log('✓ Updated Attendant 8 - (Empty - for future use)');

    console.log('\n=== Updated Attendant Details ===\n');

    // Show updated details grouped by mess
    const result = await client.query(`
      SELECT 
        m.name as mess_name,
        a.name as attendant_name,
        a.phone,
       
      FROM attendants a
      JOIN messes m ON a.mess_id = m.id
      WHERE a.is_active = true
      ORDER BY m.id, a.name
    `);
    
    let currentMess = '';
    result.rows.forEach((row) => {
      if (row.mess_name !== currentMess) {
        console.log(`\n${row.mess_name}:`);
        currentMess = row.mess_name;
      }
      console.log(`  - ${row.attendant_name} (${row.role}) - ${row.phone}`);
    });

    console.log('\n\n=== All attendant details updated successfully! ===\n');

  } catch (error) {
    console.error('Error updating attendant details:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run if called directly
if (require.main === module) {
  updateAttendants()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('Update failed:', error);
      process.exit(1);
    });
}

module.exports = updateAttendants;
