const pool = require('./src/config/database');
const bcrypt = require('bcryptjs');

async function resetAdminPassword() {
  try {
    const password = 'admin123';
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    console.log('New password hash:', passwordHash);
    
    const result = await pool.query(
      'UPDATE users SET password_hash = $1 WHERE username = $2 RETURNING username',
      [passwordHash, 'admin']
    );
    
    console.log('✅ Password updated for:', result.rows[0].username);
    
    // Test it
    const user = await pool.query('SELECT password_hash FROM users WHERE username = $1', ['admin']);
    const isValid = await bcrypt.compare(password, user.rows[0].password_hash);
    console.log('✅ Password verification:', isValid ? 'SUCCESS' : 'FAILED');
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

resetAdminPassword();
