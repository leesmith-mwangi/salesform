-- Add attendants table to track mess attendants
-- Run this migration to add attendants functionality

-- ============================================
-- ATTENDANTS TABLE
-- Tracks attendants/staff for each mess
-- ============================================
CREATE TABLE IF NOT EXISTS attendants (
  id SERIAL PRIMARY KEY,
  mess_id INTEGER NOT NULL REFERENCES messes(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  role VARCHAR(100), -- 'Manager', 'Attendant', 'Supervisor', etc.
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster queries by mess
CREATE INDEX IF NOT EXISTS idx_attendants_mess ON attendants(mess_id);

-- Trigger: Update updated_at on attendants
DROP TRIGGER IF EXISTS update_attendants_updated_at ON attendants;
CREATE TRIGGER update_attendants_updated_at
BEFORE UPDATE ON attendants
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Add attendant_id to distributions table (optional - to track who received the stock)
ALTER TABLE distributions 
ADD COLUMN IF NOT EXISTS attendant_id INTEGER REFERENCES attendants(id) ON DELETE SET NULL;

-- Index for attendant in distributions
CREATE INDEX IF NOT EXISTS idx_distributions_attendant ON distributions(attendant_id);

-- Insert sample attendants for each mess
INSERT INTO attendants (mess_id, name, phone, role) VALUES
-- Constables Mess attendants
(1, 'John Kamau', '+254-720-111-222', 'Manager'),
(1, 'Mary Wanjiku', '+254-720-111-333', 'Attendant'),
(1, 'Peter Ochieng', '+254-720-111-444', 'Supervisor'),

-- Officers Mess attendants
(2, 'Patrick Musyoki', '+254-721-222-333', 'Manager'),
(2, 'Jerrad Muisyo', '+254-721-222-444', 'Attendant'),

-- NCOs Mess attendants
(3, 'Grace Njeri', '+254-722-333-444', 'Manager'),
(3, 'David Kipchoge', '+254-722-333-555', 'Attendant'),
(3, 'Alice Moraa', '+254-722-333-666', 'Supervisor')
ON CONFLICT DO NOTHING;

-- Comment for documentation
COMMENT ON TABLE attendants IS 'Tracks attendants/staff for each mess who receive stock distributions';
