/**
 * Scheduler Service using node-cron
 * 
 * Manages automated scraping jobs based on configuration from the database.
 * 
 * Usage:
 * - Call initializeScheduler() once on server startup
 * - Call updateSchedule() whenever config changes
 * - Call stopScheduler() on graceful shutdown
 */

import cron from 'node-cron';
import { scheduleConfigRepository } from '../repositories/scheduleConfigRepository';
import { executeScheduledScrape } from './scheduledScraper';

let activeTask: cron.ScheduledTask | null = null;

/**
 * Parse cron expression and calculate next run time
 */
function getNextRunTime(cronExpression: string): Date | null {
  try {
    // Create a temporary task to get next execution time
    const tempTask = cron.schedule(cronExpression, () => {}, { scheduled: false });
    
    // node-cron doesn't expose nextDate directly, so we calculate it manually
    // For now, return a placeholder - in production, use a library like cron-parser
    const now = new Date();
    now.setHours(now.getHours() + 1); // Rough estimate
    return now;
  } catch (error) {
    console.error('Invalid cron expression:', error);
    return null;
  }
}

/**
 * Start or restart the scheduler with current configuration
 */
export async function updateSchedule() {
  // Stop existing task if any
  if (activeTask) {
    activeTask.stop();
    activeTask = null;
    console.log('🛑 Stopped existing scheduled task');
  }

  // Get current configuration
  const config = await scheduleConfigRepository.getConfig();

  if (!config.isEnabled) {
    console.log('📅 Scheduler is disabled in configuration');
    return;
  }

  // Validate cron expression
  if (!cron.validate(config.cronExpression)) {
    console.error(`❌ Invalid cron expression: ${config.cronExpression}`);
    return;
  }

  // Calculate next run time
  const nextRun = getNextRunTime(config.cronExpression);
  if (nextRun) {
    await scheduleConfigRepository.updateConfig({ nextRunAt: nextRun });
  }

  // Create and start the scheduled task
  activeTask = cron.schedule(
    config.cronExpression,
    async () => {
      console.log('⏰ Scheduled scrape triggered');
      
      try {
        const result = await executeScheduledScrape(false);
        
        if (result.success) {
          console.log(`✅ Scheduled scrape completed: ${result.message}`);
        } else {
          console.error(`❌ Scheduled scrape failed: ${result.message}`);
        }

        // Update next run time
        const nextRun = getNextRunTime(config.cronExpression);
        if (nextRun) {
          await scheduleConfigRepository.recordRun(nextRun);
        }

      } catch (error) {
        console.error('💥 Unexpected error in scheduled scrape:', error);
      }
    },
    {
      scheduled: true,
      timezone: 'UTC', // Use UTC for consistency
    }
  );

  console.log(`✅ Scheduler started with expression: ${config.cronExpression}`);
  console.log(`   Description: ${config.description || 'No description'}`);
  console.log(`   Next run: ${nextRun?.toISOString() || 'Unknown'}`);
}

/**
 * Initialize the scheduler on server startup
 */
export async function initializeScheduler() {
  console.log('\n🚀 Initializing scheduler...');

  try {
    // Ensure config exists
    await scheduleConfigRepository.getConfig();

    // Start scheduling
    await updateSchedule();

    console.log('✅ Scheduler initialized successfully\n');
  } catch (error) {
    console.error('❌ Failed to initialize scheduler:', error);
  }
}

/**
 * Stop the scheduler (for graceful shutdown)
 */
export function stopScheduler() {
  if (activeTask) {
    activeTask.stop();
    activeTask = null;
    console.log('🛑 Scheduler stopped');
  }
}

/**
 * Get current scheduler status
 */
export function getSchedulerStatus() {
  return {
    isActive: activeTask !== null,
    isRunning: activeTask ? true : false,
  };
}

// ============================================================================
// DEVELOPMENT NOTES
// ============================================================================

/*
 * How to adjust the schedule:
 * 
 * 1. Via API: 
 *    PUT /api/schedule/config
 *    { "cronExpression": "0 * * * *" }  // Every hour
 * 
 * 2. Via Database:
 *    UPDATE schedule_config SET cron_expression = '0 * * * *'
 * 
 * 3. Common cron patterns:
 *    - Every hour: "0 * * * *"
 *    - Every day at 3 AM: "0 3 * * *"
 *    - Every 6 hours: "0 *\/6 * * *"
 *    - Every Monday at 9 AM: "0 9 * * 1"
 *    - Every 15 minutes: "*\/15 * * * *"
 * 
 * How to disable in development:
 * 
 * Option 1: Set isEnabled = false in database
 * Option 2: Set environment variable: DISABLE_SCHEDULER=true
 * Option 3: Comment out initializeScheduler() call in index.ts
 */

