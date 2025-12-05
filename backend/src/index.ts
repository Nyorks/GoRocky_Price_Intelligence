// Main Express server entry point
import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import routes
import competitorsRouter from './routes/competitors';
import productsRouter from './routes/products';
import productMappingsRouter from './routes/productMappings';
import scrapeRouter from './routes/scrape';
import dashboardRouter from './routes/dashboard';
import scheduleRouter from './routes/schedule';

// Import scheduler
import { initializeScheduler, stopScheduler } from './services/scheduler';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req: Request, res: Response, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/competitors', competitorsRouter);
app.use('/api/products', productsRouter);
app.use('/api/product-mappings', productMappingsRouter);
app.use('/api/scrape', scrapeRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/schedule', scheduleRouter);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: any) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Start server
app.listen(PORT, async () => {
  console.log(`
╔════════════════════════════════════════════════════════╗
║                                                        ║
║   🚀 GoRocky Price Intelligence API                   ║
║                                                        ║
║   Server running on: http://localhost:${PORT}        ║
║   Environment: ${process.env.NODE_ENV || 'development'}                              ║
║                                                        ║
║   API Endpoints:                                       ║
║   - GET  /health                                       ║
║   - CRUD /api/competitors                              ║
║   - CRUD /api/products                                 ║
║   - CRUD /api/product-mappings                         ║
║   - POST /api/scrape/run                               ║
║   - GET  /api/dashboard/summary                        ║
║   - GET  /api/schedule/config                          ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
  `);

  // Initialize scheduler (unless disabled via environment variable)
  if (process.env.DISABLE_SCHEDULER !== 'true') {
    await initializeScheduler();
  } else {
    console.log('⚠️  Scheduler disabled via DISABLE_SCHEDULER env variable\n');
  }
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down gracefully...');
  stopScheduler();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down gracefully...');
  stopScheduler();
  process.exit(0);
});

export default app;

