# Phase 3: Frontend Development Guide
## Rapid Prototype Implementation

This guide provides all the code needed to build a working frontend prototype.

## ✅ Step 1: React App Created

Already done! Located at `/home/art/projects/salesform/frontend`

## 📦 Step 2: Install Dependencies

```bash
cd frontend
npm install axios react-router-dom
```

## 📁 Project Structure

Create these folders in `frontend/src/`:
```
src/
├── services/      # API calls
├── components/    # Reusable components
├── pages/         # Page components
└── App.js         # Main app with routing
```

## 🔧 Step 3: Create API Service

**File:** `src/services/api.js`

```javascript
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Products
export const getProducts = () => api.get('/products');
export const getProductsWithStock = () => api.get('/products?with_stock=true');

// Messes
export const getMesses = () => api.get('/messes');

// Inventory
export const addStock = (data) => api.post('/inventory', data);
export const getInventory = () => api.get('/inventory');

// Distributions
export const createDistribution = (data) => api.post('/distributions', data);
export const getDistributions = () => api.get('/distributions');

// Dashboard
export const getDashboardMetrics = () => api.get('/dashboard/metrics');
export const getCurrentStock = () => api.get('/dashboard/stock');

export default api;
```

## 🎨 Step 4: Create Simple CSS

**File:** `src/App.css`

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f5f5f5;
}

.app {
  min-height: 100vh;
}

/* Navigation */
.nav {
  background-color: #2c3e50;
  color: white;
  padding: 1rem 2rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.nav h1 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.nav-links {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.nav-links button {
  background-color: #34495e;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  cursor: pointer;
  border-radius: 4px;
  font-size: 0.9rem;
  transition: background-color 0.2s;
}

.nav-links button:hover {
  background-color: #4a6278;
}

.nav-links button.active {
  background-color: #3498db;
}

/* Container */
.container {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 2rem;
}

/* Cards */
.card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.card h2 {
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

.card h3 {
  color: #34495e;
  margin-bottom: 0.8rem;
  font-size: 1.2rem;
}

/* Metrics Grid */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.metric-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem;
  border-radius: 8px;
  text-align: center;
}

.metric-card.green {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
}

.metric-card.blue {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.metric-card.orange {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.metric-value {
  font-size: 2rem;
  font-weight: bold;
  margin: 0.5rem 0;
}

.metric-label {
  font-size: 0.9rem;
  opacity: 0.9;
}

/* Forms */
.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #2c3e50;
  font-weight: 500;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.7rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #3498db;
}

button[type="submit"] {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 0.8rem 2rem;
  font-size: 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

button[type="submit"]:hover {
  background-color: #2980b9;
}

button[type="submit"]:disabled {
  background-color: #95a5a6;
  cursor: not-allowed;
}

/* Tables */
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

thead {
  background-color: #34495e;
  color: white;
}

th, td {
  padding: 0.8rem;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

tbody tr:hover {
  background-color: #f8f9fa;
}

/* Alerts */
.alert {
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.alert-success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.alert-error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.alert-warning {
  background-color: #fff3cd;
  color: #856404;
  border: 1px solid #ffeaa7;
}

/* Loading */
.loading {
  text-align: center;
  padding: 2rem;
  color: #7f8c8d;
}

/* Responsive */
@media (max-width: 768px) {
  .container {
    padding: 0 1rem;
  }

  .metrics-grid {
    grid-template-columns: 1fr;
  }

  .nav-links {
    flex-direction: column;
  }
}
```

## 📄 Step 5: Create Dashboard Page

**File:** `src/pages/Dashboard.js`

```javascript
import React, { useState, useEffect } from 'react';
import { getDashboardMetrics } from '../services/api';

function Dashboard() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      const response = await getDashboardMetrics();
      setMetrics(response.data.data);
      setError(null);
    } catch (err) {
      setError('Failed to load dashboard metrics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;
  if (error) return <div className="alert alert-error">{error}</div>;
  if (!metrics) return null;

  return (
    <div>
      <h2>Dashboard</h2>

      <div className="metrics-grid">
        <div className="metric-card green">
          <div className="metric-label">Current Stock</div>
          <div className="metric-value">{metrics.stock.total_stock_crates}</div>
          <div className="metric-label">crates</div>
        </div>

        <div className="metric-card blue">
          <div className="metric-label">Total Purchased</div>
          <div className="metric-value">{metrics.stock.total_purchased_crates}</div>
          <div className="metric-label">crates</div>
        </div>

        <div className="metric-card orange">
          <div className="metric-label">Total Distributed</div>
          <div className="metric-value">{metrics.stock.total_distributed_crates}</div>
          <div className="metric-label">crates</div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Total Revenue</div>
          <div className="metric-value">
            {parseInt(metrics.distributions.total_revenue || 0).toLocaleString()}
          </div>
          <div className="metric-label">KSH</div>
        </div>
      </div>

      <div className="card">
        <h3>Low Stock Alerts</h3>
        {metrics.low_stock_alerts.length === 0 ? (
          <p>No low stock alerts</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Current Stock</th>
              </tr>
            </thead>
            <tbody>
              {metrics.low_stock_alerts.map((alert) => (
                <tr key={alert.product_id}>
                  <td>{alert.product_name}</td>
                  <td style={{ color: alert.current_stock === '0' ? 'red' : 'orange' }}>
                    {alert.current_stock} crates
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card">
        <h3>Distribution by Mess</h3>
        <table>
          <thead>
            <tr>
              <th>Mess</th>
              <th>Distributions</th>
              <th>Total Crates</th>
              <th>Total Value</th>
            </tr>
          </thead>
          <tbody>
            {metrics.mess_summaries.map((mess) => (
              <tr key={mess.mess_id}>
                <td>{mess.mess_name}</td>
                <td>{mess.total_distributions}</td>
                <td>{mess.total_crates_received || 0}</td>
                <td>{parseInt(mess.total_value || 0).toLocaleString()} KSH</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Dashboard;
```

## 📄 Step 6: Create Add Stock Page

**File:** `src/pages/AddStock.js`

```javascript
import React, { useState, useEffect } from 'react';
import { getProducts, addStock } from '../services/api';

function AddStock() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [formData, setFormData] = useState({
    product_id: '',
    quantity_crates: '',
    purchase_price_per_crate: '',
    supplier_name: '',
    supplier_contact: '',
    notes: ''
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await getProducts();
      setProducts(response.data.data);
    } catch (err) {
      console.error('Failed to load products', err);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await addStock({
        ...formData,
        quantity_crates: parseInt(formData.quantity_crates),
        purchase_price_per_crate: parseFloat(formData.purchase_price_per_crate)
      });

      setMessage({
        type: 'success',
        text: response.data.message
      });

      // Reset form
      setFormData({
        product_id: '',
        quantity_crates: '',
        purchase_price_per_crate: '',
        supplier_name: '',
        supplier_contact: '',
        notes: ''
      });
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.error || 'Failed to add stock'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>Add Stock</h2>

      {message && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Product *</label>
          <select
            name="product_id"
            value={formData.product_id}
            onChange={handleChange}
            required
          >
            <option value="">Select Product</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} - {product.price_per_crate} KSH/crate
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Quantity (Crates) *</label>
          <input
            type="number"
            name="quantity_crates"
            value={formData.quantity_crates}
            onChange={handleChange}
            min="1"
            required
          />
        </div>

        <div className="form-group">
          <label>Purchase Price per Crate *</label>
          <input
            type="number"
            name="purchase_price_per_crate"
            value={formData.purchase_price_per_crate}
            onChange={handleChange}
            min="0"
            step="0.01"
            required
          />
        </div>

        <div className="form-group">
          <label>Supplier Name</label>
          <input
            type="text"
            name="supplier_name"
            value={formData.supplier_name}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Supplier Contact</label>
          <input
            type="text"
            name="supplier_contact"
            value={formData.supplier_contact}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="3"
          ></textarea>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Adding Stock...' : 'Add Stock'}
        </button>
      </form>
    </div>
  );
}

export default AddStock;
```

## 📄 Step 7: Create Distribute Stock Page

**File:** `src/pages/DistributeStock.js`

```javascript
import React, { useState, useEffect } from 'react';
import { getProductsWithStock, getMesses, createDistribution } from '../services/api';

function DistributeStock() {
  const [products, setProducts] = useState([]);
  const [messes, setMesses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [formData, setFormData] = useState({
    mess_id: '',
    product_id: '',
    quantity_crates: '',
    price_per_crate: '',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsRes, messesRes] = await Promise.all([
        getProductsWithStock(),
        getMesses()
      ]);
      setProducts(productsRes.data.data);
      setMesses(messesRes.data.data);
    } catch (err) {
      console.error('Failed to load data', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Auto-fill price when product is selected
    if (name === 'product_id' && value) {
      const product = products.find(p => p.id === parseInt(value));
      if (product) {
        setFormData(prev => ({
          ...prev,
          product_id: value,
          price_per_crate: product.price_per_crate
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await createDistribution({
        ...formData,
        mess_id: parseInt(formData.mess_id),
        product_id: parseInt(formData.product_id),
        quantity_crates: parseInt(formData.quantity_crates),
        price_per_crate: parseFloat(formData.price_per_crate)
      });

      setMessage({
        type: 'success',
        text: response.data.message
      });

      // Reset form
      setFormData({
        mess_id: '',
        product_id: '',
        quantity_crates: '',
        price_per_crate: '',
        notes: ''
      });

      // Reload products to update stock
      loadData();
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.error || 'Failed to distribute stock'
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedProduct = products.find(p => p.id === parseInt(formData.product_id));

  return (
    <div className="card">
      <h2>Distribute Stock</h2>

      {message && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      {selectedProduct && (
        <div className="alert alert-warning">
          Available Stock: <strong>{selectedProduct.current_stock} crates</strong>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Mess *</label>
          <select
            name="mess_id"
            value={formData.mess_id}
            onChange={handleChange}
            required
          >
            <option value="">Select Mess</option>
            {messes.map((mess) => (
              <option key={mess.id} value={mess.id}>
                {mess.name} - {mess.location}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Product *</label>
          <select
            name="product_id"
            value={formData.product_id}
            onChange={handleChange}
            required
          >
            <option value="">Select Product</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} (Available: {product.current_stock} crates)
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Quantity (Crates) *</label>
          <input
            type="number"
            name="quantity_crates"
            value={formData.quantity_crates}
            onChange={handleChange}
            min="1"
            max={selectedProduct?.current_stock || 999}
            required
          />
        </div>

        <div className="form-group">
          <label>Price per Crate *</label>
          <input
            type="number"
            name="price_per_crate"
            value={formData.price_per_crate}
            onChange={handleChange}
            min="0"
            step="0.01"
            required
          />
        </div>

        <div className="form-group">
          <label>Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="3"
          ></textarea>
        </div>

        <button type="submit" disabled={loading || !selectedProduct}>
          {loading ? 'Distributing...' : 'Distribute Stock'}
        </button>
      </form>
    </div>
  );
}

export default DistributeStock;
```

## 📄 Step 8: Create Main App Component

**File:** `src/App.js`

```javascript
import React, { useState } from 'react';
import Dashboard from './pages/Dashboard';
import AddStock from './pages/AddStock';
import DistributeStock from './pages/DistributeStock';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'addStock':
        return <AddStock />;
      case 'distribute':
        return <DistributeStock />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app">
      <nav className="nav">
        <h1>Sales & Distribution Management</h1>
        <div className="nav-links">
          <button
            className={currentPage === 'dashboard' ? 'active' : ''}
            onClick={() => setCurrentPage('dashboard')}
          >
            Dashboard
          </button>
          <button
            className={currentPage === 'addStock' ? 'active' : ''}
            onClick={() => setCurrentPage('addStock')}
          >
            Add Stock
          </button>
          <button
            className={currentPage === 'distribute' ? 'active' : ''}
            onClick={() => setCurrentPage('distribute')}
          >
            Distribute Stock
          </button>
        </div>
      </nav>

      <div className="container">
        {renderPage()}
      </div>
    </div>
  );
}

export default App;
```

## 🚀 Step 9: Run the Application

```bash
# Terminal 1: Start backend (if not already running)
cd backend
npm run dev

# Terminal 2: Start frontend
cd frontend
npm start
```

The app will open at `http://localhost:3000`

## ✅ What You Can Do

1. **View Dashboard** - See current stock, revenue, alerts
2. **Add Stock** - Add beer crates from suppliers
3. **Distribute Stock** - Send crates to messes (with validation)

## 🧪 Testing Workflow

1. Go to "Add Stock"
2. Select "Tusker" beer
3. Add 100 crates at 2600 KSH each
4. Submit ✅

5. Go to "Distribute Stock"
6. Select "Mess 1"
7. Select "Tusker"
8. Enter 30 crates
9. Submit ✅

10. Go to "Dashboard"
11. See updated metrics:
    - Stock decreased by 30
    - Revenue increased by 90,000 KSH
    - Distribution recorded

## 🎨 Customization

You can easily:
- Change colors in CSS
- Add more pages
- Add charts/graphs
- Improve validation
- Add loading spinners
- Add confirmation dialogs

## 📊 Next Steps

- Add proper routing (React Router)
- Add charts (Chart.js or Recharts)
- Add authentication
- Add inventory history view
- Add distribution history
- Add reports page
- Mobile responsive improvements

---

**This gives you a fully functional prototype in ~30 minutes of setup!**
