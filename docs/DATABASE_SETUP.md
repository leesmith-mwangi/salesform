# Database Setup Guide

## Prerequisites

1. **PostgreSQL installed** on your system
   - Download from: https://www.postgresql.org/download/
   - Or install via package manager:
     ```bash
     # Ubuntu/Debian
     sudo apt install postgresql postgresql-contrib

     # macOS (Homebrew)
     brew install postgresql

     # Windows
     # Download installer from postgresql.org
     ```

2. **PostgreSQL service running**
   ```bash
   # Check if PostgreSQL is running
   sudo systemctl status postgresql    # Linux
   brew services list                  # macOS
   # Windows: Check Services app
   ```

## Setup Steps

### Step 1: Create Database

Option A: Using PostgreSQL command line (psql)
```bash
# Login to PostgreSQL
sudo -u postgres psql

# Create database
CREATE DATABASE salesform_db;

# Create user (optional, if not using default postgres user)
CREATE USER salesform_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE salesform_db TO salesform_user;

# Exit
\q
```

Option B: Using pgAdmin GUI
- Open pgAdmin
- Right-click on "Databases" → "Create" → "Database"
- Enter database name: `salesform_db`
- Click "Save"

### Step 2: Configure Environment Variables

1. Navigate to backend folder:
   ```bash
   cd backend
   ```

2. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

3. Edit `.env` file with your database credentials:
   ```
   DB_USER=postgres
   DB_HOST=localhost
   DB_NAME=salesform_db
   DB_PASSWORD=your_password
   DB_PORT=5432
   ```

### Step 3: Run Database Setup Script

This will create all tables, views, triggers, and insert seed data:

```bash
cd backend
node src/config/setup.js
```

Expected output:
```
Connected to PostgreSQL database
Starting database setup...
✓ Database schema created successfully
✓ Tables: products, messes, inventory, distributions, transactions
✓ Views created for reporting
✓ Seed data inserted (5 beer brands, 3 messes)
Database setup completed successfully!

=== Database is ready to use ===
```

### Step 4: Verify Database Setup

Option A: Using psql
```bash
# Login to database
psql -U postgres -d salesform_db

# List all tables
\dt

# View products
SELECT * FROM products;

# View messes
SELECT * FROM messes;

# View current stock (should be empty initially)
SELECT * FROM v_current_stock;

# Exit
\q
```

Option B: Using pgAdmin
- Connect to salesform_db
- Navigate to Schemas → public → Tables
- Right-click on any table → View/Edit Data → All Rows

## Database Schema Overview

### Tables Created

1. **products** - Beer brands and pricing
   - Fields: id, name, price_per_crate, bottles_per_crate, description, is_active, timestamps

2. **messes** - Restaurant/mess information
   - Fields: id, name, location, contact_person, phone, is_active, timestamps

3. **inventory** - Stock purchases from suppliers
   - Fields: id, product_id, quantity_crates, purchase_price_per_crate, supplier_name, date_added, notes, timestamps

4. **distributions** - Stock distributed to messes
   - Fields: id, mess_id, product_id, quantity_crates, price_per_crate, total_value (calculated), distribution_date, notes, timestamps

5. **transactions** - Financial transaction records (optional)
   - Fields: id, transaction_type, reference_id, reference_table, amount, transaction_date, description, timestamps

### Views for Reporting

1. **v_current_stock** - Current warehouse inventory per product
2. **v_mess_distribution_summary** - Distribution totals per mess
3. **v_product_distribution_summary** - Distribution totals per product

### Seed Data Inserted

**Products (Beer Brands):**
- Guinness - 3000 KSH per crate
- Tusker - 2800 KSH per crate
- Balozi - 2500 KSH per crate
- Pilsner - 2700 KSH per crate
- White Cap - 2600 KSH per crate

**Messes:**
- Mess 1 - Main Canteen
- Mess 2 - Officers Mess
- Mess 3 - Junior Ranks Mess

## Troubleshooting

### Connection Failed
- Check if PostgreSQL service is running
- Verify credentials in `.env` file
- Check if database `salesform_db` exists
- Verify PostgreSQL is listening on port 5432

### Permission Denied
- Grant proper privileges to database user
- Run: `GRANT ALL PRIVILEGES ON DATABASE salesform_db TO your_user;`

### Schema Already Exists
- The schema uses `IF NOT EXISTS` and `ON CONFLICT DO NOTHING`
- Safe to run multiple times
- To reset: Drop database and recreate

### Reset Database
```sql
-- Login to postgres
sudo -u postgres psql

-- Drop existing database
DROP DATABASE IF EXISTS salesform_db;

-- Create fresh database
CREATE DATABASE salesform_db;

-- Exit and run setup script again
\q
node src/config/setup.js
```

## Next Steps

After successful database setup:
1. Start the backend server: `npm run dev`
2. Test API endpoints
3. Proceed to Phase 2: Backend API Development
