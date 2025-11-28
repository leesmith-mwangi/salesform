import React, { useState, useEffect } from 'react';
import { getDashboardMetrics, getDetailedDistributionsByMess, getCurrentStock } from '../services/api';

function Reports() {
  const [metrics, setMetrics] = useState(null);
  const [messDetails, setMessDetails] = useState([]);
  const [stockData, setStockData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const [metricsRes, messDetailsRes, stockRes] = await Promise.all([
        getDashboardMetrics(),
        getDetailedDistributionsByMess(),
        getCurrentStock()
      ]);

      setMetrics(metricsRes.data.data);
      setMessDetails(messDetailsRes.data.data);
      setStockData(stockRes.data.data);
      setError(null);
    } catch (err) {
      setError('Failed to load reports data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getTopProducts = () => {
    // Calculate total value per product from distributions
    const productMap = {};


    messDetails.forEach(mess => {
      if (mess.products && mess.products.length > 0) {
        mess.products.forEach(product => {
          if (!productMap[product.product_name]) {
            productMap[product.product_name] = {
              name: product.product_name,
              totalValue: 0,
              totalCrates: 0
            };
          }
          productMap[product.product_name].totalValue += Number(product.total_value) || 0;
          productMap[product.product_name].totalCrates += Number(product.quantity) || 0;
        });
      }
    });

    // Convert to array and sort by total value
    const productsArray = Object.values(productMap);
    productsArray.sort((a, b) => b.totalValue - a.totalValue);

    return productsArray.slice(0, 5); // Top 5
  };

  const getMessPerformance = () => {
        return messDetails
      .map(mess => ({
        name: mess.mess_name,
        totalValue: Number(mess.total_value) || 0,
        totalCrates: Number(mess.total_units_received) || 0,
        distributions: Number(mess.total_distributions) || 0
      }))
      .sort((a, b) => b.totalValue - a.totalValue);
  };

  if (loading) return <div className="loading">Loading reports...</div>;
  if (error) return <div className="alert alert-error">{error}</div>;
  if (!metrics) return null;

  const topProducts = getTopProducts();
  console.log("topProducts:", topProducts);
  const messPerformance = getMessPerformance();
  const totalRevenue = messDetails.reduce((sum, mess) => sum + (Number(mess.total_value) || 0), 0);

  return (
    <div>
      <div className="page-header">
        <h2>Reports & Analytics</h2>
        <button className="btn-action btn-primary" onClick={() => alert('Export feature coming soon!')}>
          📄 Export Report
        </button>
      </div>

      {/* Revenue Summary */}
      <div className="card">
        <h3>Revenue Summary</h3>
        <div className="metrics-grid">
          <div className="metric-card green">
            <div className="metric-label">Total Sales</div>
            <div className="metric-value">{totalRevenue.toLocaleString()}</div>
            <div className="metric-label">KSH</div>
          </div>

          <div className="metric-card blue">
            <div className="metric-label">Total Units Distributed</div>
            <div className="metric-value">{metrics.stock?.total_distributed_units || 0}</div>
            <div className="metric-label">units</div>
          </div>

          <div className="metric-card orange">
            <div className="metric-label">Average per Mess</div>
            <div className="metric-value">
              {messDetails.length > 0 ? Math.round(totalRevenue / messDetails.length).toLocaleString() : 0}
            </div>
            <div className="metric-label">KSH</div>
          </div>

          <div className="metric-card">
            <div className="metric-label">Total Distributions</div>
            <div className="metric-value">
              {messDetails.reduce((sum, mess) => sum + parseInt(mess.total_distributions || 0), 0)}
            </div>
            <div className="metric-label">records</div>
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="card">
        <h3>Top Selling Products</h3>
        <p className="card-subtitle">By total revenue</p>
        {topProducts.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '2rem', color: '#7f8c8d' }}>
            No product data available
          </p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Product</th>
                <th>Total Crates Sold</th>
                <th>Total Revenue</th>
                <th>% of Total</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((product, index) => {
                const percentage = totalRevenue > 0 ? ((product.totalValue / totalRevenue) * 100).toFixed(1) : 0;
                return (
                  <tr key={product.name}>
                    <td><strong>#{index + 1}</strong></td>
                    <td><strong>{product.name}</strong></td>
                    <td>{product.totalCrates} crates</td>
                    <td>{product.totalValue.toLocaleString()} KSH</td>
                    <td>
                      <span className="percentage-badge">{percentage}%</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Mess Performance */}
      <div className="card">
        <h3>Mess Performance Comparison</h3>
        <p className="card-subtitle">Ranked by total value of distributions</p>
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Mess</th>
              <th>Distributions</th>
              <th>Total Crates</th>
              <th>Total Value</th>
            </tr>
          </thead>
          <tbody>
            {messPerformance.map((mess, index) => (
              <tr key={mess.name}>
                <td><strong>#{index + 1}</strong></td>
                <td><strong>{mess.name}</strong></td>
                <td>{mess.distributions}</td>
                <td>{mess.totalCrates} crates</td>
                <td>{mess.totalValue.toLocaleString()} KSH</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Stock Status Summary */}
      <div className="card">
        <h3>Current Stock Status</h3>
        <div className="summary-grid">
          <div className="summary-item">
            <span className="summary-label">Total Products:</span>
            <span className="summary-value">{stockData.length}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Available Stock:</span>
            <span className="summary-value">{metrics.stock?.total_stock_units || 0} units</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Low Stock Items:</span>
            <span className="summary-value" style={{ color: '#e67e22' }}>
              {metrics.low_stock_alerts.length}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Stock Turnover:</span>
            <span className="summary-value">
              {(Number(metrics.stock?.total_added_units) || 0) > 0
                ? (((Number(metrics.stock?.total_distributed_units) || 0) / (Number(metrics.stock?.total_added_units) || 1)) * 100).toFixed(1)
                : 0}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reports;
