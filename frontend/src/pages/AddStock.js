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
