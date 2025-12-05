# 🏗 Architecture Overview

This document provides a comprehensive overview of the GoRocky Price Intelligence Dashboard architecture, design decisions, and implementation details.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (React)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │  Dashboard   │  │    Config    │  │  Price History  │  │
│  │     Page     │  │     Page     │  │     Charts      │  │
│  └──────────────┘  └──────────────┘  └─────────────────┘  │
│                         ↓ HTTP/REST                          │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                   Backend API (Express)                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                    API Routes                         │  │
│  │  /competitors  /products  /mappings  /scrape  /dashboard │
│  └──────────────────────────────────────────────────────┘  │
│                           ↓                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │   Services   │  │ Repositories │  │   Scraper       │  │
│  │  (Business   │  │   (Data      │  │   Engine        │  │
│  │   Logic)     │  │   Access)    │  │                 │  │
│  └──────────────┘  └──────────────┘  └─────────────────┘  │
│                           ↓                                  │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                   Database (PostgreSQL)                      │
│  ┌─────────────┐ ┌──────────┐ ┌───────────┐ ┌────────────┐│
│  │ Competitors │ │ Products │ │  Mappings │ │ Snapshots  ││
│  └─────────────┘ └──────────┘ └───────────┘ └────────────┘│
└─────────────────────────────────────────────────────────────┘
```

## Data Model

### Core Entities

#### 1. Competitor
Represents a competitor we're tracking.
```typescript
{
  id: string
  name: string              // "Amazon", "Walmart"
  baseUrl: string           // "https://www.amazon.com"
  notes?: string            // Additional context
  createdAt: DateTime
  updatedAt: DateTime
}
```

#### 2. Product
Our internal product catalog.
```typescript
{
  id: string
  internalSku: string       // "MOUSE-WL-001"
  name: string              // "Wireless Mouse"
  ourPrice: number          // 29.99
  currency: string          // "USD"
  createdAt: DateTime
  updatedAt: DateTime
}
```

#### 3. ProductMapping
Links products to competitor URLs for tracking.
```typescript
{
  id: string
  productId: string         // FK to Product
  competitorId: string      // FK to Competitor
  productUrl: string        // Full URL to competitor's product
  selectors?: {             // CSS selectors for scraping
    priceSelector: string
    nameSelector: string
    discountSelector: string
  }
  isActive: boolean         // Include in scraping?
  createdAt: DateTime
  updatedAt: DateTime
}
```

#### 4. PriceSnapshot
Historical price data points.
```typescript
{
  id: string
  productId: string         // FK to Product
  competitorId: string      // FK to Competitor
  price: number             // Captured price
  currency: string          // "USD"
  discountInfo?: string     // "20% off", etc.
  productName?: string      // Competitor's product name
  capturedAt: DateTime      // When scraped
}
```

#### 5. ScrapeLog
Audit trail of scraping operations.
```typescript
{
  id: string
  status: string            // "success", "partial", "failed"
  totalMappings: number
  successCount: number
  failureCount: number
  errorDetails?: Array<{mappingId, error}>
  startedAt: DateTime
  completedAt?: DateTime
  runtime?: number          // milliseconds
}
```

## Backend Architecture

### Layer Structure

```
┌─────────────────────────────────────────┐
│           API Routes Layer              │
│  (HTTP request handling, validation)    │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│         Services Layer                  │
│  (Business logic, orchestration)        │
│  - Analytics Service                    │
│  - Scraper Service                      │
│  - Scrape Orchestrator                  │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│       Repository Layer                  │
│  (Data access abstraction)              │
│  - Competitor Repository                │
│  - Product Repository                   │
│  - Mapping Repository                   │
│  - Snapshot Repository                  │
│  - Log Repository                       │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│         Prisma ORM                      │
│  (Type-safe database queries)           │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│         PostgreSQL                      │
└─────────────────────────────────────────┘
```

### Key Design Patterns

#### Repository Pattern
Abstracts database operations:
```typescript
// repositories/productRepository.ts
export const productRepository = {
  create: (data) => prisma.product.create({ data }),
  findAll: () => prisma.product.findMany(),
  findById: (id) => prisma.product.findUnique({ where: { id } }),
  update: (id, data) => prisma.product.update({ where: { id }, data }),
  delete: (id) => prisma.product.delete({ where: { id } }),
};
```

#### Service Layer Pattern
Encapsulates business logic:
```typescript
// services/analyticsService.ts
export async function generateAlerts(): Promise<Alert[]> {
  const products = await productRepository.findAll();
  const alerts = [];
  
  for (const product of products) {
    // Complex business logic here
    if (competitorPriceDrop > threshold) {
      alerts.push(createAlert(...));
    }
  }
  
  return alerts;
}
```

#### Strategy Pattern (Scrapers)
Multiple scraping strategies:
```typescript
// services/scraperService.ts
export async function scrape(url, selectors, price, useMock) {
  if (useMock) return mockScrape(url, price);
  if (isJavaScriptHeavy(url)) return playwrightScrape(url, selectors);
  return cheerioScrape(url, selectors);
}
```

## Frontend Architecture

### Component Hierarchy

```
App
├── Layout
│   ├── Navbar
│   └── Main Content
│       ├── DashboardPage
│       │   ├── PriceComparisonTable
│       │   ├── AlertsPanel
│       │   └── PriceHistoryChart
│       └── ConfigPage
│           ├── CompetitorsConfig
│           ├── ProductsConfig
│           └── ProductMappingsConfig
```

### State Management

**Approach**: Local component state with React hooks

- Each page manages its own data fetching
- API client layer centralizes backend communication
- No global state management needed for this scale

```typescript
// Example: DashboardPage
const [summary, setSummary] = useState<DashboardSummary | null>(null);

useEffect(() => {
  loadDashboard();
}, []);

const loadDashboard = async () => {
  const data = await dashboardApi.getSummary();
  setSummary(data);
};
```

### API Client Layer

Centralized API communication:
```typescript
// api/client.ts
export const dashboardApi = {
  getSummary: () => api.get('/dashboard/summary'),
  getHistory: (productId, days) => api.get('/dashboard/history', { params }),
  getAlerts: () => api.get('/dashboard/alerts'),
};
```

## Scraping Pipeline

### Mock Scraper (Default)

For testing without real websites:
```typescript
async function mockScrape(url, ourPrice) {
  // Simulate network delay
  await delay(500 + Math.random() * 1000);
  
  // Generate realistic price variation (-30% to +20%)
  const competitorPrice = ourPrice * (1 + (-0.3 + Math.random() * 0.5));
  
  // Random discount (30% chance)
  const discountInfo = Math.random() < 0.3 ? '10% off' : null;
  
  return { success: true, price: competitorPrice, discountInfo };
}
```

### Real Scrapers

#### Cheerio (Static HTML)
```typescript
async function cheerioScrape(url, selectors) {
  const response = await fetch(url);
  const html = await response.text();
  const $ = cheerio.load(html);
  
  const price = $(selectors.priceSelector).text();
  const name = $(selectors.nameSelector).text();
  
  return { success: true, price: parsePrice(price), name };
}
```

#### Playwright (JavaScript-heavy sites)
```typescript
async function playwrightScrape(url, selectors) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto(url, { waitUntil: 'networkidle' });
  
  const price = await page.locator(selectors.priceSelector).textContent();
  
  await browser.close();
  return { success: true, price: parsePrice(price) };
}
```

## Analytics Engine

### Price Comparison Algorithm

```typescript
// For each product:
for (const product of products) {
  // Get latest snapshot for each competitor
  const latestSnapshots = await getLatestSnapshots(product.id);
  
  // Calculate metrics
  const prices = latestSnapshots.map(s => s.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const avgPrice = prices.reduce((sum, p) => sum + p) / prices.length;
  
  // Calculate percentage differences vs our price
  const differences = prices.map(p => 
    ((p - product.ourPrice) / product.ourPrice) * 100
  );
}
```

### Alert Generation

#### Alert Type 1: Big Price Drop
```typescript
if (competitorSnapshots.length >= 2) {
  const latest = competitorSnapshots[0];
  const previous = competitorSnapshots[1];
  const priceDrop = ((previous.price - latest.price) / previous.price) * 100;
  
  if (priceDrop >= BIG_DROP_THRESHOLD) {
    createAlert({
      type: 'big_drop',
      message: `${competitor} dropped price by ${priceDrop}%`,
      suggestedAction: 'Monitor closely. May be running promotion.',
    });
  }
}
```

#### Alert Type 2: Cheaper Than Us
```typescript
const priceDiff = ((ourPrice - competitorPrice) / ourPrice) * 100;

if (priceDiff >= CHEAPER_THRESHOLD) {
  const suggestedDiscount = Math.min(Math.round(priceDiff / 2), 15);
  
  createAlert({
    type: 'cheaper_than_us',
    message: `${competitor} is ${priceDiff}% cheaper`,
    suggestedAction: `Consider ${suggestedDiscount}% discount`,
  });
}
```

## Security Considerations

### Current Implementation (Demo)
- ❌ No authentication
- ❌ No rate limiting
- ❌ No input sanitization
- ✅ CORS enabled for development
- ✅ Environment variables for config

### Production Recommendations

#### 1. Authentication
```typescript
// Add JWT authentication
app.use('/api', authenticateJWT);

function authenticateJWT(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  
  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ error: 'Forbidden' });
    req.user = user;
    next();
  });
}
```

#### 2. Rate Limiting
```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

app.use('/api', limiter);
```

#### 3. Input Validation
```typescript
import { z } from 'zod';

const createProductSchema = z.object({
  internalSku: z.string().min(1).max(50),
  name: z.string().min(1).max(200),
  ourPrice: z.number().positive(),
  currency: z.enum(['USD', 'EUR', 'GBP']),
});

// In route handler
const validated = createProductSchema.parse(req.body);
```

## Performance Optimizations

### Database Indexing
```sql
-- Already indexed in Prisma schema
CREATE INDEX idx_snapshots_product_competitor_captured 
  ON price_snapshots(product_id, competitor_id, captured_at);
  
CREATE UNIQUE INDEX idx_competitors_name 
  ON competitors(name);
  
CREATE UNIQUE INDEX idx_products_sku 
  ON products(internal_sku);
```

### Query Optimization
```typescript
// Use includes for eager loading
const mappings = await prisma.productMapping.findMany({
  include: {
    product: true,
    competitor: true,
  },
});

// Use select for specific fields
const products = await prisma.product.findMany({
  select: {
    id: true,
    name: true,
    ourPrice: true,
  },
});
```

### Caching Strategy (Future)
```typescript
// Redis caching for dashboard summary
const cachedSummary = await redis.get('dashboard:summary');
if (cachedSummary) return JSON.parse(cachedSummary);

const summary = await generateDashboardSummary();
await redis.set('dashboard:summary', JSON.stringify(summary), 'EX', 300); // 5 min TTL
```

## Testing Strategy

### Unit Tests (Not Implemented)
```typescript
// Example unit test structure
describe('analyticsService', () => {
  describe('generateAlerts', () => {
    it('should generate big drop alert when price drops >10%', async () => {
      // Arrange
      const mockProduct = createMockProduct({ ourPrice: 100 });
      const mockSnapshots = [
        { price: 80, capturedAt: new Date() },
        { price: 100, capturedAt: new Date(Date.now() - 86400000) },
      ];
      
      // Act
      const alerts = await generateAlerts();
      
      // Assert
      expect(alerts).toHaveLength(1);
      expect(alerts[0].alertType).toBe('big_drop');
      expect(alerts[0].percentage).toBe(20);
    });
  });
});
```

### Integration Tests (Not Implemented)
```typescript
// Example API integration test
describe('POST /api/competitors', () => {
  it('should create a new competitor', async () => {
    const response = await request(app)
      .post('/api/competitors')
      .send({
        name: 'Test Competitor',
        baseUrl: 'https://example.com',
      });
    
    expect(response.status).toBe(201);
    expect(response.body.name).toBe('Test Competitor');
  });
});
```

## Deployment Architecture

### Development
```
┌──────────────┐         ┌──────────────┐
│   Frontend   │         │   Backend    │
│  localhost   │ ──────→ │  localhost   │
│    :5173     │         │    :3001     │
└──────────────┘         └──────────────┘
                                ↓
                         ┌──────────────┐
                         │  PostgreSQL  │
                         │  localhost   │
                         │    :5432     │
                         └──────────────┘
```

### Production (Recommended)
```
┌─────────────────────────────────────────────┐
│           Vercel / Netlify (Frontend)        │
│           https://gorocky.com                │
└─────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────┐
│        Heroku / Railway (Backend API)        │
│        https://api.gorocky.com               │
└─────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────┐
│      Supabase / RDS (PostgreSQL)             │
└─────────────────────────────────────────────┘
```

## Monitoring & Observability

### Logging Strategy
```typescript
// Structured logging with Winston
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

// Usage
logger.info('Scrape job started', {
  totalMappings: 10,
  useMock: true,
});
```

### Metrics to Track
- Scrape success rate
- Average scrape duration
- API response times
- Alert generation frequency
- Database query performance
- Error rates by endpoint

## Future Enhancements

### High Priority
1. **Authentication & Authorization**: JWT-based auth
2. **Real-time Updates**: WebSocket for live price updates
3. **Export Functionality**: CSV/Excel downloads
4. **Email Notifications**: Alert delivery via email
5. **Advanced Filtering**: Filter dashboard by date range, product, competitor

### Medium Priority
6. **Multi-currency Support**: Handle different currencies
7. **Batch Operations**: Bulk import/export
8. **API Documentation**: Swagger/OpenAPI spec
9. **Mobile Responsive**: Optimize for mobile devices
10. **Dashboard Customization**: User preferences for charts/alerts

### Low Priority
11. **Machine Learning**: Price prediction models
12. **Competitor Discovery**: Auto-discover competitor products
13. **Price Optimization**: Suggest optimal prices
14. **Market Analysis**: Industry benchmarking
15. **Integration APIs**: Shopify, WooCommerce, etc.

## Conclusion

This architecture provides a solid foundation for a price intelligence platform. The separation of concerns, type safety, and scalable structure make it easy to extend and maintain as requirements evolve.

**Key Strengths:**
- ✅ Clear separation of layers
- ✅ Type-safe throughout (TypeScript + Prisma)
- ✅ Modular and testable
- ✅ Easy to understand and modify
- ✅ Production-ready structure

**Areas for Improvement:**
- Authentication & security
- Comprehensive error handling
- Testing coverage
- Performance optimization
- Monitoring & logging

---

**Document Version**: 1.0  
**Last Updated**: December 2024

