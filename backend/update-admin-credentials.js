#!/usr/bin/env node

/**
 * Update Admin Credentials Script
 * 
 * This script allows you to change the admin username and/or password
 * from the command line without logging into the app.
 * 
 * Usage:
 *   node update-admin-credentials.js
 * 
 * Then follow the prompts to enter new credentials.
 */

const bcrypt = require('bcryptjs');
const pool = require('./src/config/database');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function updateCredentials() {
  console.log('\n🔐 Admin Credentials Update Tool\n');
  console.log('This will update the admin account credentials.');
  console.log('Press Ctrl+C to cancel at any time.\n');

  try {
    // Get current admin
    const currentAdmin = await pool.query(
      'SELECT id, username, email, full_name FROM users WHERE role = $1 ORDER BY id LIMIT 1',
      ['admin']
    );

    if (currentAdmin.rows.length === 0) {
      console.log('❌ No admin user found in database!');
      console.log('Please run setup-auth.js first to create an admin user.');
      process.exit(1);
    }

    const admin = currentAdmin.rows[0];
    console.log('Current admin account:');
    console.log(`  ID: ${admin.id}`);
    console.log(`  Username: ${admin.username}`);
    console.log(`  Email: ${admin.email || 'Not set'}`);
    console.log(`  Full Name: ${admin.full_name || 'Not set'}\n`);

    // Ask what to update
    const updateChoice = await question('What do you want to update? (1=Username, 2=Password, 3=Both): ');

    let newUsername = null;
    let newPassword = null;
    let newEmail = null;

    if (updateChoice === '1' || updateChoice === '3') {
      // Update username
      newUsername = await question('Enter new username: ');
      if (!newUsername || newUsername.trim().length === 0) {
        console.log('❌ Username cannot be empty');
        process.exit(1);
      }
      newUsername = newUsername.trim();

      // Check if username already exists
      const existing = await pool.query(
        'SELECT id FROM users WHERE username = $1 AND id != $2',
        [newUsername, admin.id]
      );
      if (existing.rows.length > 0) {
        console.log('❌ Username already exists!');
        process.exit(1);
      }

      // Optional: update email
      const updateEmail = await question('Do you want to update the email? (y/n): ');
      if (updateEmail.toLowerCase() === 'y') {
        newEmail = await question('Enter new email (or leave blank): ');
        newEmail = newEmail.trim() || null;
      }
    }

    if (updateChoice === '2' || updateChoice === '3') {
      // Update password
      newPassword = await question('Enter new password (min 6 characters): ');
      if (!newPassword || newPassword.length < 6) {
        console.log('❌ Password must be at least 6 characters');
        process.exit(1);
      }

      const confirmPassword = await question('Confirm new password: ');
      if (newPassword !== confirmPassword) {
        console.log('❌ Passwords do not match!');
        process.exit(1);
      }
    }

    // Confirm update
    console.log('\n📝 Changes to be made:');
    if (newUsername) {
      console.log(`  Username: ${admin.username} → ${newUsername}`);
      if (newEmail !== null) {
        console.log(`  Email: ${admin.email || '(none)'} → ${newEmail || '(none)'}`);
      }
    }
    if (newPassword) {
      console.log(`  Password: Will be updated (hidden for security)`);
    }

    const confirm = await question('\nProceed with update? (yes/no): ');
    if (confirm.toLowerCase() !== 'yes') {
      console.log('❌ Update cancelled');
      process.exit(0);
    }

    // Perform update
    console.log('\n⏳ Updating credentials...');

    const updates = [];
    const values = [];
    let paramCount = 1;

    if (newUsername) {
      updates.push(`username = $${paramCount++}`);
      values.push(newUsername);

      if (newEmail !== null) {
        updates.push(`email = $${paramCount++}`);
        values.push(newEmail);
      }
    }

    if (newPassword) {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      updates.push(`password_hash = $${paramCount++}`);
      values.push(hashedPassword);
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(admin.id);

    const updateQuery = `
      UPDATE users 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, username, email, full_name, role
    `;

    const result = await pool.query(updateQuery, values);
    const updatedAdmin = result.rows[0];

    console.log('✅ Credentials updated successfully!\n');
    console.log('New admin account details:');
    console.log(`  ID: ${updatedAdmin.id}`);
    console.log(`  Username: ${updatedAdmin.username}`);
    console.log(`  Email: ${updatedAdmin.email || 'Not set'}`);
    console.log(`  Full Name: ${updatedAdmin.full_name || 'Not set'}`);
    console.log(`  Role: ${updatedAdmin.role}`);
    
    if (newPassword) {
      console.log(`\n🔑 New login credentials:`);
      console.log(`  Username: ${updatedAdmin.username}`);
      console.log(`  Password: ${newPassword}`);
      console.log(`\n⚠️  Make sure to save these credentials securely!`);
    }

    console.log('\n✨ You can now login with the new credentials.');

  } catch (error) {
    console.error('❌ Error updating credentials:', error.message);
    process.exit(1);
  } finally {
    rl.close();
    await pool.end();
  }
}

// Run the script
updateCredentials();
