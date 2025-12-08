import React, { useState, useEffect } from 'react';
import { getAllProducts, addProduct, deleteProduct, updateProduct } from '../services/api';

function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Form data for new/edit product
  const [formData, setFormData] = useState({
    name: '',
    unit_type: 'crate',
    units_per_package: 1
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await getAllProducts();
      console.log('API Response:', response); // Debug log
      
      // Handle the API response structure
      let productData;
      if (response?.data?.data) {
        // If response has nested data (success: true, data: [...])
        productData = response.data.data;
      } else if (response?.data) {
        // If response.data is the array
        productData = response.data;
      } else {
        // Fallback
        productData = response || [];
      }
      
      console.log('Product Data:', productData); // Debug log
      setProducts(Array.isArray(productData) ? productData : []);
    } catch (err) {
      console.error('Error loading products:', err);
      setProducts([]); // Set empty array on error
      setMessage({
        type: 'error',
        text: 'Failed to load products: ' + (err.response?.data?.error || err.message)
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'units_per_package' ? parseInt(value) || 1 : value
    }));
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setMessage({ type: 'error', text: 'Product name is required' });
      return;
    }

    try {
      await addProduct(formData);
      setMessage({ type: 'success', text: 'Product added successfully!' });
      setFormData({ name: '', unit_type: 'crate', units_per_package: 1 });
      setShowAddForm(false);
      loadProducts();
    } catch (err) {
      setMessage({
        type: 'error',
        text: 'Failed to add product: ' + (err.response?.data?.error || err.message)
      });
    }
  };

  const handleEditProduct = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setMessage({ type: 'error', text: 'Product name is required' });
      return;
    }

    try {
      await updateProduct(editingProduct.id, formData);
      setMessage({ type: 'success', text: 'Product updated successfully!' });
      setEditingProduct(null);
      setFormData({ name: '', unit_type: 'crate', units_per_package: 1 });
      loadProducts();
    } catch (err) {
      setMessage({
        type: 'error',
        text: 'Failed to update product: ' + (err.response?.data?.error || err.message)
      });
    }
  };

  const handleDeleteProduct = async (product) => {
    if (!window.confirm(`Are you sure you want to delete "${product.name}"?\n\nThis action cannot be undone and may affect existing inventory and distributions.`)) {
      return;
    }

    try {
      await deleteProduct(product.id);
      setMessage({ type: 'success', text: 'Product deleted successfully!' });
      loadProducts();
    } catch (err) {
      setMessage({
        type: 'error',
        text: 'Failed to delete product: ' + (err.response?.data?.error || err.message)
      });
    }
  };

  const startEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      unit_type: product.unit_type,
      units_per_package: product.units_per_package
    });
    setShowAddForm(false);
  };

  const cancelEdit = () => {
    setEditingProduct(null);
    setFormData({ name: '', unit_type: 'crate', units_per_package: 1 });
  };

  const cancelAdd = () => {
    setShowAddForm(false);
    setFormData({ name: '', unit_type: 'crate', units_per_package: 1 });
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div className="loading-spinner">Loading products...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div className="card">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <h2 style={{ margin: 0 }}>🛍️ Product Management</h2>
          <button
            onClick={() => setShowAddForm(true)}
            style={{
              background: 'linear-gradient(135deg, #4CAF50, #45a049)',
              color: 'white',
              border: 'none',
              padding: '0.8rem 1.5rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            disabled={showAddForm || editingProduct}
          >
            ➕ Add New Product
          </button>
        </div>

        {message && (
          <div 
            className={`alert alert-${message.type}`}
            style={{ 
              marginBottom: '1.5rem',
              padding: '0.8rem 1rem',
              borderRadius: '8px',
              backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
              color: message.type === 'success' ? '#155724' : '#721c24',
              border: `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`
            }}
          >
            {message.text}
          </div>
        )}

        {/* Add Product Form */}
        {showAddForm && (
          <div style={{
            background: '#f8f9fa',
            padding: '1.5rem',
            borderRadius: '12px',
            marginBottom: '2rem',
            border: '2px dashed #28a745'
          }}>
            <h3 style={{ marginTop: 0, color: '#28a745' }}>➕ Add New Product</h3>
            <form onSubmit={handleAddProduct}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label>Product Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Tusker Lager Can"
                    required
                    autoFocus
                  />
                </div>

                <div className="form-group">
                  <label>Unit Type *</label>
                  <select
                    name="unit_type"
                    value={formData.unit_type}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="crate">Crate/Package</option>
                    <option value="piece">Individual Piece</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Units per Package *</label>
                  <input
                    type="number"
                    name="units_per_package"
                    value={formData.units_per_package}
                    onChange={handleInputChange}
                    min="1"
                    max="500"
                    placeholder="e.g., 24"
                    required
                  />
                  <small style={{ color: '#6c757d', fontSize: '0.8rem' }}>
                    {formData.unit_type === 'piece' ? 'Always 1 for individual pieces' : 'Number of items per crate/package'}
                  </small>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="submit" style={{ background: '#28a745', color: 'white', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '6px', cursor: 'pointer' }}>
                  ✅ Add Product
                </button>
                <button type="button" onClick={cancelAdd} style={{ background: '#6c757d', color: 'white', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '6px', cursor: 'pointer' }}>
                  ❌ Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Edit Product Form */}
        {editingProduct && (
          <div style={{
            background: '#fff3cd',
            padding: '1.5rem',
            borderRadius: '12px',
            marginBottom: '2rem',
            border: '2px dashed #ffc107'
          }}>
            <h3 style={{ marginTop: 0, color: '#856404' }}>✏️ Edit Product: {editingProduct.name}</h3>
            <form onSubmit={handleEditProduct}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label>Product Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    autoFocus
                  />
                </div>

                <div className="form-group">
                  <label>Unit Type *</label>
                  <select
                    name="unit_type"
                    value={formData.unit_type}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="crate">Crate/Package</option>
                    <option value="piece">Individual Piece</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Units per Package *</label>
                  <input
                    type="number"
                    name="units_per_package"
                    value={formData.units_per_package}
                    onChange={handleInputChange}
                    min="1"
                    max="500"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="submit" style={{ background: '#ffc107', color: 'black', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>
                  ✅ Update Product
                </button>
                <button type="button" onClick={cancelEdit} style={{ background: '#6c757d', color: 'white', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '6px', cursor: 'pointer' }}>
                  ❌ Cancel
                </button>
              </div>
            </form>
          </div>
        )}

          {/* Products List */}
        <div>
          <h3>📋 Current Products ({Array.isArray(products) ? products.length : 0})</h3>
          
          {!Array.isArray(products) || products.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '3rem', 
              background: '#f8f9fa', 
              borderRadius: '12px',
              color: '#6c757d'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
              <p>No products found. Add your first product above!</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse',
                background: 'white',
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
              }}>
                <thead style={{ background: '#f8f9fa' }}>
                  <tr>
                    <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>ID</th>
                    <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Product Name</th>
                    <th style={{ padding: '1rem', textAlign: 'center', borderBottom: '2px solid #dee2e6' }}>Unit Type</th>
                    <th style={{ padding: '1rem', textAlign: 'center', borderBottom: '2px solid #dee2e6' }}>Units/Package</th>
                    <th style={{ padding: '1rem', textAlign: 'center', borderBottom: '2px solid #dee2e6' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(products) && products.map((product, index) => (
                    <tr key={product.id} style={{ 
                      borderBottom: '1px solid #dee2e6',
                      background: index % 2 === 0 ? '#fff' : '#f8f9fa'
                    }}>
                      <td style={{ padding: '0.8rem' }}>{product.id}</td>
                      <td style={{ padding: '0.8rem', fontWeight: '500' }}>{product.name}</td>
                      <td style={{ padding: '0.8rem', textAlign: 'center' }}>
                        <span style={{
                          background: product.unit_type === 'piece' ? '#e7f3ff' : '#f0f8e7',
                          color: product.unit_type === 'piece' ? '#0066cc' : '#28a745',
                          padding: '0.3rem 0.8rem',
                          borderRadius: '20px',
                          fontSize: '0.8rem',
                          fontWeight: '500'
                        }}>
                          {product.unit_type}
                        </span>
                      </td>
                      <td style={{ padding: '0.8rem', textAlign: 'center' }}>
                        <strong>{product.units_per_package}</strong>
                        {product.unit_type === 'piece' ? '' : ` per ${product.unit_type}`}
                      </td>
                      <td style={{ padding: '0.8rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                          <button
                            onClick={() => startEdit(product)}
                            style={{
                              background: '#17a2b8',
                              color: 'white',
                              border: 'none',
                              padding: '0.4rem 0.8rem',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '0.8rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.3rem'
                            }}
                            disabled={showAddForm || editingProduct}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product)}
                            style={{
                              background: '#dc3545',
                              color: 'white',
                              border: 'none',
                              padding: '0.4rem 0.8rem',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '0.8rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.3rem'
                            }}
                            disabled={showAddForm || editingProduct}
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Help Section */}
        <div style={{
          marginTop: '3rem',
          padding: '1.5rem',
          background: '#e3f2fd',
          borderRadius: '12px',
          border: '1px solid #bbdefb'
        }}>
          <h4 style={{ color: '#1565c0', marginTop: 0 }}>💡 Help & Tips</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', fontSize: '0.9rem', color: '#424242' }}>
            <div>
              <strong>🔹 Unit Types:</strong>
              <ul style={{ marginTop: '0.5rem', paddingLeft: '1.2rem' }}>
                <li><strong>Crate/Package:</strong> For items sold in groups (e.g., 24 bottles per crate)</li>
                <li><strong>Piece:</strong> For individual items (e.g., spirits, wines)</li>
              </ul>
            </div>
            <div>
              <strong>🔹 Adding Products:</strong>
              <ul style={{ marginTop: '0.5rem', paddingLeft: '1.2rem' }}>
                <li>Click "Add New Product" button</li>
                <li>Fill in product name and specifications</li>
                <li>For spirits/wines, use "Piece" with 1 unit per package</li>
              </ul>
            </div>
            <div>
              <strong>🔹 Managing Products:</strong>
              <ul style={{ marginTop: '0.5rem', paddingLeft: '1.2rem' }}>
                <li>Edit: Modify existing product details</li>
                <li>Delete: Permanently remove products (use with caution)</li>
                <li>Products in use will show warnings before deletion</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductManagement;