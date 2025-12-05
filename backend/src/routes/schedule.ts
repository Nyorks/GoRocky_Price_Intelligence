// REST API routes for schedule configuration
import { Router, Request, Response } from 'express';
import { scheduleConfigRepository } from '../repositories/scheduleConfigRepository';
import { updateSchedule, getSchedulerStatus } from '../services/scheduler';
import cron from 'node-cron';

const router = Router();

// GET /schedule/config - Get current schedule configuration
router.get('/config', async (req: Request, res: Response) => {
  try {
    const config = await scheduleConfigRepository.getConfig();
    const schedulerStatus = getSchedulerStatus();
    
    res.json({
      ...config,
      schedulerStatus,
    });
  } catch (error) {
    console.error('Error fetching schedule config:', error);
    res.status(500).json({ error: 'Failed to fetch schedule configuration' });
  }
});

// PUT /schedule/config - Update schedule configuration
router.put('/config', async (req: Request, res: Response) => {
  try {
    const { isEnabled, cronExpression, maxRetries, retryDelayMs, description } = req.body;

    // Validate cron expression if provided
    if (cronExpression && !cron.validate(cronExpression)) {
      return res.status(400).json({
        error: 'Invalid cron expression',
        message: 'Please provide a valid cron expression (e.g., "0 3 * * *")',
      });
    }

    // Validate maxRetries if provided
    if (maxRetries !== undefined && (maxRetries < 0 || maxRetries > 10)) {
      return res.status(400).json({
        error: 'Invalid maxRetries',
        message: 'maxRetries must be between 0 and 10',
      });
    }

    // Update configuration
    const updatedConfig = await scheduleConfigRepository.updateConfig({
      isEnabled,
      cronExpression,
      maxRetries,
      retryDelayMs,
      description,
    });

    // Restart scheduler with new config
    await updateSchedule();

    res.json({
      message: 'Schedule configuration updated',
      config: updatedConfig,
    });
  } catch (error) {
    console.error('Error updating schedule config:', error);
    res.status(500).json({ error: 'Failed to update schedule configuration' });
  }
});

// POST /schedule/enable - Enable automated scraping
router.post('/enable', async (req: Request, res: Response) => {
  try {
    await scheduleConfigRepository.setEnabled(true);
    await updateSchedule();
    
    res.json({
      message: 'Automated scraping enabled',
      isEnabled: true,
    });
  } catch (error) {
    console.error('Error enabling scheduler:', error);
    res.status(500).json({ error: 'Failed to enable scheduler' });
  }
});

// POST /schedule/disable - Disable automated scraping
router.post('/disable', async (req: Request, res: Response) => {
  try {
    await scheduleConfigRepository.setEnabled(false);
    await updateSchedule();
    
    res.json({
      message: 'Automated scraping disabled',
      isEnabled: false,
    });
  } catch (error) {
    console.error('Error disabling scheduler:', error);
    res.status(500).json({ error: 'Failed to disable scheduler' });
  }
});

export default router;

