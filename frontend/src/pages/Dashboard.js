import React, { useState, useEffect } from 'react';
import { getDashboardMetrics, getDistributions } from '../services/api';

function Dashboard({ onNavigate }) {
  const [metrics, setMetrics] = useState(null);
  const [recentDistributions, setRecentDistributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [metricsRes, distributionsRes] = await Promise.all([
        getDashboardMetrics(),
        getDistributions()
      ]);
      setMetrics(metricsRes.data.data);
      // Get only the 5 most recent distributions
      const allDistributions = distributionsRes.data.data || [];
      setRecentDistributions(allDistributions.slice(0, 5));
      setError(null);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Filter critical alerts (stock = 0 or < 5)
  const getCriticalAlerts = () => {
    if (!metrics || !metrics.low_stock_alerts) return [];
    return metrics.low_stock_alerts.filter(alert => parseInt(alert.current_stock) < 5);
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;
  if (error) return <div className="alert alert-error">{error}</div>;
  if (!metrics) return null;

  const criticalAlerts = getCriticalAlerts();

  // Calculate profit metrics safely
  const totalProfit = Number(metrics.profit?.total_profit) || 0;
  const totalRevenue = Number(metrics.distributions?.total_revenue) || 0;
  const totalCost = Number(metrics.profit?.total_cost) || 0;
  const profitMargin = totalCost > 0 ? ((totalProfit / totalCost) * 100) : 0;

  return (
    <div>
      <h2>Dashboard Overview</h2>

      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-card green">
          <div className="metric-label">Current Stock</div>
          <div className="metric-value">{metrics.stock.total_stock_units}</div>
          <div className="metric-label">units</div>
        </div>

        <div className="metric-card blue">
          <div className="metric-label">Total Added</div>
          <div className="metric-value">{metrics.stock.total_added_units}</div>
          <div className="metric-label">units</div>
        </div>

        <div className="metric-card orange">
          <div className="metric-label">Total Distributed</div>
          <div className="metric-value">{metrics.stock.total_distributed_units}</div>
          <div className="metric-label">units</div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Total Revenue</div>
          <div className="metric-value">
            {totalRevenue.toLocaleString()}
          </div>
          <div className="metric-label">KSH</div>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <h3 style={{ color: 'white' }}>💰 Financial Overview</h3>
        <div className="metrics-grid" style={{ marginTop: '1rem' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Total Purchase Cost</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0.5rem 0' }}>
              {(Number(metrics.purchase_costs?.total_purchase_cost) || 0).toLocaleString()} KSH
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Total Revenue</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0.5rem 0' }}>
              {totalRevenue.toLocaleString()} KSH
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Gross Profit</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0.5rem 0', color: totalProfit >= 0 ? '#90EE90' : '#FF6B6B' }}>
              {totalProfit.toLocaleString()} KSH
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Profit Margin</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0.5rem 0', color: profitMargin >= 0 ? '#90EE90' : '#FF6B6B' }}>
              {profitMargin.toFixed(1)}%
            </div>
          </div>
        </div>
        <p style={{ textAlign: 'center', marginTop: '1rem', opacity: 0.9, fontSize: '0.9rem' }}>
          💡 View detailed profit analysis in the Reports section
        </p>
      </div>

      {/* Critical Alerts */}
      {criticalAlerts.length > 0 && (
        <div className="card alert-critical">
          <h3>🚨 Critical Alerts</h3>
          <p className="alert-subtitle">Products with very low or no stock (less than 5 units)</p>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Current Stock</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {criticalAlerts.map((alert) => (
                <tr key={alert.product_id}>
                  <td><strong>{alert.product_name}</strong></td>
                  <td style={{ color: alert.current_stock === '0' ? '#c0392b' : '#e67e22', fontWeight: 'bold' }}>
                    {alert.current_stock} units
                  </td>
                  <td>
                    <span className={`stock-badge stock-${alert.current_stock === '0' ? 'red' : 'orange'}`}>
                      {alert.current_stock === '0' ? 'OUT OF STOCK' : 'VERY LOW'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Recent Activity */}
      <div className="card">
        <h3>Recent Activity</h3>
        <p className="card-subtitle">Last 5 distributions</p>
        {recentDistributions.length === 0 ? (
          <p>No recent distributions</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Product</th>
                <th>Mess</th>
                <th>Quantity</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {recentDistributions.map((dist) => (
                <tr key={dist.id}>
                  <td>{new Date(dist.distribution_date).toLocaleDateString()}</td>
                  <td>{dist.product_name}</td>
                  <td>{dist.mess_name}</td>
                  <td>{dist.quantity} units</td>
                  <td>{parseInt(dist.total_value).toLocaleString()} KSH</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="action-buttons">
          <button className="btn-action btn-primary" onClick={() => onNavigate && onNavigate('addStock')}>
            📦 Add Stock
          </button>
          <button className="btn-action btn-secondary" onClick={() => onNavigate && onNavigate('distribute')}>
            📤 Distribute Stock
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
