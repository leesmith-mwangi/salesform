import React, { useState, useEffect } from 'react';
import { 
  getMesses, 
  getDetailedDistributionsByMess
} from '../services/api';

function Messes() {
  const [messes, setMesses] = useState([]);
  const [messesWithDetails, setMessesWithDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMess, setSelectedMess] = useState(null);

  useEffect(() => {
    loadMesses();
  }, []);

  const loadMesses = async () => {
    try {
      setLoading(true);
      const [messesRes, detailsRes] = await Promise.all([
        getMesses(),
        getDetailedDistributionsByMess()
      ]);

      setMesses(messesRes.data.data);
      setMessesWithDetails(detailsRes.data.data);
      setError(null);
    } catch (err) {
      setError('Failed to load mess data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getMessDetails = (messId) => {
    return messesWithDetails.find(m => m.mess_id === messId) || null;
  };

  const handleViewDetails = (mess) => {
    setSelectedMess(mess);
  };

  const handleBackToList = () => {
    setSelectedMess(null);
  };

  if (loading) return <div className="loading">Loading messes...</div>;
  if (error) return <div className="alert alert-error">{error}</div>;

  // Detail View
  if (selectedMess) {
    const details = getMessDetails(selectedMess.id);


    return (
      <div>
        <button className="btn-back" onClick={handleBackToList}>
          ← Back to Messes
        </button>

        <div className="card">
          <div className="mess-detail-header">
            <div>
              <h2>{selectedMess.name}</h2>
            </div>
            <div className="mess-contact">
              <p><strong>Contact Person:</strong> {selectedMess.contact_person}</p>
              <p><strong>Phone:</strong> {selectedMess.phone}</p>
            </div>
          </div>
        </div>

        {details ? (
          <>
            <div className="card">
              <h3>Summary</h3>
              <div className="summary-grid">
                <div className="summary-item">
                  <span className="summary-label">Total Distributions:</span>
                  <span className="summary-value">{details.total_distributions}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Total Crates Received:</span>
                  <span className="summary-value">{details.total_crates || 0}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Total Value:</span>
                  <span className="summary-value">{parseInt(details.total_value || 0).toLocaleString()} KSH</span>
                </div>
              </div>
            </div>

            {details.products && details.products.length > 0 && (
              <div className="card">
                <h3>Distribution History</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Product</th>
                      <th>Quantity</th>
                      <th>Price per Crate</th>
                      <th>Total Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {details.products.map((product, index) => (
                      <tr key={index}>
                        <td>{new Date(product.distribution_date).toLocaleDateString()}</td>
                        <td><strong>{product.product_name}</strong></td>
                        <td>{product.quantity} crates</td>
                        <td>{parseInt(product.price_per_unit).toLocaleString()} KSH</td>
                        <td>{parseInt(product.total_value).toLocaleString()} KSH</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : (
          <div className="card">
            <p style={{ textAlign: 'center', padding: '2rem', color: '#7f8c8d' }}>
              No distributions to this mess yet
            </p>
          </div>
        )}
      </div>
    );
  }

  // List View
  return (
    <div>
      <div className="page-header">
        <h2>Messes</h2>
      </div>

      <div className="messes-grid">
        {messes.map((mess) => {
          const details = getMessDetails(mess.id);
          return (
            <div key={mess.id} className="mess-card">
              <div className="mess-card-header">
                <h3>{mess.name}</h3>
                <span className={`status-badge ${mess.is_active ? 'active' : 'inactive'}`}>
                  {mess.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="mess-card-body">
                <p className="mess-contact">👤 {mess.contact_person}</p>
                <p className="mess-phone">📞 {mess.phone}</p>
              </div>

              {details && (
                <div className="mess-card-stats">
                  <div className="stat">
                    <span className="stat-label">Distributions:</span>
                    <span className="stat-value">{details.total_distributions}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Total Crates:</span>
                    <span className="stat-value">{details.total_crates || 0}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Total Value:</span>
                    <span className="stat-value">{parseInt(details.total_value || 0).toLocaleString()} KSH</span>
                  </div>
                </div>
              )}

              <div className="mess-card-footer">
                <button
                  className="btn-view-details"
                  onClick={() => handleViewDetails(mess)}
                >
                  View Details →
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {messes.length === 0 && (
        <div className="card">
          <p style={{ textAlign: 'center', padding: '2rem', color: '#7f8c8d' }}>
            No messes found
          </p>
        </div>
      )}
    </div>
  );
}

export default Messes;
