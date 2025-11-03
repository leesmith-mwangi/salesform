# Sales & Distribution Management System - Project Plan

## Project Overview
A web-based inventory and distribution management system for tracking beer sales and distribution across multiple messes (restaurants) at an army camp.

**Business Owner**: Your friend (alcohol distributor)
**Tech Stack**: React + Node.js + PostgreSQL
**Deployment**: Web Application

---

## Phase 1: Project Setup & Database Design
**Duration**: 1-2 days
**Status**: Not Started

### Tasks
- [x] Define tech stack
- [ ] Initialize project repository
- [ ] Set up project structure (frontend + backend)
- [ ] Install core dependencies
- [ ] Configure development environment
- [ ] Design database schema
- [ ] Set up PostgreSQL database
- [ ] Create database tables and relationships

### Deliverables
- Project folder structure
- Database schema documentation
- Development environment ready

---

## Phase 2: Backend API Development
**Duration**: 3-4 days
**Status**: Not Started

### 2.1 Core Models & Database Layer
- [ ] Create Product model (beer brands)
- [ ] Create Inventory model (warehouse stock)
- [ ] Create Mess model (3 restaurants)
- [ ] Create Distribution model (stock allocations)
- [ ] Create Transaction model (financial records)
- [ ] Set up database migrations
- [ ] Seed initial data (beer brands, messes)

### 2.2 API Endpoints - Inventory Management
- [ ] POST `/api/products` - Add new beer brand
- [ ] GET `/api/products` - List all products
- [ ] POST `/api/inventory/add-stock` - Add stock from supplier
- [ ] GET `/api/inventory` - Get current warehouse stock
- [ ] GET `/api/inventory/:productId` - Get stock by product

### 2.3 API Endpoints - Distribution Management
- [ ] POST `/api/distributions` - Distribute crates to mess
- [ ] GET `/api/distributions` - Get all distributions
- [ ] GET `/api/distributions/mess/:messId` - Get distributions by mess
- [ ] GET `/api/distributions/product/:productId` - Get distributions by product
- [ ] PUT `/api/distributions/:id` - Update distribution record

### 2.4 API Endpoints - Financial Tracking
- [ ] GET `/api/dashboard/metrics` - Get dashboard summary
- [ ] GET `/api/reports/revenue` - Calculate total revenue
- [ ] GET `/api/reports/by-mess` - Revenue breakdown by mess
- [ ] GET `/api/reports/by-product` - Sales breakdown by product

### 2.5 Business Logic
- [ ] Stock calculation logic (warehouse stock - distributions)
- [ ] Revenue calculation logic (crates × price)
- [ ] Validation rules (can't distribute more than available)
- [ ] Transaction history tracking

### Deliverables
- Fully functional REST API
- API documentation
- Postman/Thunder Client collection for testing

---

## Phase 3: Frontend Development
**Duration**: 4-5 days
**Status**: Not Started

### 3.1 Project Setup
- [ ] Initialize React app
- [ ] Set up routing (React Router)
- [ ] Configure API client (Axios/Fetch)
- [ ] Set up state management (Context API or Redux)
- [ ] Install UI library (Material-UI, Tailwind, or Bootstrap)

### 3.2 Dashboard Page
- [ ] Create dashboard layout
- [ ] Display current warehouse inventory
  - Total stock by product
  - Low stock alerts
- [ ] Display distribution summary
  - Crates per mess
  - Distribution by product
- [ ] Display financial metrics
  - Total revenue
  - Expected revenue from distributions
  - Revenue by mess
- [ ] Add data visualization (charts/graphs)

### 3.3 Stock Management Page
- [ ] Create "Add Stock" form
  - Select product (beer brand)
  - Enter quantity (crates)
  - Enter purchase price
  - Enter supplier info
  - Submit and update inventory
- [ ] Display stock history table
  - Date added
  - Product
  - Quantity
  - Supplier
- [ ] Search and filter functionality

### 3.4 Distribution Management Page
- [ ] Create "Distribute Stock" form
  - Select mess (dropdown)
  - Select product (dropdown)
  - Enter quantity (crates)
  - Set price per crate
  - Submit distribution
- [ ] Display distribution history table
  - Date
  - Mess name
  - Product
  - Quantity
  - Value
- [ ] Filter by mess/product/date
- [ ] Show available stock per product

### 3.5 Mess Management Page
- [ ] List all messes
- [ ] View detailed distribution per mess
- [ ] Total crates received
- [ ] Total value
- [ ] Payment status (future feature)

### 3.6 Products Management Page
- [ ] List all beer brands
- [ ] Add new product
- [ ] Edit product details (name, price)
- [ ] View product distribution history

### Deliverables
- Fully functional React frontend
- Responsive design
- Connected to backend API
- User-friendly interface

---

## Phase 4: Integration & Testing
**Duration**: 2-3 days
**Status**: Not Started

### Tasks
- [ ] Connect frontend to backend
- [ ] Test all user flows
  - Add stock flow
  - Distribute stock flow
  - View dashboard metrics
- [ ] Test edge cases
  - Distributing more than available stock
  - Adding invalid data
  - Empty states
- [ ] Fix bugs and issues
- [ ] Performance optimization
- [ ] Cross-browser testing

### Deliverables
- Fully integrated application
- Bug-free core functionality
- Test report

---

## Phase 5: Deployment
**Duration**: 1-2 days
**Status**: Not Started

### Tasks
- [ ] Set up production database (PostgreSQL)
- [ ] Deploy backend (Heroku, Railway, or DigitalOcean)
- [ ] Deploy frontend (Vercel, Netlify, or same server)
- [ ] Configure environment variables
- [ ] Set up SSL certificate
- [ ] Test production deployment
- [ ] Create user documentation

### Deliverables
- Live web application
- Production URL
- User guide/documentation

---

## Phase 6: Future Enhancements
**Status**: Planned for Later

### Potential Features
- [ ] User authentication & roles
- [ ] Payment tracking (receivables from messes)
- [ ] SMS/Email notifications for low stock
- [ ] Barcode scanning for stock management
- [ ] Multi-currency support
- [ ] Expense tracking (purchase costs)
- [ ] Profit margin calculations
- [ ] Mobile responsive improvements
- [ ] Offline mode support
- [ ] Advanced reporting & analytics
- [ ] Export reports to PDF/Excel
- [ ] Supplier management module
- [ ] Returns/damaged goods tracking

---

## Database Schema (Preliminary)

### Products Table
```
id, name, price_per_crate, bottles_per_crate, created_at, updated_at
```

### Inventory Table
```
id, product_id, quantity_crates, purchase_price, supplier_name, date_added, created_at, updated_at
```

### Messes Table
```
id, name, location, contact_person, phone, created_at, updated_at
```

### Distributions Table
```
id, mess_id, product_id, quantity_crates, price_per_crate, total_value, distribution_date, notes, created_at, updated_at
```

### Transactions Table (Optional for Phase 1)
```
id, type (purchase/distribution), reference_id, amount, date, description, created_at, updated_at
```

---

## Success Metrics

### MVP (Minimum Viable Product) Goals
1. User can add stock to warehouse
2. User can distribute stock to any of the 3 messes
3. Dashboard shows:
   - Current warehouse inventory
   - Distribution per mess
   - Expected revenue
4. System prevents over-distribution (can't distribute more than available)

### Timeline
- **Phase 1-2**: Week 1
- **Phase 3**: Week 2
- **Phase 4-5**: Week 3
- **Total MVP**: ~3 weeks

---

## Notes
- Start simple, add complexity later
- Focus on core functionality first
- Ensure data accuracy (critical for business)
- Keep UI simple and intuitive
- Regular backups of database
