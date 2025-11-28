-- Add payments table to track payments received from messes
-- Run this migration to add payment tracking functionality

-- ============================================
-- PAYMENTS TABLE
-- Tracks payments received from messes
-- ============================================
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  mess_id INTEGER NOT NULL REFERENCES messes(id) ON DELETE CASCADE,
  amount_paid DECIMAL(10, 2) NOT NULL,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method VARCHAR(50), -- 'cash', 'bank_transfer', 'cheque', etc.
  reference_number VARCHAR(100), -- Receipt number, transaction ID, etc.
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT positive_payment CHECK (amount_paid > 0)
);

-- Index for faster queries by mess
CREATE INDEX IF NOT EXISTS idx_payments_mess ON payments(mess_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date);

-- Trigger: Update updated_at on payments
DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
CREATE TRIGGER update_payments_updated_at
BEFORE UPDATE ON payments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VIEW: Mess Financial Summary
-- Shows total value owed, amount paid, and balance for each mess
-- ============================================
CREATE OR REPLACE VIEW v_mess_financial_summary AS
SELECT
  m.id AS mess_id,
  m.name AS mess_name,
  m.location,
  m.contact_person,
  m.phone,
  COALESCE(dist.total_value, 0) AS total_value,
  COALESCE(pay.total_paid, 0) AS amount_paid,
  COALESCE(dist.total_value, 0) - COALESCE(pay.total_paid, 0) AS balance,
  COALESCE(dist.total_units, 0) AS total_units_received,
  COALESCE(dist.distribution_count, 0) AS distribution_count,
  COALESCE(pay.payment_count, 0) AS payment_count
FROM messes m
LEFT JOIN (
  SELECT 
    mess_id, 
    SUM(total_value) AS total_value,
    SUM(quantity) AS total_units,
    COUNT(*) AS distribution_count
  FROM distributions
  GROUP BY mess_id
) dist ON m.id = dist.mess_id
LEFT JOIN (
  SELECT 
    mess_id, 
    SUM(amount_paid) AS total_paid,
    COUNT(*) AS payment_count
  FROM payments
  GROUP BY mess_id
) pay ON m.id = pay.mess_id
WHERE m.is_active = true
ORDER BY m.name;

-- Comment for documentation
COMMENT ON TABLE payments IS 'Tracks payments received from messes';
COMMENT ON VIEW v_mess_financial_summary IS 'Shows financial summary including total owed, paid, and balance for each mess';
