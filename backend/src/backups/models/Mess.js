const pool = require('../config/database');

class Mess {
  // Get all messes
  static async findAll(activeOnly = true) {
    const query = activeOnly
      ? 'SELECT * FROM messes WHERE is_active = true ORDER BY name'
      : 'SELECT * FROM messes ORDER BY name';

    const result = await pool.query(query);
    return result.rows;
  }

  // Get mess by ID
  static async findById(id) {
    const query = 'SELECT * FROM messes WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Get mess by name
  static async findByName(name) {
    const query = 'SELECT * FROM messes WHERE LOWER(name) = LOWER($1)';
    const result = await pool.query(query, [name]);
    return result.rows[0];
  }

  // Create new mess
  static async create(messData) {
    const { name, location, contact_person, phone } = messData;

    const query = `
      INSERT INTO messes (name, location, contact_person, phone)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const values = [name, location || null, contact_person || null, phone || null];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Update mess
  static async update(id, messData) {
    const { name, location, contact_person, phone, is_active } = messData;

    const query = `
      UPDATE messes
      SET
        name = COALESCE($1, name),
        location = COALESCE($2, location),
        contact_person = COALESCE($3, contact_person),
        phone = COALESCE($4, phone),
        is_active = COALESCE($5, is_active),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING *
    `;

    const values = [name, location, contact_person, phone, is_active, id];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Delete mess (soft delete)
  static async delete(id) {
    const query = `
      UPDATE messes
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Get mess with distribution summary
  static async getWithSummary(id) {
    const query = `
      SELECT
        m.*,
        COALESCE(mds.total_distributions, 0) as total_distributions,
        COALESCE(mds.total_crates_received, 0) as total_crates_received,
        COALESCE(mds.total_value, 0) as total_value
      FROM messes m
      LEFT JOIN v_mess_distribution_summary mds ON m.id = mds.mess_id
      WHERE m.id = $1
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Get all messes with distribution summaries
  static async getAllWithSummary() {
    const query = `
      SELECT
        m.*,
        COALESCE(mds.total_distributions, 0) as total_distributions,
        COALESCE(mds.total_crates_received, 0) as total_crates_received,
        COALESCE(mds.total_value, 0) as total_value
      FROM messes m
      LEFT JOIN v_mess_distribution_summary mds ON m.id = mds.mess_id
      WHERE m.is_active = true
      ORDER BY m.name
    `;

    const result = await pool.query(query);
    return result.rows;
  }
}

module.exports = Mess;
