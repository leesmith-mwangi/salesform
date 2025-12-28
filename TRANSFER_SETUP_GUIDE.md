# 🚀 Project Transfer & Setup Guide

Complete guide to transfer and setup the Sales & Distribution Management System on your client's PC.

---

## 📦 What You'll Transfer

- **Frontend:** React application
- **Backend:** Node.js/Express API server
- **Database:** PostgreSQL dump (`salesform_db_dump.dump`) plus schema scripts
- **Documentation:** All guides and setup files

---

## 🎯 Method 1: Transfer via ZIP/USB (Recommended)

tar -czf salesform-project.tar.gz salesform/
### Step 1: Prepare the Database Dump (Required)

Create a fresh PostgreSQL dump from your machine so the client gets your latest data.

**Windows (PowerShell):**
```powershell
# Run inside project root (d:/My Projects/)
pg_dump -U postgres -Fc salesform_db > salesform/backend/backups/salesform_db_dump.dump
```

**Linux/Mac:**
```bash
cd /home/smith/projects
pg_dump -U postgres -Fc salesform_db > salesform/backend/backups/salesform_db_dump.dump
```

Expected file: `backend/backups/salesform_db_dump.dump`

### Step 2: Package the Project

On your PC, create a clean archive **including the dump** and excluding heavy folders:

**Windows (PowerShell):**
```powershell
cd "d:/My Projects"
Compress-Archive -Path "salesform/*" -DestinationPath "salesform-project.zip" -Force -CompressionLevel Optimal -Exclude *.git*, node_modules
```

**Linux/Mac:**
```bash
cd /home/smith/projects
tar --exclude='**/node_modules' --exclude='**/.git' -czf salesform-project.tar.gz salesform/
```

**Transfer this file** to client's PC via:
- USB drive
- Email (if small enough)
- Cloud storage (Google Drive, Dropbox)
- Network share

---

### Step 3: Client PC Prerequisites

Client must install these first:

#### On Windows:
1. **Node.js** (v18 or higher)
   - Download: https://nodejs.org/
   - Install LTS version
   - Verify: Open Command Prompt → `node --version`

2. **PostgreSQL** (v14 or higher)
   - Download: https://www.postgresql.org/download/windows/
   - During installation, set password (remember it!)
   - Default port: 5432
   - Verify: `psql --version`

3. **Git** (optional, for updates)
   - Download: https://git-scm.com/download/win

#### On Linux/Mac:
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt-get install postgresql postgresql-contrib

# Verify installations
node --version
npm --version
psql --version
```

---

### Step 4: Extract and Setup Project

On client's PC:

```bash
# Extract the archive
tar -xzf salesform-project.tar.gz
# or unzip salesform-project.zip

# Navigate to project
cd salesform

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

---

### Step 5: Database Setup

#### Create Database

**Windows Command Prompt:**
```cmd
psql -U postgres
```
Enter postgres password when prompted, then:
```sql
CREATE DATABASE salesform_db;
\q
```

**Linux/Mac Terminal:**
```bash
sudo -u postgres psql
```
Then:
```sql
CREATE DATABASE salesform_db;
\q
```

#### Restore from Provided Dump (Preferred)

If `backend/backups/salesform_db_dump.dump` is in the archive, restore it instead of running the seed scripts.

**Windows (PowerShell):**
```powershell
cd "d:/My Projects/salesform"
pg_restore -U postgres -d salesform_db "backend/backups/salesform_db_dump.dump"
```

**Linux/Mac:**
```bash
cd /home/smith/projects/salesform
pg_restore -U postgres -d salesform_db backend/backups/salesform_db_dump.dump
```

If the dump is missing, use the setup scripts below.

#### Configure Database Connection

Edit `backend/src/config/database.js`:

```bash
cd backend/src/config
nano database.js  # or use notepad on Windows
```

Update with client's PostgreSQL credentials:
```javascript
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'salesform_db',
  user: 'postgres',        // Client's postgres username
  password: 'client_pass', // Client's postgres password
});
```

#### Initialize Database Schema

> Skip this step if you already restored from `salesform_db_dump.dump`.

```bash
cd backend

# Create main tables
node src/config/setup.js

# Create authentication tables
node src/config/setup-auth.js
```

You should see:
```
✅ Database tables created successfully
✅ Authentication tables created
✅ Default admin user created
```

---

### Step 6: Add Initial Products

Edit `backend/add-products.js` to add client's products:

```javascript
const PRODUCTS_TO_ADD = [
  {
    name: 'Milk',
    unit_type: 'crates',
    pieces_per_crate: 24,
    price_per_unit: 120.00
  },
  {
    name: 'Bread',
    unit_type: 'crates',
    pieces_per_crate: 20,
    price_per_unit: 150.00
  },
  // Add client's products here
];
```

Run:
```bash
node add-products.js
```

---

### Step 7: Start the Application

#### Terminal 1 - Start Backend:
```bash
cd backend
npm run dev
```

You should see:
```
Server running on http://localhost:5000
Database connected successfully
```

#### Terminal 2 - Start Frontend:
```bash
cd frontend
npm start
```

Browser should open automatically to `http://localhost:3000`

---

### Step 8: First Login

**Default credentials:**
- Username: `admin`
- Password: `admin123`

**⚠️ IMPORTANT:** Change these immediately!
1. Login with default credentials
2. Click "🔐 Change Password"
3. Set a secure password
4. Save the new credentials

Or use command line:
```bash
cd backend
node update-admin-credentials.js
```

---

## 🎯 Method 2: Transfer via Git (For Tech-Savvy Clients)

### Step 1: Push to GitHub (Your PC)

```bash
cd /home/smith/projects/salesform

# Create .gitignore if not exists
cat > .gitignore << EOF
node_modules/
.env
*.log
.DS_Store
EOF

# Initialize and push
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/salesform.git
git push -u origin main
```

### Step 2: Clone on Client's PC

```bash
git clone https://github.com/yourusername/salesform.git
cd salesform

# Install dependencies
cd backend && npm install
cd ../frontend && npm install
```

Then follow Steps 5-8 from Method 1.

---

## 🎯 Method 3: All-in-One Setup Script

Create this script to automate setup on client's PC:

Save as `setup.sh` (Linux/Mac) or `setup.bat` (Windows):

### Linux/Mac Setup Script:
```bash
#!/bin/bash

echo "🚀 Setting up Sales & Distribution Management System..."

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install

# Setup database
echo "🗄️ Setting up database..."
cd ../backend
node src/config/setup.js
node src/config/setup-auth.js

echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Edit backend/src/config/database.js with your PostgreSQL credentials"
echo "2. Add products: node add-products.js"
echo "3. Start backend: cd backend && npm run dev"
echo "4. Start frontend: cd frontend && npm start"
echo "5. Login with: admin / admin123"
echo "6. Change password immediately!"
```

Make it executable:
```bash
chmod +x setup.sh
./setup.sh
```

---

## 📋 Client Checklist

Print this for your client:

- [ ] Install Node.js (v18+)
- [ ] Install PostgreSQL (v14+)
- [ ] Extract project files
- [ ] Update database credentials in `backend/src/config/database.js`
- [ ] Restore database from `backend/backups/salesform_db_dump.dump` (or run setup scripts if missing)
- [ ] Run `npm install` in backend folder
- [ ] Run `npm install` in frontend folder
- [ ] Run `node src/config/setup.js` to create tables
- [ ] Run `node src/config/setup-auth.js` to create admin user
- [ ] Add products using `add-products.js`
- [ ] Start backend: `npm run dev`
- [ ] Start frontend: `npm start`
- [ ] Login and change password
- [ ] Test all features

---

## 🔧 Troubleshooting Common Issues

### Issue: "Cannot connect to database"
**Solution:**
1. Check PostgreSQL is running:
   - Windows: Services → PostgreSQL
   - Linux: `sudo systemctl status postgresql`
2. Verify credentials in `backend/src/config/database.js`
3. Test connection: `psql -U postgres -d salesform_db`

### Issue: "Port 5000 already in use"
**Solution:**
Edit `backend/src/server.js`, change:
```javascript
const PORT = process.env.PORT || 5001; // Changed from 5000
```

### Issue: "Port 3000 already in use"
**Solution:**
When prompted, press `Y` to run on different port (usually 3001)

### Issue: "Module not found"
**Solution:**
```bash
# Delete and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue: "Permission denied" (Linux)
**Solution:**
```bash
sudo chown -R $USER:$USER salesform/
```

---

## 🔐 Security Checklist for Production

Before going live:

- [ ] Change default admin password
- [ ] Update database credentials (don't use 'postgres' user)
- [ ] Set strong PostgreSQL password
- [ ] Configure firewall rules
- [ ] Enable HTTPS if accessible remotely
- [ ] Set NODE_ENV=production
- [ ] Regular backups configured
- [ ] Update JWT secret in backend

---

## 📊 Post-Setup Configuration

### 1. Add Client's Messes
```bash
psql -d salesform_db
```
```sql
INSERT INTO messes (name, location, contact_person, phone) VALUES
('Main Canteen', 'Building A', 'John Doe', '0712345678'),
('Staff Mess', 'Building B', 'Jane Smith', '0723456789');
```

### 2. Add Attendants
```sql
INSERT INTO attendants (name, phone, mess_id) VALUES
('Peter Kamau', '0734567890', 1),
('Mary Wanjiku', '0745678901', 2);
```

### 3. Setup Backup Script
```bash
# Create backup script
cat > backup.sh << 'EOF'
#!/bin/bash
pg_dump salesform_db > backup_$(date +%Y%m%d_%H%M%S).sql
EOF

chmod +x backup.sh

# Add to cron for daily backups
crontab -e
# Add: 0 2 * * * /path/to/salesform/backup.sh
```

---

## 📞 Support Information

Provide your client with:

1. **Your contact info** for technical support
2. **User manual** (create from existing docs)
3. **Video tutorial** (optional, screen recording)
4. **Emergency contacts** for critical issues

---

## 📁 Files to Include in Transfer

Essential files:
```
salesform/
├── backend/
│   ├── src/
│   ├── package.json
│   ├── add-products.js
│   ├── clear-test-data.js
│   └── update-admin-credentials.js
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
├── PRODUCT_MANAGEMENT_GUIDE.md
├── AUTHENTICATION_GUIDE.md
├── DATA_MANAGEMENT_GUIDE.md
├── QUICK_START.md
└── TRANSFER_SETUP_GUIDE.md (this file)
```

**Exclude (too large):**
- node_modules/ folders
- .git/ folder
- build/ folders
- *.log files

---

## 🎓 Training Your Client

### Basic Training Checklist:

1. **Login/Logout**
   - How to login
   - Change password
   - User roles

2. **Inventory Management**
   - Add new stock
   - View current inventory
   - Check stock levels

3. **Distribution**
   - Create distribution
   - Select mess and products
   - Record payments

4. **Reports**
   - View distributions overview
   - Check mess financials
   - Profit analysis

5. **Maintenance**
   - Add/remove products
   - Clear old data
   - Database backup

---

## 🆘 Quick Command Reference for Client

Save as `COMMANDS.md`:

```markdown
# Quick Commands

## Start Application
cd backend && npm run dev        # Terminal 1
cd frontend && npm start         # Terminal 2

## Stop Application
Ctrl+C in each terminal

## Add Products
cd backend
node add-products.js

## Clear Test Data
cd backend
node clear-test-data.js

## Change Admin Password
cd backend
node update-admin-credentials.js

## Backup Database
pg_dump salesform_db > backup.sql

## Restore Database
psql salesform_db < backup.sql

## View Products
psql -d salesform_db -c "SELECT * FROM products;"

## View Messes
psql -d salesform_db -c "SELECT * FROM messes;"
```

---

## ✅ Final Steps

1. **Test everything** on client's PC before leaving
2. **Do a sample transaction** (add stock, distribute, view reports)
3. **Show them the backup process**
4. **Leave printed documentation**
5. **Schedule follow-up** support session
6. **Get client sign-off** on installation

---

**🎉 System Ready for Production!**

Default Login: `admin / admin123` (Change immediately!)
Access: `http://localhost:3000`
