import { useState, useEffect } from 'react';
import { scheduleApi, scrapeApi } from '../api/client';
import './ScheduleStatus.css';

interface ScheduleConfig {
  id: string;
  isEnabled: boolean;
  cronExpression: string;
  maxRetries: number;
  retryDelayMs: number;
  description: string;
  lastRunAt: string | null;
  nextRunAt: string | null;
  schedulerStatus: {
    isActive: boolean;
    isRunning: boolean;
  };
}

interface ScrapeStatus {
  lastRun: any;
  isEnabled: boolean;
  schedule: string;
  lastRunAt: string | null;
  nextRunAt: string | null;
  isInProgress: boolean;
}

function ScheduleStatus() {
  const [config, setConfig] = useState<ScheduleConfig | null>(null);
  const [status, setStatus] = useState<ScrapeStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [formData, setFormData] = useState({
    cronExpression: '',
    maxRetries: 3,
    description: '',
  });
  const [copiedPattern, setCopiedPattern] = useState<string | null>(null);

  useEffect(() => {
    loadStatus();
    // Refresh status every 30 seconds
    const interval = setInterval(loadStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadStatus = async () => {
    try {
      const [configData, statusData] = await Promise.all([
        scheduleApi.getConfig(),
        scrapeApi.getStatus(),
      ]);
      setConfig(configData);
      setStatus(statusData);
      setFormData({
        cronExpression: configData.cronExpression,
        maxRetries: configData.maxRetries,
        description: configData.description || '',
      });
    } catch (error) {
      console.error('Failed to load schedule status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async () => {
    if (!config) return;
    
    try {
      if (config.isEnabled) {
        await scheduleApi.disable();
      } else {
        await scheduleApi.enable();
      }
      await loadStatus();
    } catch (error) {
      console.error('Failed to toggle scheduler:', error);
      alert('Failed to toggle scheduler');
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await scheduleApi.updateConfig(formData);
      setShowSettings(false);
      await loadStatus();
      alert('Schedule settings updated successfully');
    } catch (error: any) {
      console.error('Failed to update settings:', error);
      alert(error.response?.data?.error || 'Failed to update settings');
    }
  };

  const formatDateTime = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
    return new Date(dateStr).toLocaleString();
  };

  const formatCronDescription = (cron: string) => {
    const patterns: { [key: string]: string } = {
      '* * * * *': 'Every 1 minute',
      '0 * * * *': 'Every hour',
      '0 3 * * *': 'Daily at 3:00 AM',
      '0 */6 * * *': 'Every 6 hours',
      '*/15 * * * *': 'Every 15 minutes',
      '0 9 * * 1': 'Every Monday at 9:00 AM',
    };
    return patterns[cron] || cron;
  };

  const handlePatternClick = async (pattern: string) => {
    setFormData({ ...formData, cronExpression: pattern });
    
    // Copy to clipboard
    try {
      await navigator.clipboard.writeText(pattern);
      setCopiedPattern(pattern);
      setTimeout(() => setCopiedPattern(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (loading) {
    return <div className="spinner" />;
  }

  if (!config || !status) {
    return <div className="alert alert-error">Failed to load schedule status</div>;
  }

  return (
    <div className="schedule-status card">
      <div className="schedule-header">
        <h3>🤖 Automated Scraping</h3>
        <div className="status-badge">
          <span className={`badge ${config.isEnabled ? 'badge-success' : 'badge-danger'}`}>
            {config.isEnabled ? '● Active' : '○ Inactive'}
          </span>
          {status.isInProgress && (
            <span className="badge badge-info">🔄 Running...</span>
          )}
        </div>
      </div>

      <div className="schedule-info">
        <div className="info-row">
          <span className="info-label">Schedule:</span>
          <span className="info-value">
            {formatCronDescription(config.cronExpression)}
            <small> ({config.cronExpression})</small>
          </span>
        </div>
        
        <div className="info-row">
          <span className="info-label">Last Run:</span>
          <span className="info-value">
            {formatDateTime(config.lastRunAt)}
            {status.lastRun && (
              <span className={`status-indicator ${status.lastRun.status}`}>
                {status.lastRun.status === 'success' ? ' ✓' : status.lastRun.status === 'partial' ? ' ⚠' : ' ✗'}
              </span>
            )}
          </span>
        </div>

        <div className="info-row">
          <span className="info-label">Next Run:</span>
          <span className="info-value">{formatDateTime(config.nextRunAt)}</span>
        </div>

        <div className="info-row">
          <span className="info-label">Max Retries:</span>
          <span className="info-value">{config.maxRetries}</span>
        </div>
      </div>

      <div className="schedule-actions">
        <button
          className={`button ${config.isEnabled ? 'button-danger' : ''}`}
          onClick={handleToggle}
        >
          {config.isEnabled ? '⏸ Disable' : '▶ Enable'} Automation
        </button>
        <button
          className="button button-secondary"
          onClick={() => setShowSettings(!showSettings)}
        >
          ⚙️ Settings
        </button>
      </div>

      {showSettings && (
        <div className="schedule-settings">
          <h4>Schedule Settings</h4>

          <form onSubmit={handleSaveSettings}>
            <div className="form-group">
              <label className="label">Cron Expression</label>
              <input
                type="text"
                className="input"
                value={formData.cronExpression}
                onChange={e => setFormData({ ...formData, cronExpression: e.target.value })}
                placeholder="0 3 * * *"
                required
              />
              <div className="common-patterns">
                <strong>Common patterns (click to use):</strong>
                {copiedPattern && (
                  <div className="copied-notification">
                    ✓ Pattern copied and applied!
                  </div>
                )}
                <div className="pattern-list">
                  <div 
                    className="pattern-item pattern-highlight"
                    onClick={() => handlePatternClick('* * * * *')}
                    title="Click to use this pattern - Perfect for testing!"
                  >
                    <code>* * * * *</code>
                    <span>Every 1 minute <strong>(Testing)</strong></span>
                  </div>
                  <div 
                    className="pattern-item"
                    onClick={() => handlePatternClick('0 * * * *')}
                    title="Click to use this pattern"
                  >
                    <code>0 * * * *</code>
                    <span>Every hour</span>
                  </div>
                  <div 
                    className="pattern-item"
                    onClick={() => handlePatternClick('0 3 * * *')}
                    title="Click to use this pattern"
                  >
                    <code>0 3 * * *</code>
                    <span>Daily at 3 AM</span>
                  </div>
                  <div 
                    className="pattern-item"
                    onClick={() => handlePatternClick('*/15 * * * *')}
                    title="Click to use this pattern"
                  >
                    <code>*/15 * * * *</code>
                    <span>Every 15 minutes</span>
                  </div>
                  <div 
                    className="pattern-item"
                    onClick={() => handlePatternClick('0 */6 * * *')}
                    title="Click to use this pattern"
                  >
                    <code>0 */6 * * *</code>
                    <span>Every 6 hours</span>
                  </div>
                  <div 
                    className="pattern-item"
                    onClick={() => handlePatternClick('0 9 * * 1')}
                    title="Click to use this pattern"
                  >
                    <code>0 9 * * 1</code>
                    <span>Every Monday at 9 AM</span>
                  </div>
                </div>
                <small className="help-text">
                  ℹ️ Format: <code>minute hour day month weekday</code>
                  <br />
                  💡 Click any pattern to apply it instantly
                </small>
              </div>
            </div>

            <div className="form-group">
              <label className="label">Max Retries</label>
              <input
                type="number"
                className="input"
                value={formData.maxRetries}
                onChange={e => setFormData({ ...formData, maxRetries: parseInt(e.target.value) })}
                min="0"
                max="10"
                required
              />
            </div>

            <div className="form-group">
              <label className="label">Description (Optional)</label>
              <input
                type="text"
                className="input"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="e.g., Daily price check at 3 AM"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="button">
                Save Settings
              </button>
              <button
                type="button"
                className="button button-secondary"
                onClick={() => setShowSettings(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default ScheduleStatus;

