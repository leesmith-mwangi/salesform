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
