import { useState, useEffect } from 'react';
import { competitorApi } from '../../api/client';
import type { Competitor } from '../../types';
import './ConfigSection.css';

function CompetitorsConfig() {
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', baseUrl: '', notes: '' });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    loadCompetitors();
  }, []);

  const loadCompetitors = async () => {
    try {
      setLoading(true);
      const data = await competitorApi.getAll();
      setCompetitors(data);
    } catch (error) {
      console.error('Failed to load competitors:', error);
      alert('Failed to load competitors');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await competitorApi.update(editingId, formData);
      } else {
        await competitorApi.create(formData);
      }
      setFormData({ name: '', baseUrl: '', notes: '' });
      setShowForm(false);
      setEditingId(null);
      await loadCompetitors();
    } catch (error: any) {
      console.error('Failed to save competitor:', error);
      alert(error.response?.data?.error || 'Failed to save competitor');
    }
  };

  const handleEdit = (competitor: Competitor) => {
    setFormData({
      name: competitor.name,
      baseUrl: competitor.baseUrl,
      notes: competitor.notes || '',
    });
    setEditingId(competitor.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this competitor?')) return;
    try {
      await competitorApi.delete(id);
      await loadCompetitors();
    } catch (error) {
      console.error('Failed to delete competitor:', error);
      alert('Failed to delete competitor');
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', baseUrl: '', notes: '' });
    setShowForm(false);
    setEditingId(null);
  };

  if (loading) {
    return <div className="spinner" />;
  }

  return (
    <div className="config-section">
      <div className="section-header">
        <h2>Competitors</h2>
        <button className="button" onClick={() => setShowForm(true)}>
          + Add Competitor
        </button>
      </div>

      {showForm && (
        <div className="card form-card">
          <h3>{editingId ? 'Edit Competitor' : 'Add New Competitor'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="label">Name *</label>
              <input
                type="text"
                className="input"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="label">Base URL *</label>
              <input
                type="url"
                className="input"
                value={formData.baseUrl}
                onChange={e => setFormData({ ...formData, baseUrl: e.target.value })}
                placeholder="https://www.example.com"
                required
              />
            </div>
            <div className="form-group">
              <label className="label">Notes</label>
              <textarea
                className="input"
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
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
              <th>Name</th>
              <th>Base URL</th>
              <th>Notes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {competitors.map(competitor => (
              <tr key={competitor.id}>
                <td><strong>{competitor.name}</strong></td>
                <td><a href={competitor.baseUrl} target="_blank" rel="noopener noreferrer">{competitor.baseUrl}</a></td>
                <td>{competitor.notes || '—'}</td>
                <td>
                  <button className="button-icon" onClick={() => handleEdit(competitor)}>
                    ✏️
                  </button>
                  <button className="button-icon" onClick={() => handleDelete(competitor.id)}>
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {competitors.length === 0 && (
          <p className="empty-state">No competitors yet. Add one to get started!</p>
        )}
      </div>
    </div>
  );
}

export default CompetitorsConfig;

