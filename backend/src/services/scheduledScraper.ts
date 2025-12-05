/**
 * Scheduled Scraper Service
 * 
 * Wraps the scraping orchestrator with retry logic, error handling,
 * and prevents overlapping runs.
 */

import { runScrapeJob } from './scrapeOrchestrator';
import { scrapeLogRepository } from '../repositories/scrapeLogRepository';
import { scheduleConfigRepository } from '../repositories/scheduleConfigRepository';

// In-memory lock to prevent overlapping scrape runs
let isScrapingInProgress = false;

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Execute a scheduled scrape with retry logic and comprehensive error handling
 */
export async function executeScheduledScrape(isManual = false): Promise<{
  success: boolean;
  logId: string;
  message: string;
}> {
  // Check if scrape is already in progress
  if (isScrapingInProgress) {
    console.log('⏸️  Scrape already in progress, skipping...');
    return {
      success: false,
      logId: '',
      message: 'Scrape already in progress',
    };
  }

  // Get configuration
  const config = await scheduleConfigRepository.getConfig();
  const maxRetries = config.maxRetries;
  const retryDelay = config.retryDelayMs;

  // Set lock
  isScrapingInProgress = true;

  let lastError: Error | null = null;
  let retryCount = 0;

  try {
    // Record the run time
    if (!isManual) {
      await scheduleConfigRepository.recordRun();
    }

    // Attempt scrape with retries
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Scrape attempt ${attempt + 1}/${maxRetries + 1}`);

        // Run the scrape job
        const result = await runScrapeJob(true); // Use mock scraper
        
        // Success!
        console.log(`✅ Scrape completed successfully on attempt ${attempt + 1}`);
        
        return {
          success: true,
          logId: result.logId,
          message: `Scrape completed: ${result.successCount}/${result.totalMappings} successful`,
        };

      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        retryCount = attempt;

        console.error(`❌ Scrape attempt ${attempt + 1} failed:`, lastError.message);

        // If we have retries left, wait and try again
        if (attempt < maxRetries) {
          console.log(`⏳ Waiting ${retryDelay}ms before retry...`);
          await sleep(retryDelay);
        }
      }
    }

    // All retries exhausted
    console.error(`💥 All ${maxRetries + 1} scrape attempts failed`);

    // Create a failed log entry
    const failedLog = await scrapeLogRepository.create({
      status: 'failed',
      totalMappings: 0,
      successCount: 0,
      failureCount: 0,
      errorDetails: [
        {
          mappingId: 'system',
          error: lastError?.message || 'Unknown error after all retries',
        },
      ],
      isScheduled: !isManual,
      retryCount,
    });

    await scrapeLogRepository.complete(failedLog.id, 0);

    return {
      success: false,
      logId: failedLog.id,
      message: `Scrape failed after ${retryCount + 1} attempts: ${lastError?.message}`,
    };

  } finally {
    // Always release the lock
    isScrapingInProgress = false;
  }
}

/**
 * Check if a scrape is currently in progress
 */
export function isScrapeInProgress(): boolean {
  return isScrapingInProgress;
}

/**
 * Get the status of the last scrape
 */
export async function getLastScrapeStatus() {
  const recentLogs = await scrapeLogRepository.findRecent(1);
  const config = await scheduleConfigRepository.getConfig();

  return {
    lastRun: recentLogs[0] || null,
    isEnabled: config.isEnabled,
    schedule: config.cronExpression,
    lastRunAt: config.lastRunAt,
    nextRunAt: config.nextRunAt,
    isInProgress: isScrapingInProgress,
  };
}

