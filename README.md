# 🎯 GoRocky Price Intelligence Dashboard

A comprehensive end-to-end price intelligence platform for tracking competitor prices, analyzing trends, and generating actionable insights.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Demo Workflow](#demo-workflow)
- [API Documentation](#api-documentation)
- [Extensibility](#extensibility)
- [Best Practices](#best-practices)

## 🎉 Overview

GoRocky Price Intelligence Dashboard enables businesses to:
- Track competitor prices across multiple e-commerce platforms
- Store historical price data for trend analysis
- Generate automated alerts when significant price changes occur
- Visualize price comparisons and trends through an intuitive dashboard
- Make data-driven pricing decisions with suggested actions

## ✨ Features

### Backend (Node.js + TypeScript + Express)
- ✅ RESTful API with full CRUD operations
- ✅ PostgreSQL database with Prisma ORM
- ✅ Mock scraper for testing (with Playwright/Cheerio support for real scraping)
- ✅ Analytics engine with automated alert generation
- ✅ Price history tracking and comparison
- ✅ Audit logging for scrape operations

### Frontend (React + Vite + TypeScript)
- ✅ Real-time price comparison dashboard
- ✅ Interactive charts showing price history
- ✅ Alert panel with suggested actions
- ✅ Configuration interface for managing competitors, products, and mappings
- ✅ Modern, responsive UI optimized for executive decision-making

### Analytics & Alerts
- **Price Comparison**: Compare your prices vs all competitors
- **Big Drop Alert**: Detects when a competitor drops price by >10%
- **Cheaper Than Us Alert**: Flags when competitors are significantly cheaper
- **Suggested Actions**: AI-generated recommendations for pricing adjustments

## 🛠 Tech Stack

**Backend:**
- Node.js 20+
- TypeScript
- Express.js
- Prisma ORM
- PostgreSQL
- Playwright (for JS-heavy sites)
- Cheerio (for HTML parsing)

**Frontend:**
- React 18
- Vite
- TypeScript
- Recharts (data visualization)
- Axios (API calls)

## 📁 Project Structure

```
bounty/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          # Database schema
│   ├── src/
│   │   ├── db/
│   │   │   └── client.ts          # Prisma client singleton
│   │   ├── repositories/          # Data access layer
│   │   │   ├── competitorRepository.ts
│   │   │   ├── productRepository.ts
│   │   │   ├── productMappingRepository.ts
│   │   │   ├── priceSnapshotRepository.ts
│   │   │   └── scrapeLogRepository.ts
│   │   ├── services/              # Business logic
│   │   │   ├── scraperService.ts      # Mock & real scrapers
│   │   │   ├── analyticsService.ts    # Analytics & alerts
│   │   │   └── scrapeOrchestrator.ts  # Scrape job orchestration
│   │   ├── routes/                # API endpoints
│   │   │   ├── competitors.ts
│   │   │   ├── products.ts
│   │   │   ├── productMappings.ts
│   │   │   ├── scrape.ts
│   │   │   └── dashboard.ts
│   │   ├── scripts/               # Utility scripts
│   │   │   ├── seed.ts           # Database seeding
│   │   │   └── scrape.ts         # Standalone scraper
│   │   ├── types/
│   │   │   └── index.ts          # TypeScript types
│   │   └── index.ts              # Express server entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── .env                      # Environment variables
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.ts         # API client & hooks
│   │   ├── components/
│   │   │   ├── Layout.tsx
│   │   │   ├── PriceComparisonTable.tsx
│   │   │   ├── AlertsPanel.tsx
│   │   │   ├── PriceHistoryChart.tsx
│   │   │   └── config/           # Configuration components
│   │   │       ├── CompetitorsConfig.tsx
│   │   │       ├── ProductsConfig.tsx
│   │   │       └── ProductMappingsConfig.tsx
│   │   ├── pages/
│   │   │   ├── DashboardPage.tsx
│   │   │   └── ConfigPage.tsx
│   │   ├── types.ts              # TypeScript types
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── package.json                   # Root workspace config
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 14+
- npm or yarn

### 1. Install Dependencies

```bash
# Install all dependencies (backend + frontend)
npm install
```

### 2. Configure Database

Create a PostgreSQL database:

```bash
createdb gorocky_price_intelligence
```

Update the `backend/.env` file with your database credentials:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/gorocky_price_intelligence?schema=public"
PORT=3001
NODE_ENV=development
```

### 3. Initialize Database

```bash
# Generate Prisma client and push schema to database
cd backend
npm run setup
```

### 4. Seed Demo Data

```bash
# Populate database with sample competitors, products, and mappings
npm run seed
```

This creates:
- 3 competitors (Amazon, Walmart, Target)
- 5 products (tech accessories)
- 10 product mappings

### 5. Run Initial Scrape

```bash
# Run the scraper to generate price snapshots
npm run scrape
```

### 6. Start the Application

Open two terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Server runs on http://localhost:3001
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# Dashboard runs on http://localhost:5173
```

### 7. Access the Dashboard

Open your browser to: **http://localhost:5173**

## 🎬 Demo Workflow

Follow this workflow to demonstrate the complete system in under 10 minutes:

### Step 1: View Dashboard (2 min)
1. Navigate to **http://localhost:5173/dashboard**
2. Observe:
   - Price comparison table showing your prices vs competitors
   - Active alerts panel highlighting price differences
   - Price history chart for selected product

### Step 2: Configuration (3 min)
1. Click **"Configuration"** in the nav bar
2. Explore the three tabs:
   - **Competitors**: View Amazon, Walmart, Target
   - **Products**: See 5 tech products with SKUs and prices
   - **Product Mappings**: Review links between products and competitor URLs

### Step 3: Add New Data (2 min)
1. Add a new competitor:
   - Name: "Best Buy"
   - Base URL: https://www.bestbuy.com
2. Add a new product:
   - SKU: "HDMI-001"
   - Name: "4K HDMI Cable"
   - Our Price: $19.99
3. Create a mapping between them

### Step 4: Run Scraper (1 min)
1. Return to Dashboard
2. Click **"🔄 Run Scraper"** button
3. Wait for completion notification
4. Click **"↻ Refresh"** to see new data

### Step 5: Analyze Results (2 min)
1. Review updated price comparison table
2. Check for new alerts
3. Click on a product row to view its price history chart
4. Observe suggested actions for price adjustments

## 📚 API Documentation

### Base URL
```
http://localhost:3001/api
```

### Competitors
```http
GET    /api/competitors          # List all competitors
GET    /api/competitors/:id      # Get single competitor
POST   /api/competitors          # Create competitor
PUT    /api/competitors/:id      # Update competitor
DELETE /api/competitors/:id      # Delete competitor
```

### Products
```http
GET    /api/products             # List all products
GET    /api/products/:id         # Get single product
POST   /api/products             # Create product
PUT    /api/products/:id         # Update product
DELETE /api/products/:id         # Delete product
```

### Product Mappings
```http
GET    /api/product-mappings           # List all mappings
GET    /api/product-mappings/active    # List active mappings
GET    /api/product-mappings/:id       # Get single mapping
POST   /api/product-mappings           # Create mapping
PUT    /api/product-mappings/:id       # Update mapping
DELETE /api/product-mappings/:id       # Delete mapping
```

### Scraping
```http
POST   /api/scrape/run                 # Trigger scrape job
       Body: { "useMock": true }
GET    /api/scrape/logs                # Get recent scrape logs
GET    /api/scrape/logs/:id            # Get specific log
```

### Dashboard & Analytics
```http
GET    /api/dashboard/summary          # Get complete dashboard data
GET    /api/dashboard/comparisons      # Get price comparisons
GET    /api/dashboard/history          # Get price history
       Query: ?productId=xxx&days=30
GET    /api/dashboard/alerts           # Get active alerts
```

## 🔧 Extensibility

### 1. Scheduled Scraping

To add automated daily scraping, uncomment and configure in `backend/src/services/scrapeOrchestrator.ts`:

```typescript
import cron from 'node-cron';

export function startScheduledScraping() {
  // Run every day at 2 AM
  cron.schedule('0 2 * * *', async () => {
    console.log('Running scheduled scrape...');
    await runScrapeJob(false);
  });
}

// In backend/src/index.ts
startScheduledScraping();
```

### 2. Alert Delivery

Add email/Slack notifications in `backend/src/services/analyticsService.ts`:

```typescript
// After generating alerts
for (const alert of alerts) {
  // Email notification
  await sendEmail({
    to: 'pricing-team@gorocky.com',
    subject: `Price Alert: ${alert.message}`,
    body: alert.suggestedAction,
  });
  
  // Slack notification
  await postToSlack({
    channel: '#pricing-alerts',
    text: `🚨 ${alert.message}\n💡 ${alert.suggestedAction}`,
  });
}
```

### 3. Real Scraping

To enable real website scraping:

1. Set `USE_MOCK_SCRAPER=false` in `.env`
2. Configure selectors in product mappings
3. For Cheerio (static HTML):
   ```typescript
   selectors: {
     priceSelector: '.product-price',
     nameSelector: 'h1.product-title',
     discountSelector: '.discount-badge'
   }
   ```
4. For Playwright (JS-heavy sites), update `playwrightScrape()` in `scraperService.ts`

### 4. Database Scaling

For production, consider:
- Read replicas for analytics queries
- Partitioning `price_snapshots` table by date
- Adding indexes for common query patterns
- Implementing caching with Redis

## 🔒 Best Practices & Ethical Scraping

### Rate Limiting
- Default: 2 second delay between requests
- Configure via `SCRAPE_RATE_LIMIT_MS` in `.env`
- Respect `robots.txt` directives

### User Agents
- Use descriptive user agents
- Include contact information
- Identify as a price monitoring service

### Legal Compliance
- Review each website's Terms of Service
- Obtain permission where required
- Consider using official APIs when available
- Don't overwhelm target servers

### robots.txt Compliance
Before scraping a domain, check `https://example.com/robots.txt`:

```typescript
// Example robots.txt checker
const canScrape = await checkRobotsTxt(competitorUrl);
if (!canScrape) {
  console.log('Scraping not allowed by robots.txt');
  return;
}
```

## 📊 Database Schema

The system uses 5 main tables:

1. **competitors**: Store competitor information
2. **products**: Your internal product catalog
3. **product_mappings**: Links products to competitor URLs
4. **price_snapshots**: Historical price data
5. **scrape_logs**: Audit trail of scraping operations

See `backend/prisma/schema.prisma` for complete schema definition.

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
pg_isready

# Verify connection string in .env
psql $DATABASE_URL
```

### Port Already in Use
```bash
# Backend (3001)
lsof -ti:3001 | xargs kill -9

# Frontend (5173)
lsof -ti:5173 | xargs kill -9
```

### Prisma Client Issues
```bash
cd backend
npx prisma generate
npx prisma db push
```

## 📝 Scripts Reference

### Root Level
```bash
npm run backend     # Start backend dev server
npm run frontend    # Start frontend dev server
npm run setup       # Initialize database
npm run seed        # Seed demo data
npm run scrape      # Run scraper
```

### Backend
```bash
npm run dev         # Development server with auto-reload
npm run build       # Build for production
npm run start       # Run production build
npm run studio      # Open Prisma Studio (DB GUI)
```

### Frontend
```bash
npm run dev         # Development server
npm run build       # Build for production
npm run preview     # Preview production build
```

## 🎯 Key Decisions & Trade-offs

1. **Mock Scraper by Default**: Allows testing without hitting real websites
2. **Simple Alert Rules**: Easy to understand and extend
3. **No Authentication**: Focus on core functionality (add JWT/OAuth for production)
4. **In-memory Scheduling**: Use external cron or cloud functions for production
5. **Single Currency**: Extend for multi-currency support as needed

## 🚀 Next Steps for Production

- [ ] Add user authentication & authorization
- [ ] Implement API rate limiting
- [ ] Add comprehensive error handling & monitoring
- [ ] Set up CI/CD pipeline
- [ ] Configure production database (managed PostgreSQL)
- [ ] Add comprehensive logging (Winston, Pino)
- [ ] Implement caching layer (Redis)
- [ ] Add unit & integration tests
- [ ] Set up monitoring & alerting (Sentry, DataDog)
- [ ] Implement webhook support for alerts
- [ ] Add export functionality (CSV, Excel)
- [ ] Create admin dashboard for system health

## 📄 License

MIT

## 👥 Contributing

This is a demo project for GoRocky. For questions or improvements, contact the pricing intelligence team.

---

**Built with ❤️ for GoRocky Price Intelligence Team**

