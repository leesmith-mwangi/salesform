# Phase 2 Testing Guide
## How to Test the Backend API

## Prerequisites
- Phase 1 completed (database setup)
- Server running: `npm run dev` in backend folder

---

## Quick Test Script

Run this complete workflow to test all features:

```bash
# Navigate to project root
cd /home/art/projects/salesform

# 1. Check API is running
curl http://localhost:5000/

# 2. Get all products
curl http://localhost:5000/api/products | python3 -m json.tool

# 3. Get all messes
curl http://localhost:5000/api/messes | python3 -m json.tool

# 4. Add stock (100 crates of Tusker)
curl -X POST http://localhost:5000/api/inventory \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": 2,
    "quantity_crates": 100,
    "purchase_price_per_crate": 2600,
    "supplier_name": "XYZ Distributors",
    "supplier_contact": "+254-700-999-888"
  }' | python3 -m json.tool

# 5. Distribute stock (25 crates to Mess 2)
curl -X POST http://localhost:5000/api/distributions \
  -H "Content-Type: application/json" \
  -d '{
    "mess_id": 2,
    "product_id": 2,
    "quantity_crates": 25,
    "price_per_crate": 2800
  }' | python3 -m json.tool

# 6. Try to distribute more than available (should fail)
curl -X POST http://localhost:5000/api/distributions \
  -H "Content-Type: application/json" \
  -d '{
    "mess_id": 3,
    "product_id": 2,
    "quantity_crates": 200,
    "price_per_crate": 2800
  }' | python3 -m json.tool

# 7. View dashboard metrics
curl http://localhost:5000/api/dashboard/metrics | python3 -m json.tool

# 8. Get current stock levels
curl http://localhost:5000/api/dashboard/stock | python3 -m json.tool

# 9. Get all distributions
curl http://localhost:5000/api/distributions | python3 -m json.tool

# 10. Get distributions by mess
curl http://localhost:5000/api/distributions/mess/2 | python3 -m json.tool
```

---

## Expected Results

### 1. API Running
```json
{
  "message": "Sales & Distribution Management System API",
  "status": "running",
  "version": "2.0.0"
}
```

### 2. Products List
- Should return 5 beer brands
- Each with price, bottles per crate, description

### 3. Messes List
- Should return 3 messes
- With contact information and location

### 4. Add Stock Success
```json
{
  "success": true,
  "message": "Added 100 crates of Tusker to inventory",
  "data": {
    "updated_stock": {
      "current_stock": 100,
      "total_purchased": 100
    }
  }
}
```

### 5. Distribution Success
```json
{
  "success": true,
  "message": "Distributed 25 crates of Tusker to Mess 2 - Officers Mess",
  "data": {
    "updated_stock": {
      "current_stock": 75,
      "total_distributed": 25
    }
  }
}
```

### 6. Stock Validation Error (Expected)
```json
{
  "success": false,
  "error": "Insufficient stock. Available: 75 crates, Requested: 200 crates"
}
```

### 7. Dashboard Metrics
Should show:
- Total stock crates
- Total revenue
- Recent activity
- Low stock alerts
- Top products
- Mess summaries

---

## Testing Individual Endpoints

### Products

```bash
# Get all products
curl http://localhost:5000/api/products

# Get products with stock info
curl http://localhost:5000/api/products?with_stock=true

# Get single product
curl http://localhost:5000/api/products/1

# Create new product
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Corona",
    "price_per_crate": 3500,
    "bottles_per_crate": 24,
    "description": "Corona Extra"
  }'

# Update product
curl -X PUT http://localhost:5000/api/products/1 \
  -H "Content-Type: application/json" \
  -d '{
    "price_per_crate": 3100
  }'
```

### Inventory

```bash
# Get all inventory records
curl http://localhost:5000/api/inventory

# Get recent additions (last 30 days)
curl http://localhost:5000/api/inventory/recent

# Get inventory for specific product
curl http://localhost:5000/api/inventory/product/1

# Get inventory summary
curl http://localhost:5000/api/inventory/summary
```

### Distributions

```bash
# Get all distributions
curl http://localhost:5000/api/distributions

# Get recent distributions
curl http://localhost:5000/api/distributions/recent

# Get distributions by mess
curl http://localhost:5000/api/distributions/mess/1

# Get distributions by product
curl http://localhost:5000/api/distributions/product/1

# Get distribution summary for date range
curl "http://localhost:5000/api/distributions/summary?start_date=2025-11-01&end_date=2025-11-30"
```

### Dashboard

```bash
# Get complete dashboard metrics
curl http://localhost:5000/api/dashboard/metrics

# Get current stock
curl http://localhost:5000/api/dashboard/stock

# Get mess summaries
curl http://localhost:5000/api/dashboard/messes

# Get product summaries
curl http://localhost:5000/api/dashboard/products

# Get revenue by date range
curl "http://localhost:5000/api/dashboard/revenue?start_date=2025-11-01&end_date=2025-11-30"

# Get revenue by mess
curl http://localhost:5000/api/dashboard/revenue/mess

# Get revenue by product
curl http://localhost:5000/api/dashboard/revenue/product

# Get activity timeline (last 7 days)
curl http://localhost:5000/api/dashboard/activity
```

---

## Common Issues

### Server not starting
```bash
# Check if already running
lsof -ti:5000

# Kill existing process
kill $(lsof -ti:5000)

# Restart server
cd backend && npm run dev
```

### Database connection error
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Test database connection
cd backend && npm run db:test
```

### Port already in use
Edit `backend/.env`:
```
PORT=5001
```

---

## Testing with Postman/Thunder Client

### Setup
1. Create new collection: "Salesform API"
2. Set base URL variable: `{{baseUrl}}` = `http://localhost:5000`
3. Set Content-Type header: `application/json`

### Import Endpoints

**Products**
- GET {{baseUrl}}/api/products
- GET {{baseUrl}}/api/products/1
- POST {{baseUrl}}/api/products
- PUT {{baseUrl}}/api/products/1
- DELETE {{baseUrl}}/api/products/1

**Inventory**
- GET {{baseUrl}}/api/inventory
- POST {{baseUrl}}/api/inventory
- ... (see API docs)

**Distributions**
- GET {{baseUrl}}/api/distributions
- POST {{baseUrl}}/api/distributions
- ... (see API docs)

---

## Automated Test Script

Save this as `test-api.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:5000"

echo "Testing Sales & Distribution API..."
echo ""

echo "1. Health Check..."
curl -s $BASE_URL/api/health | python3 -m json.tool
echo ""

echo "2. Get Products..."
curl -s $BASE_URL/api/products | python3 -m json.tool | head -20
echo ""

echo "3. Get Messes..."
curl -s $BASE_URL/api/messes | python3 -m json.tool | head -20
echo ""

echo "4. Add Stock..."
curl -s -X POST $BASE_URL/api/inventory \
  -H "Content-Type: application/json" \
  -d '{"product_id": 3, "quantity_crates": 50, "purchase_price_per_crate": 2400, "supplier_name": "Test Supplier"}' \
  | python3 -m json.tool
echo ""

echo "5. Distribute Stock..."
curl -s -X POST $BASE_URL/api/distributions \
  -H "Content-Type: application/json" \
  -d '{"mess_id": 1, "product_id": 3, "quantity_crates": 10, "price_per_crate": 2500}' \
  | python3 -m json.tool
echo ""

echo "6. Get Dashboard Metrics..."
curl -s $BASE_URL/api/dashboard/metrics | python3 -m json.tool | head -40
echo ""

echo "✅ API Testing Complete!"
```

Run with:
```bash
chmod +x test-api.sh
./test-api.sh
```

---

## Success Checklist

- [ ] Server starts without errors
- [ ] Health check returns OK
- [ ] Can get products (5 items)
- [ ] Can get messes (3 items)
- [ ] Can add stock successfully
- [ ] Stock count increases
- [ ] Can distribute stock
- [ ] Stock count decreases
- [ ] Revenue is calculated
- [ ] Over-distribution is prevented
- [ ] Dashboard shows correct metrics
- [ ] Error messages are clear

---

## Next Steps After Testing

Once all tests pass:
1. Review Phase 2 Completion Report
2. Give go-ahead for Phase 3 (Frontend Development)
3. Frontend will consume these APIs

---

**All tests passing? Phase 2 is complete! 🎉**
