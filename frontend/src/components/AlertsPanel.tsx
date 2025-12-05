import type { Alert } from '../types';
import './AlertsPanel.css';

interface Props {
  alerts: Alert[];
}

function AlertsPanel({ alerts }: Props) {
  const getAlertClass = (type: Alert['alertType']) => {
    return type === 'big_drop' ? 'alert-warning' : 'alert-error';
  };

  const getAlertIcon = (type: Alert['alertType']) => {
    return type === 'big_drop' ? '📉' : '⚠️';
  };

  const formatPrice = (price: number, currency: string = 'USD') => {
    const symbols: { [key: string]: string } = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      PHP: '₱',
    };
    const symbol = symbols[currency] || '$';
    return `${symbol}${price.toFixed(2)}`;
  };

  return (
    <div className="card alerts-panel">
      <h2>🚨 Active Alerts</h2>
      <div className="alerts-list">
        {alerts.slice(0, 10).map(alert => (
          <div key={alert.id} className={`alert ${getAlertClass(alert.alertType)}`}>
            <div className="alert-header">
              <span className="alert-icon">{getAlertIcon(alert.alertType)}</span>
              <div className="alert-info">
                <strong>{alert.productName}</strong>
                <span className="competitor-tag">vs {alert.competitorName}</span>
              </div>
              <span className="alert-percentage">
                {alert.percentage.toFixed(1)}%
              </span>
            </div>
            <div className="alert-message">{alert.message}</div>
            <div className="alert-action">
              <strong>💡 Suggested Action:</strong> {alert.suggestedAction}
            </div>
            <div className="alert-details">
              {alert.alertType === 'big_drop' ? (
                <>
                  Previous: {formatPrice(alert.previousPrice || 0)} → Current: {formatPrice(alert.currentPrice)}
                </>
              ) : (
                <>
                  Their price: {formatPrice(alert.currentPrice)} | Our price: {formatPrice(alert.ourPrice || 0)}
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AlertsPanel;

