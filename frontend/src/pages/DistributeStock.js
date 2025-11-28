import React, { useState, useEffect } from 'react';
import { getProductsWithStock, getMesses, createDistribution, getAttendantsByMess } from '../services/api';

function DistributeStock() {
  const [products, setProducts] = useState([]);
  const [messes, setMesses] = useState([]);
  const [attendants, setAttendants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [formData, setFormData] = useState({
    mess_id: '',
    product_id: '',
    quantity: '',
    price_per_unit: '',
    attendant_id: '',
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

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Load attendants when mess is selected
    if (name === 'mess_id' && value) {
      try {
        const response = await getAttendantsByMess(value);
        setAttendants(response.data.data);
        // Reset attendant selection
        setFormData(prev => ({
          ...prev,
          mess_id: value,
          attendant_id: ''
        }));
      } catch (err) {
        console.error('Failed to load attendants', err);
        setAttendants([]);
      }
    }

    // Auto-fill price when product is selected
    if (name === 'product_id' && value) {
      const product = products.find(p => p.id === parseInt(value));
      if (product) {
        setFormData(prev => ({
          ...prev,
          product_id: value
          // Note: price is now entered manually, not auto-filled
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const selectedProduct = products.find(p => p.id === parseInt(formData.product_id));

    try {
      const response = await createDistribution({
        ...formData,
        mess_id: parseInt(formData.mess_id),
        product_id: parseInt(formData.product_id),
        quantity: parseInt(formData.quantity),
        price_per_unit: parseFloat(formData.price_per_unit),
        attendant_id: formData.attendant_id ? parseInt(formData.attendant_id) : null,
        unit_type: selectedProduct?.unit_type || 'crate'
      });

      setMessage({
        type: 'success',
        text: response.data.message
      });

      // Reset form
      setFormData({
        mess_id: '',
        product_id: '',
        quantity: '',
        price_per_unit: '',
        attendant_id: '',
        notes: ''
      });
      setAttendants([]);

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
          Available Stock: <strong>{selectedProduct.current_stock} {selectedProduct.unit_type === 'piece' ? 'pieces' : 'crates'}</strong>
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
                {mess.name} 
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Attendant Receiving Stock</label>
          <select
            name="attendant_id"
            value={formData.attendant_id}
            onChange={handleChange}
            disabled={!formData.mess_id}
          >
            <option value="">Select Attendant (Optional)</option>
            {attendants.map((attendant) => (
              <option key={attendant.id} value={attendant.id}>
                {attendant.name}
              </option>
            ))}
          </select>
          {!formData.mess_id && (
            <small style={{ color: '#666', fontStyle: 'italic' }}>
              Please select a mess first to see attendants
            </small>
          )}
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
                {product.name} - Available: {product.current_stock} {product.unit_type === 'piece' ? 'pieces' : 'crates'}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Quantity ({selectedProduct?.unit_type === 'piece' ? 'Pieces' : 'Crates'}) *</label>
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            min="1"
            max={selectedProduct?.current_stock || 999}
            required
            placeholder={`Enter number of ${selectedProduct?.unit_type === 'piece' ? 'pieces' : 'crates'}`}
          />
        </div>

        <div className="form-group">
          <label>Price per {selectedProduct?.unit_type === 'piece' ? 'Piece' : 'Crate'} *</label>
          <input
            type="number"
            name="price_per_unit"
            value={formData.price_per_unit}
            onChange={handleChange}
            min="0"
            step="0.01"
            required
            placeholder="Enter selling price"
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
