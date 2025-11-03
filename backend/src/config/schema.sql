-- Sales & Distribution Management System Database Schema
-- Created: 2025-11-02

-- Create database (run separately if needed)
-- CREATE DATABASE salesform_db;

-- ============================================
-- PRODUCTS TABLE
-- Stores information about beer brands
-- ============================================
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  price_per_crate DECIMAL(10, 2) NOT NULL,
  bottles_per_crate INTEGER NOT NULL DEFAULT 30,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- MESSES TABLE
-- Stores information about restaurants/messes
-- ============================================
CREATE TABLE IF NOT EXISTS messes (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  location VARCHAR(255),
  contact_person VARCHAR(255),
  phone VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INVENTORY TABLE
-- Tracks stock purchases from suppliers
-- ============================================
CREATE TABLE IF NOT EXISTS inventory (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity_crates INTEGER NOT NULL,
  purchase_price_per_crate DECIMAL(10, 2),
  supplier_name VARCHAR(255),
  supplier_contact VARCHAR(100),
  date_added DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT positive_quantity CHECK (quantity_crates > 0)
);

-- ============================================
-- DISTRIBUTIONS TABLE
-- Tracks stock distributed to messes
-- ============================================
CREATE TABLE IF NOT EXISTS distributions (
  id SERIAL PRIMARY KEY,
  mess_id INTEGER NOT NULL REFERENCES messes(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity_crates INTEGER NOT NULL,
  price_per_crate DECIMAL(10, 2) NOT NULL,
  total_value DECIMAL(10, 2) GENERATED ALWAYS AS (quantity_crates * price_per_crate) STORED,
  distribution_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT positive_distribution_quantity CHECK (quantity_crates > 0)
);

-- ============================================
-- TRANSACTIONS TABLE (Optional - for future use)
-- Tracks all financial transactions
-- ============================================
CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  transaction_type VARCHAR(50) NOT NULL, -- 'purchase' or 'distribution'
  reference_id INTEGER NOT NULL, -- ID from inventory or distributions table
  reference_table VARCHAR(50) NOT NULL, -- 'inventory' or 'distributions'
  amount DECIMAL(10, 2) NOT NULL,
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_inventory_product ON inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_date ON inventory(date_added);
CREATE INDEX IF NOT EXISTS idx_distributions_mess ON distributions(mess_id);
CREATE INDEX IF NOT EXISTS idx_distributions_product ON distributions(product_id);
CREATE INDEX IF NOT EXISTS idx_distributions_date ON distributions(distribution_date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date);

-- ============================================
-- VIEWS FOR COMMON QUERIES
-- ============================================

-- View: Current warehouse stock by product
CREATE OR REPLACE VIEW v_current_stock AS
SELECT
  p.id AS product_id,
  p.name AS product_name,
  COALESCE(SUM(i.quantity_crates), 0) AS total_purchased,
  COALESCE(SUM(d.quantity_crates), 0) AS total_distributed,
  COALESCE(SUM(i.quantity_crates), 0) - COALESCE(SUM(d.quantity_crates), 0) AS current_stock
FROM products p
LEFT JOIN inventory i ON p.id = i.product_id
LEFT JOIN distributions d ON p.id = d.product_id
WHERE p.is_active = true
GROUP BY p.id, p.name
ORDER BY p.name;

-- View: Distribution summary by mess
CREATE OR REPLACE VIEW v_mess_distribution_summary AS
SELECT
  m.id AS mess_id,
  m.name AS mess_name,
  COUNT(DISTINCT d.id) AS total_distributions,
  SUM(d.quantity_crates) AS total_crates_received,
  SUM(d.total_value) AS total_value
FROM messes m
LEFT JOIN distributions d ON m.id = d.mess_id
WHERE m.is_active = true
GROUP BY m.id, m.name
ORDER BY m.name;

-- View: Distribution summary by product
CREATE OR REPLACE VIEW v_product_distribution_summary AS
SELECT
  p.id AS product_id,
  p.name AS product_name,
  COUNT(d.id) AS total_distributions,
  SUM(d.quantity_crates) AS total_crates_distributed,
  SUM(d.total_value) AS total_revenue
FROM products p
LEFT JOIN distributions d ON p.id = d.product_id
WHERE p.is_active = true
GROUP BY p.id, p.name
ORDER BY total_revenue DESC;

-- ============================================
-- FUNCTIONS FOR BUSINESS LOGIC
-- ============================================

-- Function: Get available stock for a product
CREATE OR REPLACE FUNCTION get_available_stock(p_product_id INTEGER)
RETURNS INTEGER AS $$
DECLARE
  v_stock INTEGER;
BEGIN
  SELECT current_stock INTO v_stock
  FROM v_current_stock
  WHERE product_id = p_product_id;

  RETURN COALESCE(v_stock, 0);
END;
$$ LANGUAGE plpgsql;

-- Function: Update timestamp on record modification
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger: Update updated_at on products
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Update updated_at on messes
CREATE TRIGGER update_messes_updated_at
BEFORE UPDATE ON messes
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Update updated_at on inventory
CREATE TRIGGER update_inventory_updated_at
BEFORE UPDATE ON inventory
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Update updated_at on distributions
CREATE TRIGGER update_distributions_updated_at
BEFORE UPDATE ON distributions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SEED DATA
-- ============================================

-- Insert default beer brands
INSERT INTO products (name, price_per_crate, bottles_per_crate, description) VALUES
('Guinness', 3000.00, 30, 'Guinness Stout Beer'),
('Tusker', 2800.00, 30, 'Tusker Lager Beer'),
('Balozi', 2500.00, 30, 'Balozi Beer'),
('Pilsner', 2700.00, 30, 'Pilsner Lager'),
('White Cap', 2600.00, 30, 'White Cap Lager')
ON CONFLICT (name) DO NOTHING;

-- Insert the 3 messes
INSERT INTO messes (name, location, contact_person, phone) VALUES
('Mess 1 - Main Canteen', 'Main Camp Block A', 'John Doe', '+254-712-345-678'),
('Mess 2 - Officers Mess', 'Officers Quarters Block B', 'Jane Smith', '+254-723-456-789'),
('Mess 3 - Junior Ranks Mess', 'Junior Quarters Block C', 'Mike Johnson', '+254-734-567-890')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON TABLE products IS 'Stores beer brand information and pricing';
COMMENT ON TABLE messes IS 'Stores restaurant/mess information where beer is distributed';
COMMENT ON TABLE inventory IS 'Records all stock purchases from suppliers';
COMMENT ON TABLE distributions IS 'Records all stock distributions to messes';
COMMENT ON TABLE transactions IS 'Optional: Tracks financial transactions';

COMMENT ON VIEW v_current_stock IS 'Shows current available stock per product in warehouse';
COMMENT ON VIEW v_mess_distribution_summary IS 'Summary of distributions received by each mess';
COMMENT ON VIEW v_product_distribution_summary IS 'Summary of distributions and revenue per product';
