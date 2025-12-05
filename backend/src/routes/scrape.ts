// REST API routes for scraping operations
import { Router, Request, Response } from 'express';
import { executeScheduledScrape, isScrapeInProgress, getLastScrapeStatus } from '../services/scheduledScraper';
import { scrapeLogRepository } from '../repositories/scrapeLogRepository';

const router = Router();

// POST /scrape/run - Trigger a manual scrape job with retry logic
router.post('/run', async (req: Request, res: Response) => {
  try {
    console.log('🚀 Manual scrape triggered via API');

    // Check if already running
    if (isScrapeInProgress()) {
      return res.status(409).json({
        error: 'Scrape already in progress',
        message: 'Please wait for the current scrape to complete',
      });
    }
    
    // Execute scrape with retry logic
    const result = await executeScheduledScrape(true); // true = manual trigger
    
    if (result.success) {
      res.json({
        success: true,
        message: result.message,
        logId: result.logId,
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.message,
        logId: result.logId,
      });
    }
  } catch (error) {
    console.error('Error running scrape job:', error);
    res.status(500).json({ 
      error: 'Failed to run scrape job',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /scrape/logs - Get recent scrape logs
router.get('/logs', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const logs = await scrapeLogRepository.findRecent(limit);
    res.json(logs);
  } catch (error) {
    console.error('Error fetching scrape logs:', error);
    res.status(500).json({ error: 'Failed to fetch scrape logs' });
  }
});

// GET /scrape/logs/:id - Get specific scrape log
router.get('/logs/:id', async (req: Request, res: Response) => {
  try {
    const log = await scrapeLogRepository.findById(req.params.id);
    if (!log) {
      return res.status(404).json({ error: 'Scrape log not found' });
    }
    res.json(log);
  } catch (error) {
    console.error('Error fetching scrape log:', error);
    res.status(500).json({ error: 'Failed to fetch scrape log' });
  }
});

// GET /scrape/status - Get current scrape status
router.get('/status', async (req: Request, res: Response) => {
  try {
    const status = await getLastScrapeStatus();
    res.json(status);
  } catch (error) {
    console.error('Error fetching scrape status:', error);
    res.status(500).json({ error: 'Failed to fetch scrape status' });
  }
});

export default router;

