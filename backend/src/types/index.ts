// Core TypeScript types for the price intelligence system

export interface Competitor {
  id: string;
  name: string;
  baseUrl: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  internalSku: string;
  name: string;
  ourPrice: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductMapping {
  id: string;
  productId: string;
  competitorId: string;
  productUrl: string;
  selectors?: SelectorConfig;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SelectorConfig {
  priceSelector?: string;
  nameSelector?: string;
  discountSelector?: string;
  availabilitySelector?: string;
}

export interface PriceSnapshot {
  id: string;
  productId: string;
  competitorId: string;
  price: number;
  currency: string;
  discountInfo?: string;
  productName?: string;
  capturedAt: Date;
}

export interface ScrapeLog {
  id: string;
  status: 'success' | 'partial' | 'failed';
  totalMappings: number;
  successCount: number;
  failureCount: number;
  errorDetails?: Array<{ mappingId: string; error: string }>;
  startedAt: Date;
  completedAt?: Date;
  runtime?: number;
}

// Scraping result types
export interface ScrapeResult {
  success: boolean;
  price?: number;
  currency?: string;
  productName?: string;
  discountInfo?: string;
  error?: string;
}

// Analytics types
export interface CompetitorPriceComparison {
  productId: string;
  productName: string;
  internalSku: string;
  ourPrice: number;
  competitorPrices: Array<{
    competitorId: string;
    competitorName: string;
    price: number;
    difference: number; // percentage
    lastUpdated: Date;
  }>;
  minCompetitorPrice: number;
  maxCompetitorPrice: number;
  avgCompetitorPrice: number;
}

export interface PriceHistoryPoint {
  date: Date;
  price: number;
  competitorId: string;
  competitorName: string;
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
  detectedAt: Date;
}

export interface DashboardSummary {
  comparisons: CompetitorPriceComparison[];
  alerts: Alert[];
  lastScrapeTime?: Date;
}

// Request/Response types for API validation
export interface CreateCompetitorRequest {
  name: string;
  baseUrl: string;
  notes?: string;
}

export interface UpdateCompetitorRequest {
  name?: string;
  baseUrl?: string;
  notes?: string;
}

export interface CreateProductRequest {
  internalSku: string;
  name: string;
  ourPrice: number;
  currency?: string;
}

export interface UpdateProductRequest {
  internalSku?: string;
  name?: string;
  ourPrice?: number;
  currency?: string;
}

export interface CreateProductMappingRequest {
  productId: string;
  competitorId: string;
  productUrl: string;
  selectors?: SelectorConfig;
  isActive?: boolean;
}

export interface UpdateProductMappingRequest {
  productUrl?: string;
  selectors?: SelectorConfig;
  isActive?: boolean;
}

