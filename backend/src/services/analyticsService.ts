// Analytics and alert logic service
import { productRepository } from '../repositories/productRepository';
import { priceSnapshotRepository } from '../repositories/priceSnapshotRepository';
import {
  CompetitorPriceComparison,
  Alert,
  PriceHistoryPoint,
  DashboardSummary,
} from '../types';

/**
 * Generate comparison data for all products vs competitors
 */
export async function generatePriceComparisons(): Promise<CompetitorPriceComparison[]> {
  const products = await productRepository.findAll();
  const comparisons: CompetitorPriceComparison[] = [];

  for (const product of products) {
    const latestSnapshots = await priceSnapshotRepository.findLatestForProduct(product.id);

    if (latestSnapshots.length === 0) {
      // No competitor data yet
      comparisons.push({
        productId: product.id,
        productName: product.name,
        internalSku: product.internalSku,
        ourPrice: product.ourPrice,
        competitorPrices: [],
        minCompetitorPrice: 0,
        maxCompetitorPrice: 0,
        avgCompetitorPrice: 0,
      });
      continue;
    }

    const competitorPrices = latestSnapshots.map(snapshot => {
      const difference = ((snapshot.price - product.ourPrice) / product.ourPrice) * 100;
      return {
        competitorId: snapshot.competitorId,
        competitorName: snapshot.competitor.name,
        price: snapshot.price,
        difference: Math.round(difference * 100) / 100,
        lastUpdated: snapshot.capturedAt,
      };
    });

    const prices = competitorPrices.map(cp => cp.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;

    comparisons.push({
      productId: product.id,
      productName: product.name,
      internalSku: product.internalSku,
      ourPrice: product.ourPrice,
      competitorPrices,
      minCompetitorPrice: Math.round(minPrice * 100) / 100,
      maxCompetitorPrice: Math.round(maxPrice * 100) / 100,
      avgCompetitorPrice: Math.round(avgPrice * 100) / 100,
    });
  }

  return comparisons;
}

/**
 * Get price history for a specific product
 */
export async function getPriceHistory(
  productId: string,
  days = 30
): Promise<PriceHistoryPoint[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const snapshots = await priceSnapshotRepository.findByProduct(productId, 1000);
  
  // Filter to date range and map to history points
  const historyPoints: PriceHistoryPoint[] = snapshots
    .filter(s => s.capturedAt >= startDate)
    .map(s => ({
      date: s.capturedAt,
      price: s.price,
      competitorId: s.competitorId,
      competitorName: s.competitor.name,
    }));

  return historyPoints.sort((a, b) => a.date.getTime() - b.date.getTime());
}

/**
 * Generate alerts based on price data
 */
export async function generateAlerts(): Promise<Alert[]> {
  const products = await productRepository.findAll();
  const alerts: Alert[] = [];

  const bigDropThreshold = parseFloat(process.env.ALERT_BIG_DROP_THRESHOLD || '10');
  const cheaperThreshold = parseFloat(process.env.ALERT_CHEAPER_THRESHOLD || '10');

  for (const product of products) {
    const snapshots = await priceSnapshotRepository.findByProduct(product.id, 100);
    
    // Group by competitor
    const byCompetitor = new Map<string, typeof snapshots>();
    for (const snapshot of snapshots) {
      if (!byCompetitor.has(snapshot.competitorId)) {
        byCompetitor.set(snapshot.competitorId, []);
      }
      byCompetitor.get(snapshot.competitorId)!.push(snapshot);
    }

    // Check each competitor
    for (const [competitorId, competitorSnapshots] of byCompetitor.entries()) {
      if (competitorSnapshots.length === 0) continue;

      // Sort by date descending (newest first)
      competitorSnapshots.sort((a, b) => b.capturedAt.getTime() - a.capturedAt.getTime());

      const latest = competitorSnapshots[0];
      const competitor = latest.competitor;

      // Alert 1: Big price drop
      if (competitorSnapshots.length >= 2) {
        const previous = competitorSnapshots[1];
        const priceDrop = ((previous.price - latest.price) / previous.price) * 100;

        if (priceDrop >= bigDropThreshold) {
          alerts.push({
            id: `drop-${product.id}-${competitorId}-${latest.capturedAt.getTime()}`,
            productId: product.id,
            productName: product.name,
            competitorId,
            competitorName: competitor.name,
            alertType: 'big_drop',
            message: `${competitor.name} dropped price by ${Math.round(priceDrop)}%`,
            percentage: Math.round(priceDrop * 100) / 100,
            suggestedAction: `Consider monitoring closely. ${competitor.name} may be running a promotion.`,
            currentPrice: latest.price,
            previousPrice: previous.price,
            detectedAt: latest.capturedAt,
          });
        }
      }

      // Alert 2: Competitor is significantly cheaper than us
      const priceDiff = ((product.ourPrice - latest.price) / product.ourPrice) * 100;

      if (priceDiff >= cheaperThreshold) {
        const suggestedDiscount = Math.min(Math.round(priceDiff / 2), 15); // Suggest up to 15% discount
        alerts.push({
          id: `cheaper-${product.id}-${competitorId}-${latest.capturedAt.getTime()}`,
          productId: product.id,
          productName: product.name,
          competitorId,
          competitorName: competitor.name,
          alertType: 'cheaper_than_us',
          message: `${competitor.name} is ${Math.round(priceDiff)}% cheaper than our price`,
          percentage: Math.round(priceDiff * 100) / 100,
          suggestedAction: `Consider lowering price by ${suggestedDiscount}% to stay competitive (new price: $${Math.round(product.ourPrice * (1 - suggestedDiscount / 100) * 100) / 100})`,
          currentPrice: latest.price,
          ourPrice: product.ourPrice,
          detectedAt: latest.capturedAt,
        });
      }
    }
  }

  // Sort by detection time (newest first) and limit to recent alerts
  return alerts.sort((a, b) => b.detectedAt.getTime() - a.detectedAt.getTime()).slice(0, 20);
}

/**
 * Generate dashboard summary with all key metrics
 */
export async function getDashboardSummary(): Promise<DashboardSummary> {
  const comparisons = await generatePriceComparisons();
  const alerts = await generateAlerts();

  // Get last scrape time
  const allSnapshots = await priceSnapshotRepository.findLatestForAllProducts();
  const lastScrapeTime = allSnapshots.length > 0
    ? new Date(Math.max(...allSnapshots.map(s => s.capturedAt.getTime())))
    : undefined;

  return {
    comparisons,
    alerts,
    lastScrapeTime,
  };
}

