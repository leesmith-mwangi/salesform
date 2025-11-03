import React, { useState, useEffect } from 'react';
import { getDetailedDistributionsByMess } from '../services/api';

function DistributionsOverview({ onNavigate }) {
  const [messDetails, setMessDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDistributions();
  }, []);

  const loadDistributions = async () => {
    try {
      setLoading(true);
      const response = await getDetailedDistributionsByMess();
      setMessDetails(response.data.data);
      setError(null);
    } catch (err) {
      setError('Failed to load distribution data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading distributions...</div>;
  if (error) return <div className="alert alert-error">{error}</div>;

  return (
    <div>
      <div className="page-header">
        <h2>Distributions Overview</h2>
        <button className="btn-action btn-secondary" onClick={() => onNavigate && onNavigate('distribute')}>
          📤 New Distribution
        </button>
      </div>

      <div className="card">
        <h3>Distribution by Mess - Detailed View</h3>
        <p className="card-subtitle">Product breakdown for each mess</p>

        {messDetails.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '2rem', color: '#7f8c8d' }}>
            No distributions yet
          </p>
        ) : (
          messDetails.map((mess) => (
            <div key={mess.mess_id} className="mess-detail-card">
              <div className="mess-header">
                <div>
                  <h4>{mess.mess_name}</h4>
                  <p className="mess-location">📍 {mess.mess_location}</p>
                </div>
                <div className="mess-header-stats">
                  <div className="stat-item">
                    <span className="stat-label">Distributions:</span>
                    <span className="stat-value">{mess.total_distributions}</span>
                  </div>
                </div>
              </div>

              {mess.products && mess.products.length > 0 ? (
                <>
                  <div className="products-list">
                    <h5>Products Distributed:</h5>
                    {mess.products.map((product, index) => (
                      <div key={index} className="product-item">
                        <div className="product-name">{product.product_name}</div>
                        <div className="product-details">
                          <span className="product-quantity">{product.quantity_crates} crates</span>
                          <span className="product-separator">×</span>
                          <span className="product-price">{parseInt(product.price_per_crate).toLocaleString()} KSH</span>
                          <span className="product-separator">=</span>
                          <strong className="product-total">{parseInt(product.total_value).toLocaleString()} KSH</strong>
                        </div>
                        <div className="product-date">
                          Date: {new Date(product.distribution_date).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mess-total">
                    <div className="total-label">Total for {mess.mess_name}:</div>
                    <div className="total-details">
                      <span className="total-crates">{mess.total_crates || 0} crates</span>
                      <span className="total-separator">|</span>
                      <strong className="total-value">{parseInt(mess.total_value || 0).toLocaleString()} KSH</strong>
                    </div>
                  </div>
                </>
              ) : (
                <p className="no-distributions">No distributions to this mess yet</p>
              )}
            </div>
          ))
        )}
      </div>

      {/* Summary Statistics */}
      <div className="card">
        <h3>Overall Summary</h3>
        <div className="summary-grid">
          <div className="summary-item">
            <span className="summary-label">Total Messes Served:</span>
            <span className="summary-value">{messDetails.length}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Total Crates Distributed:</span>
            <span className="summary-value">
              {messDetails.reduce((sum, mess) => sum + parseInt(mess.total_crates || 0), 0)}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Total Value:</span>
            <span className="summary-value">
              {messDetails.reduce((sum, mess) => sum + parseInt(mess.total_value || 0), 0).toLocaleString()} KSH
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Total Distributions:</span>
            <span className="summary-value">
              {messDetails.reduce((sum, mess) => sum + parseInt(mess.total_distributions || 0), 0)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DistributionsOverview;
