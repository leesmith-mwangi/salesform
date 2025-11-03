# Quick Start Guide - Phase 1 Testing

## Before You Start

You need to install PostgreSQL first. Phase 1 setup is complete, but you need PostgreSQL to test it.

## Step 1: Install PostgreSQL

### Ubuntu/Debian/WSL:
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl status postgresql  # Should show "active (running)"
```

### macOS:
```bash
brew install postgresql@14
brew services start postgresql@14
```

### Windows:
Download from: https://www.postgresql.org/download/windows/

## Step 2: Create Database

```bash
# Login to PostgreSQL
sudo -u postgres psql

# In PostgreSQL prompt, run:
CREATE DATABASE salesform_db;

# Check it was created
\l

# Exit PostgreSQL
\q
```

## Step 3: Run Database Setup

```bash
cd backend
npm run db:setup
```

**Expected Output:**
```
Connected to PostgreSQL database
Starting database setup...
✓ Database schema created successfully
✓ Tables: products, messes, inventory, distributions, transactions
✓ Views created for reporting
✓ Seed data inserted (5 beer brands, 3 messes)
Database setup completed successfully!
```

## Step 4: Test Database Connection

```bash
npm run db:test
```

**Expected Output:**
```
=== Testing Database Connection ===

1. Testing connection...
   ✓ Connected to PostgreSQL successfully

2. Testing database query...
   ✓ Query executed successfully

3. Checking database tables...
   ✓ Found tables:
     - distributions
     - inventory
     - messes
     - products
     - transactions

4. Checking seed data...
   Products: 5
   Messes: 3

5. Checking views...
   ✓ Found views:
     - v_current_stock
     - v_mess_distribution_summary
     - v_product_distribution_summary

=== ✓ All tests passed! Database is ready ===
```

## Step 5: Start the Server

```bash
npm run dev
```

**Expected Output:**
```
🚀 Server is running on port 5000
📍 API endpoint: http://localhost:5000
🏥 Health check: http://localhost:5000/api/health
```

## Step 6: Test the API

Open browser or use curl:

```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Expected response:
# {"status":"OK","timestamp":"2025-11-02T..."}

# Test API info
curl http://localhost:5000/

# Expected response:
# {"message":"Sales & Distribution Management System API","status":"running","version":"1.0.0"}
```

## ✅ Phase 1 Complete!

If all steps above work, Phase 1 is successfully tested and complete!

## Troubleshooting

### PostgreSQL not found
- Install PostgreSQL (see Step 1)

### Connection refused
- Start PostgreSQL: `sudo systemctl start postgresql`
- Check if running: `sudo systemctl status postgresql`

### Database already exists
- This is fine! You can proceed to Step 3

### Permission denied
- Use default postgres user
- Or create your own user with proper permissions

## What's Next?

Once Phase 1 is tested and working:
1. Review the `PHASE_1_COMPLETION.md` report
2. Give go-ahead to proceed to Phase 2
3. Phase 2 will build the REST API endpoints

---

**Files Created in Phase 1:** 18 files
**Database Objects Created:** 5 tables, 3 views, 2 functions, 4 triggers, 7 indexes
**Seed Data:** 5 beer brands + 3 messes
