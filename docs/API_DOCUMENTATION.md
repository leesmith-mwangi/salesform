# API Documentation
## Sales & Distribution Management System

**Base URL**: `http://localhost:5000`
**Version**: 2.0.0

---

## Table of Contents
- [Authentication](#authentication)
- [Products API](#products-api)
- [Messes API](#messes-api)
- [Inventory API](#inventory-api)
- [Distributions API](#distributions-api)
- [Dashboard API](#dashboard-api)
- [Error Handling](#error-handling)

---

## Authentication
Currently, the API does not require authentication. This will be added in Phase 6.

---

## Products API

### Get All Products
**GET** `/api/products`

Get list of all beer products.

**Query Parameters:**
- `with_stock` (boolean) - Include stock information (default: false)

**Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "id": 1,
      "name": "Guinness",
      "price_per_crate": "3000.00",
      "bottles_per_crate": 30,
      "description": "Guinness Stout Beer",
      "is_active": true,
      "created_at": "2025-11-02T20:06:59.000Z",
      "updated_at": "2025-11-02T20:06:59.000Z",
      "current_stock": 70,
      "total_purchased": 100,
      "total_distributed": 30
    }
  ]
}
```

### Get Single Product
**GET** `/api/products/:id`

Get details of a specific product.

**Parameters:**
- `id` (integer, required) - Product ID

**Query Parameters:**
- `with_stock` (boolean) - Include stock information

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Guinness",
    "price_per_crate": "3000.00",
    "bottles_per_crate": 30,
    "description": "Guinness Stout Beer",
    "is_active": true
  }
}
```

### Create Product
**POST** `/api/products`

Add a new beer product.

**Request Body:**
```json
{
  "name": "Heineken",
  "price_per_crate": 3200,
  "bottles_per_crate": 30,
  "description": "Heineken Premium Lager"
}
```

**Required Fields:**
- `name` (string)
- `price_per_crate` (number)

**Response:**
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": { ... }
}
```

### Update Product
**PUT** `/api/products/:id`

Update product details.

**Parameters:**
- `id` (integer, required) - Product ID

**Request Body:**
```json
{
  "price_per_crate": 3100,
  "description": "Updated description"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Product updated successfully",
  "data": { ... }
}
```

### Delete Product
**DELETE** `/api/products/:id`

Soft delete a product (sets is_active to false).

**Parameters:**
- `id` (integer, required) - Product ID

**Response:**
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

---

## Messes API

### Get All Messes
**GET** `/api/messes`

Get list of all messes/restaurants.

**Query Parameters:**
- `with_summary` (boolean) - Include distribution summary

**Response:**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "id": 1,
      "name": "Mess 1 - Main Canteen",
      "location": "Main Camp Block A",
      "contact_person": "John Doe",
      "phone": "+254-712-345-678",
      "is_active": true,
      "total_distributions": 5,
      "total_crates_received": 150,
      "total_value": "450000.00"
    }
  ]
}
```

### Get Single Mess
**GET** `/api/messes/:id`

Get details of a specific mess.

**Parameters:**
- `id` (integer, required) - Mess ID

**Query Parameters:**
- `with_summary` (boolean) - Include distribution summary

### Create Mess
**POST** `/api/messes`

Add a new mess/restaurant.

**Request Body:**
```json
{
  "name": "Mess 4 - Training Camp",
  "location": "Training Block D",
  "contact_person": "Sarah Wilson",
  "phone": "+254-745-678-901"
}
```

**Required Fields:**
- `name` (string)

### Update Mess
**PUT** `/api/messes/:id`

Update mess details.

### Delete Mess
**DELETE** `/api/messes/:id`

Soft delete a mess.

---

## Inventory API

### Get All Inventory Records
**GET** `/api/inventory`

Get all stock purchase records.

**Query Parameters:**
- `limit` (integer) - Max records to return (default: 100)
- `offset` (integer) - Records to skip (default: 0)

**Response:**
```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "id": 1,
      "product_id": 1,
      "product_name": "Guinness",
      "quantity_crates": 100,
      "purchase_price_per_crate": "2800.00",
      "supplier_name": "ABC Wholesalers",
      "supplier_contact": "+254-700-123-456",
      "date_added": "2025-11-02",
      "notes": null,
      "created_at": "2025-11-02T20:17:22.788Z"
    }
  ]
}
```

### Get Inventory by ID
**GET** `/api/inventory/:id`

Get specific inventory record.

### Get Inventory by Product
**GET** `/api/inventory/product/:productId`

Get all inventory records for a specific product.

**Query Parameters:**
- `limit` (integer) - Max records (default: 50)

### Add Stock
**POST** `/api/inventory`

Add stock to warehouse (record purchase from supplier).

**Request Body:**
```json
{
  "product_id": 1,
  "quantity_crates": 100,
  "purchase_price_per_crate": 2800,
  "supplier_name": "ABC Wholesalers",
  "supplier_contact": "+254-700-123-456",
  "date_added": "2025-11-02",
  "notes": "Bulk purchase"
}
```

**Required Fields:**
- `product_id` (integer)
- `quantity_crates` (integer, > 0)

**Response:**
```json
{
  "success": true,
  "message": "Added 100 crates of Guinness to inventory",
  "data": {
    "inventory": { ... },
    "updated_stock": {
      "product_name": "Guinness",
      "current_stock": 100,
      "total_purchased": 100
    }
  }
}
```

### Update Inventory Record
**PUT** `/api/inventory/:id`

Update an inventory record.

### Delete Inventory Record
**DELETE** `/api/inventory/:id`

Delete an inventory record.

### Get Recent Stock Additions
**GET** `/api/inventory/recent`

Get recent stock additions.

**Query Parameters:**
- `days` (integer) - Days to look back (default: 30)
- `limit` (integer) - Max records (default: 50)

### Get Inventory Summary
**GET** `/api/inventory/summary`

Get purchase summary grouped by product.

---

## Distributions API

### Get All Distributions
**GET** `/api/distributions`

Get all distribution records.

**Query Parameters:**
- `limit` (integer) - Max records (default: 100)
- `offset` (integer) - Records to skip (default: 0)

**Response:**
```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "id": 1,
      "mess_id": 1,
      "mess_name": "Mess 1 - Main Canteen",
      "mess_location": "Main Camp Block A",
      "product_id": 1,
      "product_name": "Guinness",
      "quantity_crates": 30,
      "price_per_crate": "3000.00",
      "total_value": "90000.00",
      "distribution_date": "2025-11-02",
      "notes": null,
      "created_at": "2025-11-02T20:17:29.565Z"
    }
  ]
}
```

### Get Single Distribution
**GET** `/api/distributions/:id`

Get specific distribution record.

### Get Distributions by Mess
**GET** `/api/distributions/mess/:messId`

Get all distributions to a specific mess.

**Query Parameters:**
- `limit` (integer) - Max records (default: 100)

### Get Distributions by Product
**GET** `/api/distributions/product/:productId`

Get all distributions of a specific product.

### Create Distribution
**POST** `/api/distributions`

Distribute stock to a mess.

**IMPORTANT:** This endpoint validates available stock. Cannot distribute more than available.

**Request Body:**
```json
{
  "mess_id": 1,
  "product_id": 1,
  "quantity_crates": 30,
  "price_per_crate": 3000,
  "distribution_date": "2025-11-02",
  "notes": "Regular delivery"
}
```

**Required Fields:**
- `mess_id` (integer)
- `product_id` (integer)
- `quantity_crates` (integer, > 0)
- `price_per_crate` (number, > 0)

**Response (Success):**
```json
{
  "success": true,
  "message": "Distributed 30 crates of Guinness to Mess 1 - Main Canteen",
  "data": {
    "distribution": { ... },
    "updated_stock": {
      "product_name": "Guinness",
      "current_stock": 70,
      "total_distributed": 30
    }
  }
}
```

**Response (Insufficient Stock):**
```json
{
  "success": false,
  "error": "Insufficient stock. Available: 70 crates, Requested: 100 crates"
}
```

### Update Distribution
**PUT** `/api/distributions/:id`

Update a distribution record.

### Delete Distribution
**DELETE** `/api/distributions/:id`

Delete a distribution record.

### Get Recent Distributions
**GET** `/api/distributions/recent`

Get recent distributions.

**Query Parameters:**
- `days` (integer) - Days to look back (default: 30)
- `limit` (integer) - Max records (default: 50)

### Get Distribution Summary
**GET** `/api/distributions/summary`

Get distribution summary for a date range.

**Query Parameters (Required):**
- `start_date` (date) - Start date (YYYY-MM-DD)
- `end_date` (date) - End date (YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "data": {
    "total_distributions": "15",
    "total_crates": "450",
    "total_revenue": "1350000.00",
    "messes_served": "3",
    "products_distributed": "5"
  }
}
```

---

## Dashboard API

### Get Dashboard Metrics
**GET** `/api/dashboard/metrics`

Get complete dashboard metrics (main endpoint for dashboard view).

**Response:**
```json
{
  "success": true,
  "data": {
    "stock": {
      "total_products": "5",
      "total_stock_crates": "70",
      "total_purchased_crates": "100",
      "total_distributed_crates": "30"
    },
    "distributions": {
      "total_distributions": "1",
      "total_crates_distributed": "30",
      "total_revenue": "90000.00"
    },
    "recent_activity": {
      "recent_distributions": "1",
      "recent_crates": "30",
      "recent_revenue": "90000.00"
    },
    "low_stock_alerts": [
      {
        "product_id": 2,
        "product_name": "Tusker",
        "current_stock": "5"
      }
    ],
    "top_products": [ ... ],
    "mess_summaries": [ ... ]
  }
}
```

### Get Current Stock
**GET** `/api/dashboard/stock`

Get current warehouse stock for all products.

### Get Mess Summaries
**GET** `/api/dashboard/messes`

Get distribution summaries for all messes.

### Get Product Summaries
**GET** `/api/dashboard/products`

Get distribution summaries for all products.

### Get Revenue by Date Range
**GET** `/api/dashboard/revenue`

Get daily revenue breakdown.

**Query Parameters (Required):**
- `start_date` (date) - Start date
- `end_date` (date) - End date

**Response:**
```json
{
  "success": true,
  "count": 7,
  "data": [
    {
      "distribution_date": "2025-11-02",
      "distribution_count": "3",
      "total_crates": "90",
      "daily_revenue": "270000.00"
    }
  ]
}
```

### Get Revenue by Mess
**GET** `/api/dashboard/revenue/mess`

Get revenue breakdown by mess.

**Query Parameters (Optional):**
- `start_date` (date)
- `end_date` (date)

### Get Revenue by Product
**GET** `/api/dashboard/revenue/product`

Get revenue breakdown by product.

### Get Activity Timeline
**GET** `/api/dashboard/activity`

Get recent activity timeline.

**Query Parameters:**
- `days` (integer) - Days to look back (default: 7)
- `limit` (integer) - Max records (default: 50)

---

## Error Handling

All endpoints follow a consistent error response format:

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message here"
}
```

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created successfully |
| 400 | Bad request (validation error, insufficient stock, etc.) |
| 404 | Resource not found |
| 409 | Conflict (duplicate entry) |
| 500 | Internal server error |

### Common Errors

**Validation Error:**
```json
{
  "success": false,
  "error": "product_id and quantity_crates are required"
}
```

**Not Found:**
```json
{
  "success": false,
  "error": "Product not found"
}
```

**Duplicate Entry:**
```json
{
  "success": false,
  "error": "Product with this name already exists"
}
```

**Insufficient Stock:**
```json
{
  "success": false,
  "error": "Insufficient stock. Available: 70 crates, Requested: 100 crates"
}
```

**Route Not Found:**
```json
{
  "success": false,
  "error": "Route /api/invalid not found"
}
```

---

## Testing the API

### Using cURL

**Get all products:**
```bash
curl http://localhost:5000/api/products
```

**Add stock:**
```bash
curl -X POST http://localhost:5000/api/inventory \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": 1,
    "quantity_crates": 100,
    "purchase_price_per_crate": 2800,
    "supplier_name": "ABC Wholesalers"
  }'
```

**Distribute to mess:**
```bash
curl -X POST http://localhost:5000/api/distributions \
  -H "Content-Type: application/json" \
  -d '{
    "mess_id": 1,
    "product_id": 1,
    "quantity_crates": 30,
    "price_per_crate": 3000
  }'
```

**Get dashboard metrics:**
```bash
curl http://localhost:5000/api/dashboard/metrics
```

### Using Postman/Thunder Client

1. Import the API endpoints
2. Set base URL: `http://localhost:5000`
3. Set Content-Type header: `application/json`
4. Test each endpoint

---

## Rate Limiting

Currently, there is no rate limiting. This will be added in future versions.

---

## Changelog

### Version 2.0.0 (Phase 2)
- Complete REST API implementation
- Product management endpoints
- Inventory management endpoints
- Distribution management endpoints
- Dashboard and reporting endpoints
- Stock validation logic
- Error handling middleware

### Version 1.0.0 (Phase 1)
- Basic server setup
- Database schema
- Health check endpoints

---

**Last Updated**: November 2, 2025
**API Version**: 2.0.0
