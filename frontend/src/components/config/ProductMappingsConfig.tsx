import { useState, useEffect } from 'react';
import { productMappingApi, productApi, competitorApi } from '../../api/client';
import type { ProductMapping, Product, Competitor } from '../../types';
import './ConfigSection.css';

function ProductMappingsConfig() {
  const [mappings, setMappings] = useState<ProductMapping[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    productId: '',
    competitorId: '',
    productUrl: '',
    isActive: true,
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [mappingsData, productsData, competitorsData] = await Promise.all([
        productMappingApi.getAll(),
        productApi.getAll(),
        competitorApi.getAll(),
      ]);
      setMappings(mappingsData);
      setProducts(productsData);
      setCompetitors(competitorsData);
    } catch (error) {
      console.error('Failed to load data:', error);
      alert('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await productMappingApi.update(editingId, formData);
      } else {
        await productMappingApi.create(formData);
      }
      setFormData({ productId: '', competitorId: '', productUrl: '', isActive: true });
      setShowForm(false);
      setEditingId(null);
      await loadData();
    } catch (error: any) {
      console.error('Failed to save mapping:', error);
      alert(error.response?.data?.error || 'Failed to save mapping');
    }
  };

  const handleEdit = (mapping: ProductMapping) => {
    setFormData({
      productId: mapping.productId,
      competitorId: mapping.competitorId,
      productUrl: mapping.productUrl,
      isActive: mapping.isActive,
    });
    setEditingId(mapping.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this mapping?')) return;
    try {
      await productMappingApi.delete(id);
      await loadData();
    } catch (error) {
      console.error('Failed to delete mapping:', error);
      alert('Failed to delete mapping');
    }
  };

  const handleToggleActive = async (mapping: ProductMapping) => {
    try {
      await productMappingApi.update(mapping.id, { isActive: !mapping.isActive });
      await loadData();
    } catch (error) {
      console.error('Failed to toggle mapping:', error);
      alert('Failed to toggle mapping');
    }
  };

  const handleCancel = () => {
    setFormData({ productId: '', competitorId: '', productUrl: '', isActive: true });
    setShowForm(false);
    setEditingId(null);
  };

  if (loading) {
    return <div className="spinner" />;
  }

  return (
    <div className="config-section">
      <div className="section-header">
        <h2>Product Mappings</h2>
        <button className="button" onClick={() => setShowForm(true)}>
          + Add Mapping
        </button>
      </div>

      {showForm && (
        <div className="card form-card">
          <h3>{editingId ? 'Edit Mapping' : 'Add New Mapping'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="label">Product *</label>
              <select
                className="input"
                value={formData.productId}
                onChange={e => setFormData({ ...formData, productId: e.target.value })}
                required
              >
                <option value="">Select a product...</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.name} ({product.internalSku})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="label">Competitor *</label>
              <select
                className="input"
                value={formData.competitorId}
                onChange={e => setFormData({ ...formData, competitorId: e.target.value })}
                required
              >
                <option value="">Select a competitor...</option>
                {competitors.map(competitor => (
                  <option key={competitor.id} value={competitor.id}>
                    {competitor.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="label">Product URL *</label>
              <input
                type="url"
                className="input"
                value={formData.productUrl}
                onChange={e => setFormData({ ...formData, productUrl: e.target.value })}
                placeholder="https://www.competitor.com/product/123"
                required
              />
            </div>
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                />
                <span>Active (include in scraping)</span>
              </label>
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
              <th>Product</th>
              <th>Competitor</th>
              <th>URL</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {mappings.map(mapping => (
              <tr key={mapping.id}>
                <td>
                  <strong>{mapping.product?.name}</strong>
                  <br />
                  <small style={{ color: '#6b7280' }}>{mapping.product?.internalSku}</small>
                </td>
                <td>{mapping.competitor?.name}</td>
                <td>
                  <a href={mapping.productUrl} target="_blank" rel="noopener noreferrer" className="url-link">
                    {mapping.productUrl.length > 50 
                      ? mapping.productUrl.substring(0, 50) + '...' 
                      : mapping.productUrl
                    }
                  </a>
                </td>
                <td>
                  <span 
                    className={`badge ${mapping.isActive ? 'badge-success' : 'badge-danger'}`}
                    onClick={() => handleToggleActive(mapping)}
                    style={{ cursor: 'pointer' }}
                    title="Click to toggle"
                  >
                    {mapping.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <button className="button-icon" onClick={() => handleEdit(mapping)}>
                    ✏️
                  </button>
                  <button className="button-icon" onClick={() => handleDelete(mapping.id)}>
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {mappings.length === 0 && (
          <p className="empty-state">
            No product mappings yet. Add products and competitors first, then create mappings!
          </p>
        )}
      </div>
    </div>
  );
}

export default ProductMappingsConfig;

