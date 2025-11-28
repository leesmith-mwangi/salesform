# Frontend & Backend Updates for Crates/Pieces Support

## ✅ Completed Updates:

### Database:
- ✅ Added `unit_type` column to products ('crate' or 'piece')
- ✅ Renamed `bottles_per_crate` → `units_per_package`
- ✅ Renamed `quantity_crates` → `quantity` (inventory & distributions)
- ✅ Renamed `price_per_crate` → `price_per_unit` (distributions)
- ✅ Updated views (v_current_stock)

### Frontend:
- ✅ Updated AddStock.js - dynamic labels for crates/pieces
- ✅ Updated DistributeStock.js - dynamic labels for crates/pieces

## ⚠️ Pending Updates (Backend Controllers):

### Need to update these files:
1. `/backend/src/controllers/inventoryController.js`
   - Change `quantity_crates` → `quantity`
   - Change `purchase_price_per_crate` → `purchase_price_per_unit`

2. `/backend/src/controllers/distributionController.js`
   - Change `quantity_crates` → `quantity`
   - Change `price_per_crate` → `price_per_unit`

3. `/backend/src/models/Inventory.js`
   - Update column names in SQL queries

4. `/backend/src/models/Distribution.js`
   - Update column names in SQL queries

5. `/backend/src/models/Product.js`
   - Add `unit_type` field support

## 🔧 Quick Fix Script Needed:
Run a find-and-replace across backend:
- `quantity_crates` → `quantity`
- `price_per_crate` → `price_per_unit` (in distributions)
- `purchase_price_per_crate` → `purchase_price_per_unit` (in inventory)

After these updates, restart the backend server.
