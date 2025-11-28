const pool = require('../config/database');

class Attendant {
  // Get all attendants
  static async findAll() {
    const query = `
      SELECT
        a.*,
        m.name as mess_name
      FROM attendants a
      JOIN messes m ON a.mess_id = m.id
      WHERE a.is_active = true
      ORDER BY m.name, a.name
    `;

    const result = await pool.query(query);
    return result.rows;
  }

  // Get attendant by ID
  static async findById(id) {
    const query = `
      SELECT
        a.*,
        m.name as mess_name
      FROM attendants a
      JOIN messes m ON a.mess_id = m.id
      WHERE a.id = $1
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Get attendants by mess
  static async findByMess(messId) {
    const query = `
      SELECT *
      FROM attendants
      WHERE mess_id = $1 AND is_active = true
      ORDER BY role, name
    `;

    const result = await pool.query(query, [messId]);
    return result.rows;
  }

  // Create attendant
  static async create(attendantData) {
    const { mess_id, name, phone, role } = attendantData;

    const query = `
      INSERT INTO attendants (mess_id, name, phone, role)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const values = [mess_id, name, phone || null, role || 'Attendant'];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Update attendant
  static async update(id, attendantData) {
    const { name, phone, role, is_active } = attendantData;

    const query = `
      UPDATE attendants
      SET
        name = COALESCE($1, name),
        phone = COALESCE($2, phone),
        role = COALESCE($3, role),
        is_active = COALESCE($4, is_active),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING *
    `;

    const values = [name, phone, role, is_active, id];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Delete attendant (soft delete)
  static async delete(id) {
    const query = `
      UPDATE attendants
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = Attendant;
