// REST API routes for dashboard data and analytics
import { Router, Request, Response } from 'express';
import {
  getDashboardSummary,
  generatePriceComparisons,
  getPriceHistory,
  generateAlerts,
} from '../services/analyticsService';

const router = Router();

// GET /dashboard/summary - Get complete dashboard summary
router.get('/summary', async (req: Request, res: Response) => {
  try {
    const summary = await getDashboardSummary();
    res.json(summary);
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard summary' });
  }
});

// GET /dashboard/comparisons - Get price comparisons
router.get('/comparisons', async (req: Request, res: Response) => {
  try {
    const comparisons = await generatePriceComparisons();
    res.json(comparisons);
  } catch (error) {
    console.error('Error fetching price comparisons:', error);
    res.status(500).json({ error: 'Failed to fetch price comparisons' });
  }
});

// GET /dashboard/history - Get price history for a product
router.get('/history', async (req: Request, res: Response) => {
  try {
    const productId = req.query.productId as string;
    const days = parseInt(req.query.days as string) || 30;

    if (!productId) {
      return res.status(400).json({ error: 'productId query parameter is required' });
    }

    const history = await getPriceHistory(productId, days);
    res.json(history);
  } catch (error) {
    console.error('Error fetching price history:', error);
    res.status(500).json({ error: 'Failed to fetch price history' });
  }
});

// GET /dashboard/alerts - Get active alerts
router.get('/alerts', async (req: Request, res: Response) => {
  try {
    const alerts = await generateAlerts();
    res.json(alerts);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

export default router;

