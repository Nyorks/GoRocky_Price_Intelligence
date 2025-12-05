// Repository for ScheduleConfig operations
import prisma from '../db/client';

export const scheduleConfigRepository = {
  /**
   * Get the active schedule configuration (there should only be one)
   */
  async getConfig() {
    let config = await prisma.scheduleConfig.findFirst();
    
    // Create default config if none exists
    if (!config) {
      config = await prisma.scheduleConfig.create({
        data: {
          isEnabled: false, // Disabled by default in new installations
          cronExpression: '0 3 * * *', // Daily at 3 AM
          maxRetries: 3,
          retryDelayMs: 5000,
          description: 'Daily price scrape at 3:00 AM',
        },
      });
    }
    
    return config;
  },

  /**
   * Update the schedule configuration
   */
  async updateConfig(data: {
    isEnabled?: boolean;
    cronExpression?: string;
    maxRetries?: number;
    retryDelayMs?: number;
    description?: string;
  }) {
    const config = await this.getConfig();
    return await prisma.scheduleConfig.update({
      where: { id: config.id },
      data,
    });
  },

  /**
   * Record when the scheduler last ran
   */
  async recordRun(nextRunAt?: Date) {
    const config = await this.getConfig();
    return await prisma.scheduleConfig.update({
      where: { id: config.id },
      data: {
        lastRunAt: new Date(),
        nextRunAt,
      },
    });
  },

  /**
   * Enable or disable the scheduler
   */
  async setEnabled(isEnabled: boolean) {
    return await this.updateConfig({ isEnabled });
  },
};

