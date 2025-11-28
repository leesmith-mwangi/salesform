import React, { useState, useEffect } from 'react';
import { getProducts, addStock } from '../services/api';

function AddStock() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({
    product_id: '',
    quantity: '',
    purchase_price_per_unit: '',
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
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Update selected product when product is chosen
    if (name === 'product_id' && value) {
      const product = products.find(p => p.id === parseInt(value));
      setSelectedProduct(product);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await addStock({
        ...formData,
        product_id: parseInt(formData.product_id),
        quantity: parseInt(formData.quantity),
        purchase_price_per_unit: parseFloat(formData.purchase_price_per_unit),
        unit_type: selectedProduct?.unit_type || 'crate'
      });

      setMessage({
        type: 'success',
        text: response.data.message
      });

      // Reset form
      setFormData({
        product_id: '',
        quantity: '',
        purchase_price_per_unit: '',
        supplier_name: '',
        supplier_contact: '',
        notes: ''
      });
      setSelectedProduct(null);
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

      {/* Purchase Cost Preview */}
      {formData.quantity && formData.purchase_price_per_unit && (
        <div style={{ 
          padding: '1rem', 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
          borderRadius: '8px', 
          color: 'white',
          marginBottom: '1.5rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Total Purchase Cost:</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 'bold', marginTop: '0.3rem' }}>
                {(parseInt(formData.quantity) * parseFloat(formData.purchase_price_per_unit)).toLocaleString()} KSH
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>
                {formData.quantity} {selectedProduct?.unit_type === 'piece' ? 'pieces' : 'crates'} × {parseFloat(formData.purchase_price_per_unit).toLocaleString()} KSH
              </div>
            </div>
          </div>
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
                {product.name} ({product.unit_type === 'piece' ? 'Piece' : 'Crate'})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>
            Quantity ({selectedProduct?.unit_type === 'piece' ? 'Pieces' : 'Crates'}) *
          </label>
          <input
            type="text"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            min="1"
            required
            placeholder={`Enter number of ${selectedProduct?.unit_type === 'piece' ? 'pieces' : 'crates'}`}
          />
        </div>

        <div className="form-group">
          <label>
            Purchase Price per {selectedProduct?.unit_type === 'piece' ? 'Piece' : 'Crate'} *
          </label>
          <input
            type="number"
            name="purchase_price_per_unit"
            value={formData.purchase_price_per_unit}
            onChange={handleChange}
            min="0"
            step="0.01"
            required
            placeholder="Enter purchase price"
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
