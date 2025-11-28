# 📦 Product Management Guide

Simple guide with examples for adding and deleting products in your Sales & Distribution system.

---

## ✅ Adding Products

### Method 1: Using the Script (Easiest)

**Step 1:** Open the script
```bash
cd /home/smith/projects/salesform/backend
nano add-products.js
```

**Step 2:** Edit the `PRODUCTS_TO_ADD` array. For example, to add "Bread" and "Butter":

```javascript
const PRODUCTS_TO_ADD = [
  {
    name: 'Bread',
    unit_type: 'crates',
    pieces_per_crate: 20,
    price_per_unit: 150.00
  },
  {
    name: 'Butter',
    unit_type: 'crates', 
    pieces_per_crate: 24,
    price_per_unit: 800.00
  }
];
```

**Step 3:** Save (Ctrl+O, Enter, Ctrl+X) and run:
```bash
node add-products.js
```

**Output:**
```
✅ Added: Bread (ID: 8)
✅ Added: Butter (ID: 9)
📦 Current products in database: 9
```

---

### Method 2: Using Database Command

Add a single product directly:

```bash
psql -d salesform_db -c "
INSERT INTO products (name, unit_type, pieces_per_crate, price_per_unit) 
VALUES ('Bread', 'crates', 20, 150.00);
"
```

**Example: Add multiple products at once**
```bash
psql -d salesform_db -c "
INSERT INTO products (name, unit_type, pieces_per_crate, price_per_unit) 
VALUES 
  ('Bread', 'crates', 20, 150.00),
  ('Butter', 'crates', 24, 800.00),
  ('Jam', 'crates', 12, 350.00);
"
```

---

## 🗑️ Deleting Products

### Method 1: Using the Script (Safest)

**Step 1:** Open the script
```bash
cd /home/smith/projects/salesform/backend
nano add-products.js
```

**Step 2:** Edit the `PRODUCTS_TO_DELETE` array. For example, to delete product with ID 2:

```javascript
const PRODUCTS_TO_DELETE = [2];  // Delete product ID 2
```

Or delete multiple products:
```javascript
const PRODUCTS_TO_DELETE = [2, 5, 8];  // Delete IDs 2, 5, and 8
```

**Step 3:** Save and run:
```bash
node add-products.js
```

**Output:**
```
✅ Deleted product ID: 2
✅ Deleted product ID: 5
⚠️  Could not delete product ID: 8 - Still referenced in distributions
```

---

### Method 2: Using Database Command

**Step 1:** First, check what product you want to delete:
```bash
psql -d salesform_db -c "SELECT id, name FROM products ORDER BY id;"
```

**Output example:**
```
 id |   name   
----+----------
  1 | Milk
  2 | Eggs
  3 | Bread
  4 | Juice
```

**Step 2:** Check if the product is being used (has distributions):
```bash
psql -d salesform_db -c "
SELECT COUNT(*) as distribution_count 
FROM distributions 
WHERE product_id = 2;
"
```

**If count is 0**, safe to delete:
```bash
psql -d salesform_db -c "DELETE FROM products WHERE id = 2;"
```

**If count is > 0**, you have 2 options:

**Option A:** Delete the product and its distribution history:
```bash
# First delete distributions
psql -d salesform_db -c "DELETE FROM distributions WHERE product_id = 2;"

# Then delete the product
psql -d salesform_db -c "DELETE FROM products WHERE id = 2;"
```

**Option B:** Just hide it (recommended - keeps history):
```bash
psql -d salesform_db -c "
UPDATE products 
SET is_active = false 
WHERE id = 2;
"
```

---

## 📋 Common Examples

### Example 1: Replace "Eggs" with "Organic Eggs"

```bash
cd /home/smith/projects/salesform/backend
nano add-products.js
```

Edit:
```javascript
const PRODUCTS_TO_DELETE = [2];  // Assuming Eggs is ID 2

const PRODUCTS_TO_ADD = [
  {
    name: 'Organic Eggs',
    unit_type: 'crates',
    pieces_per_crate: 30,
    price_per_unit: 200.00
  }
];
```

Run: `node add-products.js`

---

### Example 2: Add 3 new products at once

```bash
cd /home/smith/projects/salesform/backend
nano add-products.js
```

Edit:
```javascript
const PRODUCTS_TO_ADD = [
  {
    name: 'Yogurt',
    unit_type: 'crates',
    pieces_per_crate: 24,
    price_per_unit: 180.00
  },
  {
    name: 'Cheese',
    unit_type: 'crates',
    pieces_per_crate: 12,
    price_per_unit: 450.00
  },
  {
    name: 'Orange Juice',
    unit_type: 'crates',
    pieces_per_crate: 12,
    price_per_unit: 320.00
  }
];

const PRODUCTS_TO_DELETE = [];  // Not deleting anything
```

Run: `node add-products.js`

---

### Example 3: Quick delete using SQL (product ID 5)

```bash
# Check if it's in use
psql -d salesform_db -c "SELECT COUNT(*) FROM distributions WHERE product_id = 5;"

# If count is 0, delete it
psql -d salesform_db -c "DELETE FROM products WHERE id = 5;"

# Verify it's gone
psql -d salesform_db -c "SELECT id, name FROM products ORDER BY id;"
```

---

## 🔍 Useful Commands

### View all products with IDs:
```bash
psql -d salesform_db -c "SELECT id, name, unit_type, pieces_per_crate, price_per_unit FROM products ORDER BY id;"
```

### Find which products are being used:
```bash
psql -d salesform_db -c "
SELECT 
  p.id, 
  p.name, 
  COUNT(d.id) as times_distributed
FROM products p
LEFT JOIN distributions d ON p.id = d.product_id
GROUP BY p.id, p.name
ORDER BY times_distributed DESC;
"
```

### View products with no distributions (safe to delete):
```bash
psql -d salesform_db -c "
SELECT p.id, p.name
FROM products p
LEFT JOIN distributions d ON p.id = d.product_id
WHERE d.id IS NULL
ORDER BY p.id;
"
```

---

## ⚠️ Important Notes

1. **Don't delete products with distribution history** - This will break your reports. Use `is_active = false` instead.

2. **Product IDs don't reuse** - If you delete ID 5, the next product will not be ID 5 again.

3. **Use the script for bulk operations** - Easier and safer than running multiple SQL commands.

4. **Always check before deleting** - Run the count query to see if the product has distributions.

5. **Backup first for production** - If you're deleting important data:
   ```bash
   pg_dump salesform_db > backup_$(date +%Y%m%d).sql
   ```

---

## 🆘 Quick Reference

| Task | Command |
|------|---------|
| Add products | `nano add-products.js` → edit PRODUCTS_TO_ADD → `node add-products.js` |
| Delete products | `nano add-products.js` → edit PRODUCTS_TO_DELETE → `node add-products.js` |
| View all products | `psql -d salesform_db -c "SELECT * FROM products;"` |
| Check if product used | `psql -d salesform_db -c "SELECT COUNT(*) FROM distributions WHERE product_id = X;"` |
| Hide product | `psql -d salesform_db -c "UPDATE products SET is_active = false WHERE id = X;"` |
| Delete unused product | `psql -d salesform_db -c "DELETE FROM products WHERE id = X;"` |

---

**👉 Most Common Workflow:**

1. View products: `psql -d salesform_db -c "SELECT id, name FROM products;"`
2. Edit script: `nano add-products.js`
3. Add to PRODUCTS_TO_ADD or PRODUCTS_TO_DELETE arrays
4. Run: `node add-products.js`
5. Done! ✅
