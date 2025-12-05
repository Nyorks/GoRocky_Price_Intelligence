// Repository for PriceSnapshot operations
import prisma from '../db/client';

export const priceSnapshotRepository = {
  async create(data: {
    productId: string;
    competitorId: string;
    price: number;
    currency: string;
    discountInfo?: string;
    productName?: string;
  }) {
    return await prisma.priceSnapshot.create({
      data,
    });
  },

  async findByProduct(productId: string, limit = 100) {
    return await prisma.priceSnapshot.findMany({
      where: { productId },
      include: {
        competitor: true,
      },
      orderBy: { capturedAt: 'desc' },
      take: limit,
    });
  },

  async findByProductAndCompetitor(
    productId: string,
    competitorId: string,
    limit = 30
  ) {
    return await prisma.priceSnapshot.findMany({
      where: { productId, competitorId },
      orderBy: { capturedAt: 'desc' },
      take: limit,
    });
  },

  async findLatestForProduct(productId: string) {
    // Get the latest snapshot for each competitor for this product
    const snapshots = await prisma.priceSnapshot.findMany({
      where: { productId },
      include: {
        competitor: true,
      },
      orderBy: { capturedAt: 'desc' },
    });

    // Group by competitor and take the first (latest) of each
    const latestByCompetitor = new Map();
    for (const snapshot of snapshots) {
      if (!latestByCompetitor.has(snapshot.competitorId)) {
        latestByCompetitor.set(snapshot.competitorId, snapshot);
      }
    }

    return Array.from(latestByCompetitor.values());
  },

  async findLatestForAllProducts() {
    const snapshots = await prisma.priceSnapshot.findMany({
      include: {
        competitor: true,
        product: true,
      },
      orderBy: { capturedAt: 'desc' },
    });

    // Group by product + competitor and take the first (latest) of each
    const latestByProductCompetitor = new Map();
    for (const snapshot of snapshots) {
      const key = `${snapshot.productId}-${snapshot.competitorId}`;
      if (!latestByProductCompetitor.has(key)) {
        latestByProductCompetitor.set(key, snapshot);
      }
    }

    return Array.from(latestByProductCompetitor.values());
  },

  async findInDateRange(startDate: Date, endDate: Date) {
    return await prisma.priceSnapshot.findMany({
      where: {
        capturedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        competitor: true,
        product: true,
      },
      orderBy: { capturedAt: 'asc' },
    });
  },
};

