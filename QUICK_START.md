# 🚀 Quick Start Guide

Get the GoRocky Price Intelligence Dashboard running in under 10 minutes!

## Prerequisites Check

```bash
# Check Node.js version (need 20+)
node --version

# Check PostgreSQL
psql --version

# Check if PostgreSQL is running
pg_isready
```

## Step-by-Step Setup

### 1. Create Database

```bash
# Create the database
createdb gorocky_price_intelligence

# Or using psql
psql postgres
CREATE DATABASE gorocky_price_intelligence;
\q
```

### 2. Install Dependencies

```bash
# From the project root
npm install
```

### 3. Configure Environment

The backend `.env` file should already exist with default settings. If not, create it:

```bash
cd backend
cp .env.example .env
# Edit DATABASE_URL if your PostgreSQL credentials are different
```

### 4. Initialize Database

```bash
cd backend
npm run setup
```

You should see:
```
✔ Generated Prisma Client
✔ Database schema pushed successfully
```

### 5. Seed Demo Data

```bash
npm run seed
```

You should see:
```
🌱 Seeding database...
✓ Created 3 competitors
✓ Created 5 products
✓ Created 10 product mappings
✅ Database seeded successfully!
```

### 6. Run Initial Scrape

```bash
npm run scrape
```

You should see:
```
🔍 Starting scrape job...
📝 Using MOCK scraper
✓ Success: Amazon - $25.99
✓ Success: Walmart - $27.50
...
✅ Scrape job completed!
```

### 7. Start Backend Server

```bash
# In the backend directory
npm run dev
```

You should see:
```
╔════════════════════════════════════════════════════════╗
║   🚀 GoRocky Price Intelligence API                   ║
║   Server running on: http://localhost:3001            ║
╚════════════════════════════════════════════════════════╝
```

### 8. Start Frontend (New Terminal)

Open a **new terminal window**:

```bash
cd frontend
npm run dev
```

You should see:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

### 9. Open Dashboard

Open your browser to: **http://localhost:5173**

You should see:
- ✅ Price comparison table with 5 products
- ✅ Alerts panel showing price differences
- ✅ Interactive price history charts

## Quick Test Workflow

1. **View Dashboard** → See price comparisons and alerts
2. **Click Configuration** → View competitors, products, mappings
3. **Add a new product** → Test CRUD operations
4. **Click "Run Scraper"** → Generate new price data
5. **Refresh Dashboard** → See updated comparisons

## Troubleshooting

### Database Connection Failed
```bash
# Check PostgreSQL is running
brew services start postgresql@14  # macOS
sudo systemctl start postgresql    # Linux

# Test connection
psql -U postgres -d gorocky_price_intelligence
```

### Port Already in Use
```bash
# Kill process on port 3001 (backend)
lsof -ti:3001 | xargs kill -9

# Kill process on port 5173 (frontend)
lsof -ti:5173 | xargs kill -9
```

### Prisma Issues
```bash
cd backend
rm -rf node_modules
npm install
npx prisma generate
npx prisma db push
```

### Frontend Build Errors
```bash
cd frontend
rm -rf node_modules
npm install
```

## API Testing

Test the API directly:

```bash
# Health check
curl http://localhost:3001/health

# Get all competitors
curl http://localhost:3001/api/competitors

# Get dashboard summary
curl http://localhost:3001/api/dashboard/summary
```

## Next Steps

- Explore the **Configuration** page to add more data
- Run the scraper multiple times to build price history
- Click on products in the comparison table to view their charts
- Check out `README.md` for detailed documentation

## Need Help?

- Check the main `README.md` for detailed documentation
- Review API endpoints in the "API Documentation" section
- Look at the code comments for implementation details

---

**Happy tracking! 🎯**

