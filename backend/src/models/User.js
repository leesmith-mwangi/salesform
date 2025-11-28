const pool = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  // Find user by username
  static async findByUsername(username) {
    const query = 'SELECT * FROM users WHERE username = $1';
    const result = await pool.query(query, [username]);
    return result.rows[0];
  }

  // Find user by email
  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  // Find user by ID
  static async findById(id) {
    const query = 'SELECT id, username, email, full_name, role, is_active, last_login, created_at FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Get all users (exclude password hash)
  static async findAll() {
    const query = `
      SELECT id, username, email, full_name, role, is_active, last_login, created_at 
      FROM users 
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  // Create new user
  static async create(userData) {
    const { username, email, password, full_name, role = 'user' } = userData;

    // Hash password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    const query = `
      INSERT INTO users (username, email, password_hash, full_name, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, username, email, full_name, role, is_active, created_at
    `;

    const result = await pool.query(query, [
      username,
      email,
      password_hash,
      full_name,
      role
    ]);

    return result.rows[0];
  }

  // Verify password
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Update last login timestamp
  static async updateLastLogin(userId) {
    const query = `
      UPDATE users 
      SET last_login = CURRENT_TIMESTAMP 
      WHERE id = $1
      RETURNING last_login
    `;
    const result = await pool.query(query, [userId]);
    return result.rows[0];
  }

  // Update user profile
  static async update(id, userData) {
    const { email, full_name, role } = userData;

    const query = `
      UPDATE users 
      SET 
        email = COALESCE($1, email),
        full_name = COALESCE($2, full_name),
        role = COALESCE($3, role),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING id, username, email, full_name, role, is_active, updated_at
    `;

    const result = await pool.query(query, [email, full_name, role, id]);
    return result.rows[0];
  }

  // Change password
  static async changePassword(userId, newPassword) {
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(newPassword, saltRounds);

    const query = `
      UPDATE users 
      SET password_hash = $1, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $2
      RETURNING id, username
    `;

    const result = await pool.query(query, [password_hash, userId]);
    return result.rows[0];
  }

  // Deactivate user
  static async deactivate(id) {
    const query = `
      UPDATE users 
      SET is_active = false, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $1
      RETURNING id, username, is_active
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Activate user
  static async activate(id) {
    const query = `
      UPDATE users 
      SET is_active = true, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $1
      RETURNING id, username, is_active
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Delete user
  static async delete(id) {
    const query = 'DELETE FROM users WHERE id = $1 RETURNING id, username';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Check if username exists
  static async usernameExists(username) {
    const query = 'SELECT EXISTS(SELECT 1 FROM users WHERE username = $1)';
    const result = await pool.query(query, [username]);
    return result.rows[0].exists;
  }

  // Check if email exists
  static async emailExists(email) {
    const query = 'SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)';
    const result = await pool.query(query, [email]);
    return result.rows[0].exists;
  }
}

module.exports = User;
