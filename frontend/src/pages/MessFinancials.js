import React, { useState, useEffect } from 'react';
import { 
  getAllMessFinancialSummaries,
  createPayment,
  getPaymentsByMess
} from '../services/api';

function MessFinancials() {
  const [financials, setFinancials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMess, setSelectedMess] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [payments, setPayments] = useState([]);
  const [message, setMessage] = useState(null);
  
  const [paymentForm, setPaymentForm] = useState({
    amount_paid: '',
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: 'cash',
    reference_number: '',
    notes: ''
  });

  useEffect(() => {
    loadFinancials();
  }, []);

  const loadFinancials = async () => {
    try {
      setLoading(true);
      const response = await getAllMessFinancialSummaries();
      setFinancials(response.data.data);
      setError(null);
    } catch (err) {
      setError('Failed to load financial data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadPayments = async (messId) => {
    try {
      const response = await getPaymentsByMess(messId);
      setPayments(response.data.data);
    } catch (err) {
      console.error('Failed to load payments', err);
    }
  };

  const handleViewDetails = async (financial) => {
    setSelectedMess(financial);
    await loadPayments(financial.mess_id);
  };

  const handleBackToList = () => {
    setSelectedMess(null);
    setShowPaymentForm(false);
    setMessage(null);
  };

  const handlePaymentFormChange = (e) => {
    setPaymentForm({
      ...paymentForm,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      await createPayment({
        mess_id: selectedMess.mess_id,
        ...paymentForm,
        amount_paid: parseFloat(paymentForm.amount_paid)
      });

      setMessage({
        type: 'success',
        text: 'Payment recorded successfully!'
      });

      // Reload data
      await loadFinancials();
      await loadPayments(selectedMess.mess_id);
      
      // Update selected mess with new data
      const response = await getAllMessFinancialSummaries();
      const updatedMess = response.data.data.find(m => m.mess_id === selectedMess.mess_id);
      setSelectedMess(updatedMess);

      // Reset form
      setPaymentForm({
        amount_paid: '',
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: 'cash',
        reference_number: '',
        notes: ''
      });
      setShowPaymentForm(false);
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.error || 'Failed to record payment'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && !selectedMess) return <div className="loading">Loading financial data...</div>;
  if (error) return <div className="alert alert-error">{error}</div>;

  // Detail View
  if (selectedMess) {
    return (
      <div>
        <button className="btn-back" onClick={handleBackToList}>
          ← Back to Financial Summary
        </button>

        <div className="card">
          <div className="mess-detail-header">
            <div>
              <h2>{selectedMess.mess_name}</h2>
              
            </div>
            <div className="mess-contact">
              <p><strong>Contact:</strong> {selectedMess.contact_person}</p>
              <p><strong>Phone:</strong> {selectedMess.phone}</p>
            </div>
          </div>
        </div>

        {message && (
          <div className={`alert alert-${message.type}`}>
            {message.text}
          </div>
        )}

        {/* Financial Summary */}
        <div className="card">
          <h3>Financial Summary</h3>
          <div className="financial-summary">
            <div className="financial-item">
              <span className="financial-label">Total Value (Owed):</span>
              <span className="financial-value total">
                {parseInt(selectedMess.total_value || 0).toLocaleString()} KSH
              </span>
            </div>
            <div className="financial-item">
              <span className="financial-label">Amount Paid:</span>
              <span className="financial-value paid">
                {parseInt(selectedMess.amount_paid || 0).toLocaleString()} KSH
              </span>
            </div>
            <div className="financial-item balance-item">
              <span className="financial-label">Balance:</span>
              <span className={`financial-value balance ${selectedMess.balance > 0 ? 'debt' : 'clear'}`}>
                {parseInt(selectedMess.balance || 0).toLocaleString()} KSH
                {selectedMess.balance === 0 && ' ✓'}
              </span>
            </div>
          </div>

          <div className="stats-grid" style={{ marginTop: '1rem' }}>
            <div className="stat-box">
              <span>Distributions:</span>
              <strong>{selectedMess.distribution_count}</strong>
            </div>
            <div className="stat-box">
              <span>Units Received:</span>
              <strong>{Number(selectedMess.total_units_received) || 0}</strong>
            </div>
            <div className="stat-box">
              <span>Payments Made:</span>
              <strong>{selectedMess.payment_count}</strong>
            </div>
          </div>

          {!showPaymentForm && (
            <button
              className="btn-primary"
              style={{ marginTop: '1rem' }}
              onClick={() => setShowPaymentForm(true)}
            >
              💰 Record New Payment
            </button>
          )}
        </div>

        {/* Payment Form */}
        {showPaymentForm && (
          <div className="card">
            <h3>Record Payment</h3>
            <form onSubmit={handleSubmitPayment}>
              <div className="form-group">
                <label>Amount Paid (KSH) *</label>
                <input
                  type="number"
                  name="amount_paid"
                  value={paymentForm.amount_paid}
                  onChange={handlePaymentFormChange}
                  required
                  min="0.01"
                  step="0.01"
                  placeholder="Enter amount paid"
                />
              </div>

              <div className="form-group">
                <label>Payment Date *</label>
                <input
                  type="date"
                  name="payment_date"
                  value={paymentForm.payment_date}
                  onChange={handlePaymentFormChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Payment Method</label>
                <select
                  name="payment_method"
                  value={paymentForm.payment_method}
                  onChange={handlePaymentFormChange}
                >
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="mobile_money">Mobile Money</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Reference Number</label>
                <input
                  type="text"
                  name="reference_number"
                  value={paymentForm.reference_number}
                  onChange={handlePaymentFormChange}
                  placeholder="Receipt/Transaction number"
                />
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  name="notes"
                  value={paymentForm.notes}
                  onChange={handlePaymentFormChange}
                  rows="3"
                  placeholder="Additional notes..."
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-submit" disabled={loading}>
                  {loading ? 'Recording...' : 'Record Payment'}
                </button>
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowPaymentForm(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Payment History */}
        {payments.length > 0 && (
          <div className="card">
            <h3>Payment History</h3>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Reference</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <td>{new Date(payment.payment_date).toLocaleDateString()}</td>
                    <td><strong>{parseInt(payment.amount_paid).toLocaleString()} KSH</strong></td>
                    <td>{payment.payment_method || '-'}</td>
                    <td>{payment.reference_number || '-'}</td>
                    <td>{payment.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  // List View
  return (
    <div>
      <div className="page-header">
        <h2>Mess Financial Summary</h2>
        <p>Track payments and balances for each mess</p>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Mess Name</th>
              <th>Total Value</th>
              <th>Amount Paid</th>
              <th>Balance</th>
              <th>Distributions</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {financials.map((financial) => (
              <tr key={financial.mess_id}>
                <td>
                  <strong>{financial.mess_name}</strong>
                </td>
                <td>{parseInt(financial.total_value || 0).toLocaleString()} KSH</td>
                <td>{parseInt(financial.amount_paid || 0).toLocaleString()} KSH</td>
                <td>
                  <span className={`balance-badge ${financial.balance > 0 ? 'debt' : 'clear'}`}>
                    {parseInt(financial.balance || 0).toLocaleString()} KSH
                    {financial.balance === 0 && ' ✓'}
                  </span>
                </td>
                <td>
                  {financial.distribution_count} distributions<br />
                  <small>{Number(financial.total_units_received) || 0} units</small>
                </td>
                <td>
                  <button
                    className="btn-action"
                    onClick={() => handleViewDetails(financial)}
                  >
                    View Details →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {financials.length === 0 && (
        <div className="card">
          <p style={{ textAlign: 'center', padding: '2rem', color: '#7f8c8d' }}>
            No financial data available
          </p>
        </div>
      )}
    </div>
  );
}

export default MessFinancials;
