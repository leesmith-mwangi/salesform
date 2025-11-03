import React, { useState, useEffect } from 'react';
import { getCurrentStock } from '../services/api';

function StockManagement({ onNavigate }) {
  const [stockData, setStockData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadStock();
  }, []);

  const loadStock = async () => {
    try {
      setLoading(true);
      const response = await getCurrentStock();
      setStockData(response.data.data);
      setError(null);
    } catch (err) {
      setError('Failed to load stock data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = (stock) => {
    const stockNum = parseInt(stock);
    if (stockNum === 0) return { label: 'OUT', color: 'red', priority: 3 };
    if (stockNum <= 10) return { label: 'LOW', color: 'orange', priority: 2 };
    return { label: 'OK', color: 'green', priority: 1 };
  };

  // Filter and search logic
  const filteredStock = stockData.filter((product) => {
    const matchesSearch = product.product_name.toLowerCase().includes(searchTerm.toLowerCase());
    const status = getStockStatus(product.current_stock);

    if (filterStatus === 'all') return matchesSearch;
    if (filterStatus === 'out') return matchesSearch && status.label === 'OUT';
    if (filterStatus === 'low') return matchesSearch && status.label === 'LOW';
    if (filterStatus === 'ok') return matchesSearch && status.label === 'OK';

    return matchesSearch;
  });

  if (loading) return <div className="loading">Loading stock data...</div>;
  if (error) return <div className="alert alert-error">{error}</div>;

  return (
    <div>
      <div className="page-header">
        <h2>Stock Management</h2>
        <button className="btn-action btn-primary" onClick={() => onNavigate && onNavigate('addStock')}>
          + Add Stock
        </button>
      </div>

      <div className="card">
        <div className="filters-row">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="filter-box">
            <label>Filter by Status:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Products</option>
              <option value="ok">In Stock</option>
              <option value="low">Low Stock</option>
              <option value="out">Out of Stock</option>
            </select>
          </div>
        </div>

        <div className="results-count">
          Showing {filteredStock.length} of {stockData.length} products
        </div>

        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Available Stock</th>
              <th>Total Purchased</th>
              <th>Total Distributed</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredStock.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#7f8c8d' }}>
                  No products found
                </td>
              </tr>
            ) : (
              filteredStock.map((product) => {
                const status = getStockStatus(product.current_stock);
                return (
                  <tr key={product.product_id}>
                    <td><strong>{product.product_name}</strong></td>
                    <td>{product.current_stock} crates</td>
                    <td>{product.total_purchased} crates</td>
                    <td>{product.total_distributed} crates</td>
                    <td>
                      <span className={`stock-badge stock-${status.color}`}>
                        {status.label}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="stock-summary card">
        <h3>Stock Summary</h3>
        <div className="summary-grid">
          <div className="summary-item">
            <span className="summary-label">Total Products:</span>
            <span className="summary-value">{stockData.length}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">In Stock:</span>
            <span className="summary-value">
              {stockData.filter(p => getStockStatus(p.current_stock).label === 'OK').length}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Low Stock:</span>
            <span className="summary-value" style={{ color: '#e67e22' }}>
              {stockData.filter(p => getStockStatus(p.current_stock).label === 'LOW').length}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Out of Stock:</span>
            <span className="summary-value" style={{ color: '#c0392b' }}>
              {stockData.filter(p => getStockStatus(p.current_stock).label === 'OUT').length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StockManagement;
