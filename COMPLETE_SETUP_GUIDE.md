# Complete Setup Guide - Sales & Distribution Management System
## From Zero to Running Application

**Date**: November 5, 2025  
**System**: Linux (Ubuntu/Debian/WSL)  
**Estimated Time**: 15-20 minutes

---

## 📋 Table of Contents
1. [Install PostgreSQL](#step-1-install-postgresql)
2. [Start PostgreSQL Service](#step-2-start-postgresql-service)
3. [Create Database](#step-3-create-database)
4. [Configure Backend](#step-4-configure-backend)
5. [Setup Database Schema](#step-5-setup-database-schema)
6. [Verify Database](#step-6-verify-database)
7. [Start Backend Server](#step-7-start-backend-server)
8. [Setup Frontend](#step-8-setup-frontend)
9. [Start Frontend](#step-9-start-frontend)
10. [Test the Application](#step-10-test-the-application)

---

## Step 1: Install PostgreSQL

### Check if PostgreSQL is already installed:
```bash
psql --version
```

If you see a version number (e.g., `psql (PostgreSQL) 14.x`), PostgreSQL is installed. **Skip to Step 2**.

### If not installed, install PostgreSQL:
```bash
# Update package list
sudo apt update

# Install PostgreSQL and additional tools
sudo apt install postgresql postgresql-contrib -y

# Verify installation
psql --version
```

**Expected Output:**
```
psql (PostgreSQL) 14.x
```

---

## Step 2: Start PostgreSQL Service

### Start the PostgreSQL service:
```bash
sudo systemctl start postgresql
```

### Verify it's running:
```bash
sudo systemctl status postgresql
```

**Expected Output:**
```
● postgresql.service - PostgreSQL RDBMS
   Loaded: loaded (/lib/systemd/system/postgresql.service)
   Active: active (exited) since ...
```

Press `q` to exit the status view.

### Enable PostgreSQL to start on boot (optional):
```bash
sudo systemctl enable postgresql
```

---

## Step 3: Create Database

### Method A: Quick Command (Recommended)
```bash
# Create the database in one command
sudo -u postgres psql -c "CREATE DATABASE salesform_db;"
```

**Expected Output:**
```
CREATE DATABASE
```

### Method B: Interactive (Alternative)
```bash
# Login to PostgreSQL
sudo -u postgres psql

# You'll see the PostgreSQL prompt: postgres=#
# Run this command:
CREATE DATABASE salesform_db;

# Verify it was created:
\l

# You should see salesform_db in the list
# Exit PostgreSQL:
\q
```

---

## Step 4: Configure Backend

### Navigate to backend folder:
```bash
cd /home/smith/projects/salesform/backend
```

### Install backend dependencies (if not already done):
```bash
npm install
```

**Expected Output:**
```
added XX packages, and audited XX packages in Xs
```

### Create environment configuration file:
```bash
# Copy the example environment file
cp .env.example .env
```

### Edit the .env file with your settings:
```bash
nano .env
```

**Default configuration (should work for most setups):**
```bash
# Database Configuration
DB_USER=postgres
DB_HOST=localhost
DB_NAME=salesform_db
DB_PASSWORD=postgres
DB_PORT=5432

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

**Save and exit:** Press `Ctrl+X`, then `Y`, then `Enter`

> **Note:** If you set a password for your PostgreSQL user, update `DB_PASSWORD` accordingly.

---

## Step 5: Setup Database Schema

This command will create all tables, views, functions, triggers, and insert seed data.

### Run the database setup script:
```bash
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

=== Database is ready to use ===
```

### What was created:

**Tables:**
- ✅ `products` - 5 beer brands (Guinness, Tusker, Balozi, Pilsner, White Cap)
- ✅ `messes` - 3 restaurants (Main Canteen, Officers Mess, Junior Ranks Mess)
- ✅ `inventory` - Stock purchases tracking
- ✅ `distributions` - Stock distributions to messes
- ✅ `transactions` - Financial records (optional)

**Views:**
- ✅ `v_current_stock` - Available warehouse inventory
- ✅ `v_mess_distribution_summary` - Distribution totals per mess
- ✅ `v_product_distribution_summary` - Sales per product

**Functions & Triggers:**
- ✅ `get_available_stock(product_id)` - Check available stock
- ✅ Auto-update timestamps on record changes

---

## Step 6: Verify Database

### Test the database connection:
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
   Current server time: 2025-11-05 ...

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

✅ **If you see this output, your database is perfectly configured!**

### Optional: Inspect the database manually
```bash
# Login to PostgreSQL
sudo -u postgres psql -d salesform_db

# View all tables
\dt

# View all views
\dv

# View products
SELECT * FROM products;

# View messes
SELECT * FROM messes;

# View current stock (should be empty initially)
SELECT * FROM v_current_stock;

# Exit
\q
```

---

## Step 7: Start Backend Server

### Start the development server:
```bash
npm run dev
```

**Expected Output:**
```
🚀 Server is running on port 5000
📍 API endpoint: http://localhost:5000
🏥 Health check: http://localhost:5000/api/health
📚 API Documentation: http://localhost:5000/
```

✅ **Backend is now running!** Keep this terminal open.

### Test the API (open a new terminal):
```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Expected response:
# {"status":"OK","timestamp":"2025-11-05T...","database":"connected"}

# Test products endpoint
curl http://localhost:5000/api/products

# Expected response: JSON with 5 beer products

# Test dashboard metrics
curl http://localhost:5000/api/dashboard/metrics
```

---

## Step 8: Setup Frontend

### Open a new terminal and navigate to frontend:
```bash
cd /home/smith/projects/salesform/frontend
```

### Install frontend dependencies (if not already done):
```bash
npm install
```

**Expected Output:**
```
added XX packages, and audited XX packages in Xs
```

### Create frontend environment file (optional):
```bash
# Copy example file
cp .env.example .env

# Edit if needed
nano .env
```

**Default configuration:**
```bash
REACT_APP_API_URL=http://localhost:5000/api
```

**Save and exit:** Press `Ctrl+X`, then `Y`, then `Enter`

---

## Step 9: Start Frontend

### Start the React development server:
```bash
npm start
```

**Expected Output:**
```
Compiled successfully!

You can now view frontend in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000

Note that the development build is not optimized.
To create a production build, use npm run build.

webpack compiled successfully
```

✅ **Frontend is now running!**

Your browser should automatically open to `http://localhost:3000`

---

## Step 10: Test the Application

### You should now see the application with:
- Navigation bar with View and Actions sections
- Dashboard page (default view)
- Empty metrics (no data yet)

### Let's add some test data:

#### 1. Add Stock
1. Click **"+ Add Stock"** in the navigation
2. Fill in the form:
   - **Product**: Select "Guinness"
   - **Quantity (crates)**: 100
   - **Purchase Price per Crate**: 2800
   - **Supplier Name**: ABC Distributors
   - **Supplier Contact**: +254-712-345-678
   - **Notes**: Initial stock purchase
3. Click **"Add Stock"**
4. You should see: ✅ **"Stock added successfully"**

#### 2. Distribute Stock
1. Click **"📤 Distribute"** in the navigation
2. Fill in the form:
   - **Mess**: Select "Mess 1 - Main Canteen"
   - **Product**: Select "Guinness"
   - **Available Stock**: Should show "100 crates available"
   - **Quantity to Distribute**: 30
   - **Price per Crate**: 3000 (auto-filled)
   - **Notes**: Initial distribution to Mess 1
3. Click **"Distribute Stock"**
4. You should see: ✅ **"Distribution created successfully"**

#### 3. View Dashboard
1. Click **"🏠 Dashboard"** in the navigation
2. You should now see:
   - **Current Stock**: 70 crates (100 - 30)
   - **Total Purchased**: 100 crates
   - **Total Distributed**: 30 crates
   - **Total Revenue**: 90,000 KSH (30 × 3000)
   - Recent distribution shown in the table

#### 4. Explore Other Pages
- **📦 Stock**: View all products and current inventory
- **📊 Distributions**: See all distribution records
- **🏢 Messes**: View mess information and their distributions
- **📈 Reports**: Revenue analysis and trends

---

## 🎉 Success! Your Application is Running

You now have:
- ✅ PostgreSQL database running
- ✅ Backend API running on http://localhost:5000
- ✅ Frontend application running on http://localhost:3000
- ✅ Sample data to test with

---

## 🔧 Troubleshooting

### Issue: "ECONNREFUSED" when starting backend
**Solution:**
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# If not running, start it
sudo systemctl start postgresql
```

### Issue: "database 'salesform_db' does not exist"
**Solution:**
```bash
# Create the database
sudo -u postgres psql -c "CREATE DATABASE salesform_db;"

# Then run setup again
npm run db:setup
```

### Issue: "authentication failed for user 'postgres'"
**Solution:**
```bash
# Set password for postgres user
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres';"

# Or edit .env file to use different credentials
```

### Issue: Port 5000 or 3000 already in use
**Solution:**
```bash
# For backend (port 5000)
# Edit backend/.env and change PORT to 5001

# For frontend (port 3000)
# When prompted, type 'y' to use a different port
# Or create frontend/.env with:
# PORT=3001
```

### Issue: Cannot connect to API from frontend
**Solution:**
```bash
# Make sure backend is running
# Check frontend/.env has correct API URL:
# REACT_APP_API_URL=http://localhost:5000/api

# Then restart frontend:
npm start
```

---

## 🚀 Next Steps

### Daily Development Workflow:

**Terminal 1 - Backend:**
```bash
cd /home/smith/projects/salesform/backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd /home/smith/projects/salesform/frontend
npm start
```

### Stopping the Application:
- Press `Ctrl+C` in each terminal to stop the servers
- PostgreSQL will continue running in the background

### Restart PostgreSQL:
```bash
sudo systemctl restart postgresql
```

### Stop PostgreSQL:
```bash
sudo systemctl stop postgresql
```

---

## 📚 Additional Resources

- **API Documentation**: `/docs/API_DOCUMENTATION.md`
- **Database Schema**: `/backend/src/config/schema.sql`
- **Project Plan**: `/PROJECT_PLAN.md`
- **Phase Completion Reports**: 
  - `PHASE_1_COMPLETION.md`
  - `PHASE_2_COMPLETION.md`
  - `PHASE_3_COMPLETION.md`

---

## 📞 Quick Reference Commands

```bash
# PostgreSQL
sudo systemctl status postgresql      # Check status
sudo systemctl start postgresql       # Start service
sudo systemctl stop postgresql        # Stop service
sudo -u postgres psql                 # Login to PostgreSQL

# Backend
cd /home/smith/projects/salesform/backend
npm install                           # Install dependencies
npm run db:setup                      # Setup database
npm run db:test                       # Test database connection
npm run dev                           # Start development server

# Frontend
cd /home/smith/projects/salesform/frontend
npm install                           # Install dependencies
npm start                             # Start development server

# Database Operations
sudo -u postgres psql -d salesform_db # Connect to database
\dt                                   # List tables
\dv                                   # List views
\q                                    # Exit PostgreSQL
```

---

**🎊 Congratulations!** Your Sales & Distribution Management System is now fully operational!
