// Repository for ScrapeLog operations
import prisma from '../db/client';

export const scrapeLogRepository = {
  async create(data: {
    status: string;
    totalMappings: number;
    successCount: number;
    failureCount: number;
    errorDetails?: Array<{ mappingId: string; error: string }>;
    isScheduled?: boolean;
    retryCount?: number;
  }) {
    return await prisma.scrapeLog.create({
      data: {
        ...data,
        errorDetails: data.errorDetails ? JSON.stringify(data.errorDetails) : undefined,
        isScheduled: data.isScheduled ?? false,
        retryCount: data.retryCount ?? 0,
      },
    });
  },

  async complete(id: string, runtime: number) {
    return await prisma.scrapeLog.update({
      where: { id },
      data: {
        completedAt: new Date(),
        runtime,
      },
    });
  },

  async findRecent(limit = 10) {
    return await prisma.scrapeLog.findMany({
      orderBy: { startedAt: 'desc' },
      take: limit,
    });
  },

  async findById(id: string) {
    return await prisma.scrapeLog.findUnique({
      where: { id },
    });
  },
};

