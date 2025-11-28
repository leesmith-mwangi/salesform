const pool = require('../config/database');

class Payment {
  // Get all payments
  static async findAll(limit = 100, offset = 0) {
    const query = `
      SELECT
        p.*,
        m.name as mess_name,
        m.contact_person
      FROM payments p
      JOIN messes m ON p.mess_id = m.id
      ORDER BY p.payment_date DESC, p.created_at DESC
      LIMIT $1 OFFSET $2
    `;

    const result = await pool.query(query, [limit, offset]);
    return result.rows;
  }

  // Get payment by ID
  static async findById(id) {
    const query = `
      SELECT
        p.*,
        m.name as mess_name,
        m.location,
        m.contact_person,
        m.phone
      FROM payments p
      JOIN messes m ON p.mess_id = m.id
      WHERE p.id = $1
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Get payments by mess
  static async findByMess(messId, limit = 100) {
    const query = `
      SELECT *
      FROM payments
      WHERE mess_id = $1
      ORDER BY payment_date DESC
      LIMIT $2
    `;

    const result = await pool.query(query, [messId, limit]);
    return result.rows;
  }

  // Create payment record
  static async create(paymentData) {
    const {
      mess_id,
      amount_paid,
      payment_date,
      payment_method,
      reference_number,
      notes
    } = paymentData;

    const query = `
      INSERT INTO payments (
        mess_id,
        amount_paid,
        payment_date,
        payment_method,
        reference_number,
        notes
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const values = [
      mess_id,
      amount_paid,
      payment_date || new Date().toISOString().split('T')[0],
      payment_method || null,
      reference_number || null,
      notes || null
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Update payment
  static async update(id, paymentData) {
    const {
      amount_paid,
      payment_date,
      payment_method,
      reference_number,
      notes
    } = paymentData;

    const query = `
      UPDATE payments
      SET
        amount_paid = COALESCE($1, amount_paid),
        payment_date = COALESCE($2, payment_date),
        payment_method = COALESCE($3, payment_method),
        reference_number = COALESCE($4, reference_number),
        notes = COALESCE($5, notes),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING *
    `;

    const values = [amount_paid, payment_date, payment_method, reference_number, notes, id];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Delete payment
  static async delete(id) {
    const query = 'DELETE FROM payments WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Get total payments for a mess
  static async getTotalPaidByMess(messId) {
    const query = `
      SELECT
        COALESCE(SUM(amount_paid), 0) as total_paid,
        COUNT(*) as payment_count
      FROM payments
      WHERE mess_id = $1
    `;

    const result = await pool.query(query, [messId]);
    return result.rows[0];
  }

  // Get financial summary for a mess (total owed vs paid)
  static async getMessFinancialSummary(messId) {
    const query = `
      SELECT * FROM v_mess_financial_summary
      WHERE mess_id = $1
    `;

    const result = await pool.query(query, [messId]);
    return result.rows[0];
  }

  // Get all mess financial summaries
  static async getAllMessFinancialSummaries() {
    const query = 'SELECT * FROM v_mess_financial_summary ORDER BY mess_name';
    const result = await pool.query(query);
    return result.rows;
  }
}

module.exports = Payment;
