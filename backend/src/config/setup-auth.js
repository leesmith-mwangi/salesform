const pool = require('./database');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

async function setupAuthTables() {
  const client = await pool.connect();

  try {
    console.log('🔐 Setting up authentication tables...\n');

    // Read and execute auth schema SQL
    const schemaPath = path.join(__dirname, 'auth-schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    await client.query(schemaSql);
    console.log('✅ Authentication tables created successfully\n');

    // Create default admin user with properly hashed password
    const adminUsername = 'admin';
    const adminPassword = 'admin123'; // CHANGE THIS IN PRODUCTION!
    const adminEmail = 'admin@salesform.com';
    const adminFullName = 'System Administrator';

    // Hash the password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(adminPassword, saltRounds);

    // Insert admin user (use ON CONFLICT to avoid duplicate errors)
    await client.query(`
      INSERT INTO users (username, email, password_hash, full_name, role)
      VALUES ($1, $2, $3, $4, 'admin')
      ON CONFLICT (username) DO NOTHING
    `, [adminUsername, adminEmail, passwordHash, adminFullName]);

    console.log('✅ Default admin user created\n');
    console.log('═══════════════════════════════════════════════');
    console.log('📝 DEFAULT ADMIN CREDENTIALS:');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    console.log('   ⚠️  CHANGE THIS PASSWORD IMMEDIATELY!');
    console.log('═══════════════════════════════════════════════\n');

    // Show users table summary
    const result = await client.query('SELECT id, username, email, role, is_active FROM users');
    console.log('👥 Current users:');
    console.table(result.rows);

  } catch (error) {
    console.error('❌ Error setting up authentication:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

// Run setup
setupAuthTables()
  .then(() => {
    console.log('✅ Authentication setup completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  });
