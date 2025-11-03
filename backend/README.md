# Sales & Distribution Management System - Backend

Node.js + Express + PostgreSQL backend API for managing beer inventory and distribution.

## Project Structure

```
backend/
├── src/
│   ├── config/          # Database configuration and setup
│   │   ├── database.js  # PostgreSQL connection pool
│   │   ├── schema.sql   # Complete database schema
│   │   ├── setup.js     # Database setup script
│   │   └── test-connection.js  # Connection test utility
│   ├── controllers/     # Route handlers (Phase 2)
│   ├── models/          # Database models (Phase 2)
│   ├── routes/          # API routes (Phase 2)
│   ├── middleware/      # Custom middleware (Phase 2)
│   ├── utils/           # Helper functions (Phase 2)
│   └── server.js        # Express server entry point
├── tests/               # Test files (Phase 4)
├── .env                 # Environment variables (create from .env.example)
├── .env.example         # Environment template
├── package.json         # Dependencies and scripts
└── README.md           # This file
```

## Prerequisites

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **PostgreSQL** (v12 or higher) - [Download](https://www.postgresql.org/download/)
- **npm** (comes with Node.js)

## Installation

### 1. Install PostgreSQL

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**macOS (Homebrew):**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Windows:**
- Download installer from [postgresql.org](https://www.postgresql.org/download/windows/)
- Follow installation wizard
- Remember the password you set for the `postgres` user

### 2. Create Database

```bash
# Login to PostgreSQL
sudo -u postgres psql

# In psql prompt:
CREATE DATABASE salesform_db;

# Grant permissions (if using custom user)
CREATE USER salesform_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE salesform_db TO salesform_user;

# Exit
\q
```

### 3. Install Dependencies

```bash
cd backend
npm install
```

### 4. Configure Environment

```bash
# Copy example env file
cp .env.example .env

# Edit .env with your credentials
nano .env  # or use your preferred editor
```

Update these values in `.env`:
```
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_NAME=salesform_db
```

### 5. Setup Database Schema

```bash
npm run db:setup
```

This will:
- Create all tables (products, messes, inventory, distributions, transactions)
- Create views for reporting
- Create triggers and functions
- Insert seed data (5 beer brands, 3 messes)

### 6. Test Database Connection

```bash
npm run db:test
```

Expected output:
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

## Running the Server

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints (Phase 1)

Currently available:

- `GET /` - API information
- `GET /api/health` - Health check

More endpoints will be added in Phase 2.

## Database Schema

### Tables

1. **products** - Beer brands and pricing
2. **messes** - Restaurant/mess information
3. **inventory** - Stock purchases from suppliers
4. **distributions** - Stock distributed to messes
5. **transactions** - Financial transaction records

### Views

1. **v_current_stock** - Current warehouse inventory
2. **v_mess_distribution_summary** - Distribution totals per mess
3. **v_product_distribution_summary** - Sales per product

### Default Seed Data

**Beer Brands:**
- Guinness (3000 KSH)
- Tusker (2800 KSH)
- Balozi (2500 KSH)
- Pilsner (2700 KSH)
- White Cap (2600 KSH)

**Messes:**
- Mess 1 - Main Canteen
- Mess 2 - Officers Mess
- Mess 3 - Junior Ranks Mess

## NPM Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start production server |
| `npm run dev` | Start development server with auto-reload |
| `npm run db:setup` | Initialize database schema and seed data |
| `npm run db:test` | Test database connection and verify setup |
| `npm test` | Run tests (to be implemented in Phase 4) |

## Troubleshooting

### "Connection refused" error
- Ensure PostgreSQL is running: `sudo systemctl status postgresql`
- Check if PostgreSQL is on port 5432: `sudo ss -tulpn | grep 5432`
- Verify credentials in `.env` file

### "Database does not exist" error
- Create database: `sudo -u postgres psql -c "CREATE DATABASE salesform_db;"`

### "Permission denied" error
- Grant proper privileges to your database user
- Or use the default `postgres` superuser

### Reset database
```bash
# Drop and recreate
sudo -u postgres psql -c "DROP DATABASE IF EXISTS salesform_db;"
sudo -u postgres psql -c "CREATE DATABASE salesform_db;"

# Run setup again
npm run db:setup
```

## Next Steps

✅ Phase 1 Complete: Project Setup & Database Design

📋 Next: Phase 2 - Backend API Development
- Create models for database operations
- Build REST API endpoints
- Implement business logic
- Add validation and error handling

## Documentation

- [Complete Database Setup Guide](../docs/DATABASE_SETUP.md)
- [Project Plan](../PROJECT_PLAN.md)

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Native `pg` driver (Prisma/Sequelize can be added later)
- **Environment**: dotenv
- **CORS**: cors middleware
