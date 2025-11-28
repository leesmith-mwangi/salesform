-- NOTE: This file is deprecated. Use update-views.js script instead.
-- Fix for v_current_stock view to prevent Cartesian product issues

DROP VIEW IF EXISTS v_current_stock;

CREATE VIEW v_current_stock AS
SELECT
  p.id AS product_id,
  p.name AS product_name,
  COALESCE(inv.total_added, 0) AS total_added,
  COALESCE(dist.total_distributed, 0) AS total_distributed,
  COALESCE(inv.total_added, 0) - COALESCE(dist.total_distributed, 0) AS current_stock
FROM products p
LEFT JOIN (
  SELECT product_id, SUM(quantity) AS total_added
  FROM inventory
  GROUP BY product_id
) inv ON p.id = inv.product_id
LEFT JOIN (
  SELECT product_id, SUM(quantity) AS total_distributed
  FROM distributions
  GROUP BY product_id
) dist ON p.id = dist.product_id
WHERE p.is_active = true
ORDER BY p.name;
