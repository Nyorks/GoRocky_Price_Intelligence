// API client for backend communication
import axios from 'axios';
import type {
  Competitor,
  Product,
  ProductMapping,
  DashboardSummary,
  PriceHistoryPoint,
  Alert,
  ScrapeRunResult,
} from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Error handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Competitors
export const competitorApi = {
  getAll: () => api.get<Competitor[]>('/competitors').then(res => res.data),
  getById: (id: string) => api.get<Competitor>(`/competitors/${id}`).then(res => res.data),
  create: (data: Omit<Competitor, 'id' | 'createdAt' | 'updatedAt'>) => 
    api.post<Competitor>('/competitors', data).then(res => res.data),
  update: (id: string, data: Partial<Competitor>) => 
    api.put<Competitor>(`/competitors/${id}`, data).then(res => res.data),
  delete: (id: string) => api.delete(`/competitors/${id}`),
};

// Products
export const productApi = {
  getAll: () => api.get<Product[]>('/products').then(res => res.data),
  getById: (id: string) => api.get<Product>(`/products/${id}`).then(res => res.data),
  create: (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => 
    api.post<Product>('/products', data).then(res => res.data),
  update: (id: string, data: Partial<Product>) => 
    api.put<Product>(`/products/${id}`, data).then(res => res.data),
  delete: (id: string) => api.delete(`/products/${id}`),
};

// Product Mappings
export const productMappingApi = {
  getAll: () => api.get<ProductMapping[]>('/product-mappings').then(res => res.data),
  getActive: () => api.get<ProductMapping[]>('/product-mappings/active').then(res => res.data),
  getById: (id: string) => api.get<ProductMapping>(`/product-mappings/${id}`).then(res => res.data),
  create: (data: Omit<ProductMapping, 'id' | 'createdAt' | 'updatedAt' | 'product' | 'competitor'>) => 
    api.post<ProductMapping>('/product-mappings', data).then(res => res.data),
  update: (id: string, data: Partial<ProductMapping>) => 
    api.put<ProductMapping>(`/product-mappings/${id}`, data).then(res => res.data),
  delete: (id: string) => api.delete(`/product-mappings/${id}`),
};

// Dashboard & Analytics
export const dashboardApi = {
  getSummary: () => api.get<DashboardSummary>('/dashboard/summary').then(res => res.data),
  getHistory: (productId: string, days = 30) => 
    api.get<PriceHistoryPoint[]>('/dashboard/history', { params: { productId, days } }).then(res => res.data),
  getAlerts: () => api.get<Alert[]>('/dashboard/alerts').then(res => res.data),
};

// Scraping
export const scrapeApi = {
  run: (useMock = true) => 
    api.post<ScrapeRunResult>('/scrape/run', { useMock }).then(res => res.data),
  getStatus: () =>
    api.get('/scrape/status').then(res => res.data),
  getLogs: (limit = 10) =>
    api.get('/scrape/logs', { params: { limit } }).then(res => res.data),
};

// Schedule Configuration
export const scheduleApi = {
  getConfig: () => api.get('/schedule/config').then(res => res.data),
  updateConfig: (data: {
    isEnabled?: boolean;
    cronExpression?: string;
    maxRetries?: number;
    retryDelayMs?: number;
    description?: string;
  }) => api.put('/schedule/config', data).then(res => res.data),
  enable: () => api.post('/schedule/enable').then(res => res.data),
  disable: () => api.post('/schedule/disable').then(res => res.data),
};

export default api;

