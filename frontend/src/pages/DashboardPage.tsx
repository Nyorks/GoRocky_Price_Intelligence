import { useState, useEffect } from 'react';
import { dashboardApi, scrapeApi } from '../api/client';
import type { DashboardSummary, CompetitorPriceComparison, Alert } from '../types';
import PriceComparisonTable from '../components/PriceComparisonTable';
import AlertsPanel from '../components/AlertsPanel';
import PriceHistoryChart from '../components/PriceHistoryChart';
import ScheduleStatus from '../components/ScheduleStatus';
import './DashboardPage.css';

function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardApi.getSummary();
      setSummary(data);
      
      // Auto-select first product if available
      if (data.comparisons.length > 0 && !selectedProductId) {
        setSelectedProductId(data.comparisons[0].productId);
      }
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunScraper = async () => {
    try {
      setScraping(true);
      setError(null);
      const result = await scrapeApi.run(true); // Use mock scraper
      alert(`Scrape completed!\nSuccess: ${result.successCount}/${result.totalMappings}\nTime: ${result.runtime}ms`);
      await loadDashboard(); // Reload dashboard with new data
    } catch (err) {
      setError('Failed to run scraper');
      console.error(err);
    } finally {
      setScraping(false);
    }
  };

  if (loading) {
    return <div className="spinner" />;
  }

  if (error) {
    return (
      <div className="alert alert-error">
        {error}
        <button className="button" onClick={loadDashboard} style={{ marginLeft: '10px' }}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1>Price Intelligence Dashboard</h1>
          {summary?.lastScrapeTime && (
            <p className="last-updated">
              Last updated: {new Date(summary.lastScrapeTime).toLocaleString()}
            </p>
          )}
        </div>
        <div className="header-actions">
          <button 
            className="button" 
            onClick={handleRunScraper}
            disabled={scraping}
          >
            {scraping ? 'Scraping...' : '🔄 Run Scraper'}
          </button>
          <button className="button button-secondary" onClick={loadDashboard}>
            ↻ Refresh
          </button>
        </div>
      </div>

      {summary && (
        <>
          {/* Schedule Status Panel */}
          <ScheduleStatus />

          {/* Alerts Panel */}
          {summary.alerts.length > 0 && (
            <AlertsPanel alerts={summary.alerts} />
          )}

          {/* Price Comparison Table */}
          <div className="card">
            <h2>Current Price Comparison</h2>
            <PriceComparisonTable 
              comparisons={summary.comparisons}
              onProductSelect={setSelectedProductId}
              selectedProductId={selectedProductId}
            />
          </div>

          {/* Price History Chart */}
          {selectedProductId && (
            <div className="card">
              <h2>Price History (Last 30 Days)</h2>
              <PriceHistoryChart productId={selectedProductId} />
            </div>
          )}

          {summary.comparisons.length === 0 && (
            <div className="alert alert-info">
              <strong>No data yet!</strong>
              <br />
              Go to Configuration to set up products and competitors, then run the scraper.
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default DashboardPage;

