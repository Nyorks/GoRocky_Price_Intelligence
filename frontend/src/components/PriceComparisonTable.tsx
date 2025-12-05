import type { CompetitorPriceComparison } from '../types';
import './PriceComparisonTable.css';

interface Props {
  comparisons: CompetitorPriceComparison[];
  onProductSelect?: (productId: string) => void;
  selectedProductId?: string | null;
}

function PriceComparisonTable({ comparisons, onProductSelect, selectedProductId }: Props) {
  if (comparisons.length === 0) {
    return <p className="empty-state">No price data available yet.</p>;
  }

  // Get all unique competitors
  const competitors = new Set<string>();
  comparisons.forEach(comp => {
    comp.competitorPrices.forEach(cp => competitors.add(cp.competitorName));
  });
  const competitorNames = Array.from(competitors);

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

  const getDifferenceClass = (difference: number) => {
    if (difference < -5) return 'price-better'; // We're cheaper
    if (difference > 5) return 'price-worse'; // They're cheaper
    return 'price-neutral';
  };

  const getDifferenceText = (difference: number) => {
    const abs = Math.abs(difference);
    if (difference < 0) {
      return `↓ ${abs.toFixed(1)}%`; // We're cheaper
    }
    return `↑ ${abs.toFixed(1)}%`; // They're cheaper
  };

  return (
    <div className="price-comparison-table-wrapper">
      <table className="table price-comparison-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>SKU</th>
            <th>Our Price</th>
            {competitorNames.map(name => (
              <th key={name}>{name}</th>
            ))}
            <th>Min / Avg / Max</th>
          </tr>
        </thead>
        <tbody>
          {comparisons.map(comparison => {
            const isSelected = comparison.productId === selectedProductId;
            
            return (
              <tr 
                key={comparison.productId}
                className={isSelected ? 'selected' : ''}
                onClick={() => onProductSelect?.(comparison.productId)}
                style={{ cursor: onProductSelect ? 'pointer' : 'default' }}
              >
                <td className="product-name">{comparison.productName}</td>
                <td className="sku">{comparison.internalSku}</td>
                <td className="our-price">{formatPrice(comparison.ourPrice, 'USD')}</td>
                
                {competitorNames.map(competitorName => {
                  const competitorPrice = comparison.competitorPrices.find(
                    cp => cp.competitorName === competitorName
                  );
                  
                  if (!competitorPrice) {
                    return <td key={competitorName} className="no-data">—</td>;
                  }

                  return (
                    <td key={competitorName} className="competitor-price">
                      <div className="price-cell">
                        <span className="price">{formatPrice(competitorPrice.price, 'USD')}</span>
                        <span className={`difference ${getDifferenceClass(competitorPrice.difference)}`}>
                          {getDifferenceText(competitorPrice.difference)}
                        </span>
                      </div>
                    </td>
                  );
                })}
                
                <td className="stats">
                  <span className="stat-item">{formatPrice(comparison.minCompetitorPrice, 'USD')}</span>
                  {' / '}
                  <span className="stat-item">{formatPrice(comparison.avgCompetitorPrice, 'USD')}</span>
                  {' / '}
                  <span className="stat-item">{formatPrice(comparison.maxCompetitorPrice, 'USD')}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default PriceComparisonTable;

