const User = require('./src/models/User');
const bcrypt = require('bcryptjs');

async function testLogin() {
  try {
    const user = await User.findByUsername('admin');
    console.log('User found:', !!user);
    
    if (user) {
      console.log('Username:', user.username);
      console.log('Has password_hash:', !!user.password_hash);
      console.log('Password hash length:', user.password_hash?.length);
      
      const isValid = await bcrypt.compare('admin123', user.password_hash);
      console.log('Password valid:', isValid);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

testLogin();
