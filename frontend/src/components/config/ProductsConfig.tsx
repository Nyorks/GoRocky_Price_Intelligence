import { useState, useEffect } from 'react';
import { productApi } from '../../api/client';
import type { Product } from '../../types';
import './ConfigSection.css';

function ProductsConfig() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ 
    internalSku: '', 
    name: '', 
    ourPrice: '', 
    currency: 'USD' 
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productApi.getAll();
      setProducts(data);
    } catch (error) {
      console.error('Failed to load products:', error);
      alert('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        ourPrice: parseFloat(formData.ourPrice),
      };

      if (editingId) {
        await productApi.update(editingId, payload);
      } else {
        await productApi.create(payload);
      }
      setFormData({ internalSku: '', name: '', ourPrice: '', currency: 'USD' });
      setShowForm(false);
      setEditingId(null);
      await loadProducts();
    } catch (error: any) {
      console.error('Failed to save product:', error);
      alert(error.response?.data?.error || 'Failed to save product');
    }
  };

  const handleEdit = (product: Product) => {
    setFormData({
      internalSku: product.internalSku,
      name: product.name,
      ourPrice: product.ourPrice.toString(),
      currency: product.currency,
    });
    setEditingId(product.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await productApi.delete(id);
      await loadProducts();
    } catch (error) {
      console.error('Failed to delete product:', error);
      alert('Failed to delete product');
    }
  };

  const handleCancel = () => {
    setFormData({ internalSku: '', name: '', ourPrice: '', currency: 'USD' });
    setShowForm(false);
    setEditingId(null);
  };

  const formatPrice = (price: number, currency: string) => {
    const symbols: { [key: string]: string } = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      PHP: '₱',
    };
    const symbol = symbols[currency] || currency;
    return `${symbol}${price.toFixed(2)}`;
  };

  if (loading) {
    return <div className="spinner" />;
  }

  return (
    <div className="config-section">
      <div className="section-header">
        <h2>Products</h2>
        <button className="button" onClick={() => setShowForm(true)}>
          + Add Product
        </button>
      </div>

      {showForm && (
        <div className="card form-card">
          <h3>{editingId ? 'Edit Product' : 'Add New Product'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="label">Internal SKU *</label>
              <input
                type="text"
                className="input"
                value={formData.internalSku}
                onChange={e => setFormData({ ...formData, internalSku: e.target.value })}
                placeholder="PROD-001"
                required
              />
            </div>
            <div className="form-group">
              <label className="label">Product Name *</label>
              <input
                type="text"
                className="input"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="label">Our Price *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="input"
                  value={formData.ourPrice}
                  onChange={e => setFormData({ ...formData, ourPrice: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="label">Currency</label>
                <select
                  className="input"
                  value={formData.currency}
                  onChange={e => setFormData({ ...formData, currency: e.target.value })}
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="PHP">PHP (₱)</option>
                </select>
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="button">
                {editingId ? 'Update' : 'Create'}
              </button>
              <button type="button" className="button button-secondary" onClick={handleCancel}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Name</th>
              <th>Our Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id}>
                <td><code>{product.internalSku}</code></td>
                <td><strong>{product.name}</strong></td>
                <td>{formatPrice(product.ourPrice, product.currency)}</td>
                <td>
                  <button className="button-icon" onClick={() => handleEdit(product)}>
                    ✏️
                  </button>
                  <button className="button-icon" onClick={() => handleDelete(product.id)}>
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && (
          <p className="empty-state">No products yet. Add one to get started!</p>
        )}
      </div>
    </div>
  );
}

export default ProductsConfig;

