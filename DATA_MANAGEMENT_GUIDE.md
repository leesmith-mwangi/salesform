# Data Management Guide

## 🗑️ Clearing Test Data

### Option 1: Clear Transactions Only (Keep Products & Messes)
This removes all test transactions but keeps your products and messes setup.

**What gets deleted:**
- ✅ All distributions
- ✅ All inventory records  
- ✅ All payments
- ✅ All sessions
- ✅ All audit logs

**What stays:**
- ✓ Products (beer brands)
- ✓ Messes
- ✓ Users (admin account)
- ✓ Attendants

```bash
cd backend
node clear-test-data.js
```

### Option 2: Clear Everything (Including Products)
This removes ALL data except users.

**What gets deleted:**
- ✅ All distributions
- ✅ All inventory records
- ✅ All payments
- ✅ All products
- ✅ All messes
- ✅ All attendants
- ✅ All sessions

**What stays:**
- ✓ Users (admin account)

```bash
cd backend
node clear-all-data.js
```

### Option 3: Manual SQL (Select What to Delete)

```bash
# Connect to database
cd backend
psql -d salesform_db

# Then run individual DELETE commands:
DELETE FROM payments;           # Clear payments
DELETE FROM distributions;      # Clear distributions  
DELETE FROM inventory;          # Clear inventory
DELETE FROM products;           # Clear products
DELETE FROM messes;            # Clear messes
```

---

## 📦 Managing Products

### Method 1: Using the Quick Script

**Step 1:** Edit the product list in `backend/add-products.js`

```javascript
const PRODUCTS_TO_ADD = [
  {
    name: 'Tusker Lager',
    units_per_package: 24,
    unit_type: 'crate',
    description: 'Premium Kenyan Lager Beer'
  },
  {
    name: 'Heineken',
    units_per_package: 24,
    unit_type: 'crate',
    description: 'Heineken Premium Lager'
  },
  // Add more products here...
];

// To delete products, add them here:
const PRODUCTS_TO_DELETE = [
  { name: 'Old Product Name' },
  { id: 5 },  // Or use ID
];
```

**Step 2:** Run the script

```bash
cd backend
node add-products.js
```

This will:
- Delete specified products
- Add new products
- Show final product list

### Method 2: View Current Products

```bash
cd backend
node manage-products.js
```

This shows all products and gives you SQL examples for managing them.

### Method 3: Direct SQL Commands

#### Add a Single Product

```sql
INSERT INTO products (name, units_per_package, unit_type, description)
VALUES ('Corona Extra', 24, 'crate', 'Corona Extra Mexican Beer');
```

**For spirits/bottles (sold as pieces):**
```sql
INSERT INTO products (name, units_per_package, unit_type, description)
VALUES ('Johnnie Walker Black', 1, 'piece', 'Johnnie Walker Black Label 750ml');
```

#### Delete a Product

**By ID:**
```sql
DELETE FROM products WHERE id = 5;
```

**By name:**
```sql
DELETE FROM products WHERE name = 'Old Beer';
```

⚠️ **Note:** Cannot delete if product is used in distributions or inventory. Clear those first or deactivate instead.

#### Update a Product

```sql
UPDATE products 
SET name = 'New Name',
    units_per_package = 30,
    description = 'New description'
WHERE id = 1;
```

#### Deactivate a Product (Hide from Dropdown)

Instead of deleting, you can hide it:

```sql
UPDATE products SET is_active = false WHERE id = 5;
```

To reactivate:
```sql
UPDATE products SET is_active = true WHERE id = 5;
```

#### View All Products

```sql
SELECT id, name, units_per_package, unit_type, is_active 
FROM products 
ORDER BY name;
```

---

## 📋 Common Scenarios

### Scenario 1: Starting Fresh

```bash
# 1. Clear all test data
cd backend
node clear-all-data.js

# 2. Add your products
node add-products.js

# 3. Add messes via the UI or SQL:
# Go to http://localhost:3000 → Messes → Add New Mess
```

### Scenario 2: Remove Specific Products

**Edit `backend/add-products.js`:**

```javascript
const PRODUCTS_TO_DELETE = [
  { name: 'Balozi' },
  { name: 'White Cap' },
  { id: 10 }
];
```

**Run:**
```bash
cd backend
node add-products.js
```

### Scenario 3: Add New Products to Existing List

**Edit `backend/add-products.js`:**

```javascript
const PRODUCTS_TO_ADD = [
  {
    name: 'Heineken',
    units_per_package: 24,
    unit_type: 'crate',
    description: 'Heineken Premium Lager'
  },
  {
    name: 'Corona Extra',
    units_per_package: 24,
    unit_type: 'crate',
    description: 'Corona Extra'
  }
];

// Leave delete array empty
const PRODUCTS_TO_DELETE = [];
```

**Run:**
```bash
node add-products.js
```

### Scenario 4: Replace All Products

```bash
# 1. Clear everything
node clear-all-data.js

# 2. Edit add-products.js with your complete list

# 3. Run it
node add-products.js
```

---

## 🍺 Example Product Lists

### Beer/Crates (unit_type: 'crate')

```javascript
{
  name: 'Tusker Lager',
  units_per_package: 24,
  unit_type: 'crate',
  description: 'Premium Kenyan Lager'
},
{
  name: 'Guinness',
  units_per_package: 24,
  unit_type: 'crate',
  description: 'Guinness Stout'
},
{
  name: 'Heineken',
  units_per_package: 24,
  unit_type: 'crate',
  description: 'Heineken Lager'
},
{
  name: 'Corona Extra',
  units_per_package: 24,
  unit_type: 'crate',
  description: 'Mexican Beer'
}
```

### Spirits/Bottles (unit_type: 'piece')

```javascript
{
  name: 'Johnnie Walker Red',
  units_per_package: 1,
  unit_type: 'piece',
  description: 'Johnnie Walker Red Label 750ml'
},
{
  name: 'Johnnie Walker Black',
  units_per_package: 1,
  unit_type: 'piece',
  description: 'Johnnie Walker Black Label 750ml'
},
{
  name: 'Smirnoff Vodka',
  units_per_package: 1,
  unit_type: 'piece',
  description: 'Smirnoff Vodka 750ml'
},
{
  name: 'Baileys',
  units_per_package: 1,
  unit_type: 'piece',
  description: 'Baileys Irish Cream 750ml'
}
```

---

## 🔍 Checking Product Usage

Before deleting a product, check if it's being used:

```sql
-- Check distributions
SELECT COUNT(*) as distributions_count 
FROM distributions 
WHERE product_id = 5;

-- Check inventory
SELECT COUNT(*) as inventory_count 
FROM inventory 
WHERE product_id = 5;

-- If both are 0, safe to delete
-- If not, you must delete those records first or deactivate the product
```

---

## 🏢 Managing Messes

### View Current Messes

```bash
cd backend
psql -d salesform_db -c "SELECT * FROM messes;"
```

### Add a Mess

**Via UI:**
1. Go to http://localhost:3000
2. Click "🏢 Messes"
3. Click "Add New Mess"
4. Fill in details

**Via SQL:**
```sql
INSERT INTO messes (name, location, contact_person, phone)
VALUES ('Officers Mess', 'Block A', 'John Doe', '+254-712-345-678');
```

### Delete a Mess

```sql
DELETE FROM messes WHERE id = 3;
```

⚠️ **Warning:** Cannot delete if mess has distributions. Clear distributions first.

### Deactivate a Mess

```sql
UPDATE messes SET is_active = false WHERE id = 3;
```

---

## ⚠️ Important Notes

### Before Deleting Products:
1. **Check usage** - Product cannot be deleted if used in distributions/inventory
2. **Consider deactivating** - Use `is_active = false` to hide instead of delete
3. **Backup first** - Export data before major deletions

### Foreign Key Constraints:
- Products → Used in distributions and inventory
- Messes → Used in distributions and payments
- You must delete child records first

### Data Preservation:
- User accounts are NEVER deleted by these scripts
- Always keep at least one admin user

---

## 🛠️ Quick Reference Commands

```bash
# Navigate to backend
cd /home/smith/projects/salesform/backend

# Clear test data (keep products/messes)
node clear-test-data.js

# Clear everything (except users)
node clear-all-data.js

# View products
node manage-products.js

# Add/delete products
node add-products.js

# Connect to database
psql -d salesform_db

# View all tables
psql -d salesform_db -c "\dt"

# Count records
psql -d salesform_db -c "SELECT 'products' as table, COUNT(*) FROM products 
UNION SELECT 'inventory', COUNT(*) FROM inventory 
UNION SELECT 'distributions', COUNT(*) FROM distributions;"
```

---

## 💾 Backup Before Clearing

Always backup before clearing data:

```bash
# Backup entire database
pg_dump salesform_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup just data
pg_dump --data-only salesform_db > data_backup.sql

# Restore from backup
psql salesform_db < backup_file.sql
```

---

## 📞 Support

If you encounter errors:

**"Cannot delete, foreign key constraint"**
- Product/mess is being used
- Clear dependent records first or use deactivate

**"Permission denied"**
- Check database user permissions
- Use admin account

**"Table does not exist"**
- Run database setup: `node src/config/setup.js`

---

**Remember:** Test in a development environment first! 🚀
