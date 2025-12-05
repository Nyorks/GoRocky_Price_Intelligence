// TypeScript types for frontend (mirroring backend types)

export interface Competitor {
  id: string;
  name: string;
  baseUrl: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  internalSku: string;
  name: string;
  ourPrice: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductMapping {
  id: string;
  productId: string;
  competitorId: string;
  productUrl: string;
  selectors?: {
    priceSelector?: string;
    nameSelector?: string;
    discountSelector?: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  product?: Product;
  competitor?: Competitor;
}

export interface CompetitorPriceComparison {
  productId: string;
  productName: string;
  internalSku: string;
  ourPrice: number;
  competitorPrices: Array<{
    competitorId: string;
    competitorName: string;
    price: number;
    difference: number;
    lastUpdated: string;
  }>;
  minCompetitorPrice: number;
  maxCompetitorPrice: number;
  avgCompetitorPrice: number;
}

export interface Alert {
  id: string;
  productId: string;
  productName: string;
  competitorId: string;
  competitorName: string;
  alertType: 'big_drop' | 'cheaper_than_us';
  message: string;
  percentage: number;
  suggestedAction: string;
  currentPrice: number;
  previousPrice?: number;
  ourPrice?: number;
  detectedAt: string;
}

export interface PriceHistoryPoint {
  date: string;
  price: number;
  competitorId: string;
  competitorName: string;
}

export interface DashboardSummary {
  comparisons: CompetitorPriceComparison[];
  alerts: Alert[];
  lastScrapeTime?: string;
}

export interface ScrapeRunResult {
  logId: string;
  status: string;
  totalMappings: number;
  successCount: number;
  failureCount: number;
  runtime: number;
  errors: Array<{ mappingId: string; error: string }>;
}

