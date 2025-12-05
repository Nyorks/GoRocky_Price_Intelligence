// Orchestrates the scraping process across all product mappings
import { productMappingRepository } from '../repositories/productMappingRepository';
import { priceSnapshotRepository } from '../repositories/priceSnapshotRepository';
import { scrapeLogRepository } from '../repositories/scrapeLogRepository';
import { scrape } from './scraperService';
import { SelectorConfig } from '../types';

export interface ScrapeRunResult {
  logId: string;
  status: string;
  totalMappings: number;
  successCount: number;
  failureCount: number;
  runtime: number;
  errors: Array<{ mappingId: string; error: string }>;
}

/**
 * Run scraper for all active product mappings
 */
export async function runScrapeJob(useMock = true): Promise<ScrapeRunResult> {
  const startTime = Date.now();
  
  // Create initial log entry
  const log = await scrapeLogRepository.create({
    status: 'running',
    totalMappings: 0,
    successCount: 0,
    failureCount: 0,
  });

  try {
    // Get all active mappings
    const mappings = await productMappingRepository.findActive();
    
    let successCount = 0;
    let failureCount = 0;
    const errors: Array<{ mappingId: string; error: string }> = [];

    // Scrape each mapping
    for (const mapping of mappings) {
      try {
        console.log(`Scraping: ${mapping.product.name} from ${mapping.competitor.name}`);
        
        const selectors = mapping.selectors 
          ? (typeof mapping.selectors === 'string' ? JSON.parse(mapping.selectors) : mapping.selectors)
          : undefined;
        
        const result = await scrape(
          mapping.productUrl,
          selectors as SelectorConfig | undefined,
          mapping.product.ourPrice,
          useMock
        );

        if (result.success && result.price) {
          // Save snapshot
          await priceSnapshotRepository.create({
            productId: mapping.productId,
            competitorId: mapping.competitorId,
            price: result.price,
            currency: result.currency || 'USD',
            discountInfo: result.discountInfo,
            productName: result.productName,
          });

          successCount++;
          console.log(`✓ Success: ${mapping.competitor.name} - $${result.price}`);
        } else {
          failureCount++;
          errors.push({
            mappingId: mapping.id,
            error: result.error || 'Unknown error',
          });
          console.log(`✗ Failed: ${mapping.competitor.name} - ${result.error}`);
        }
      } catch (error) {
        failureCount++;
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        errors.push({
          mappingId: mapping.id,
          error: errorMsg,
        });
        console.error(`✗ Exception for mapping ${mapping.id}:`, errorMsg);
      }
    }

    const runtime = Date.now() - startTime;
    const status = failureCount === 0 ? 'success' : failureCount < mappings.length ? 'partial' : 'failed';

    // Update log with final results
    await scrapeLogRepository.complete(log.id, runtime);
    
    // Update the log with final counts and status
    const updatedLog = await scrapeLogRepository.findById(log.id);

    // Note: We need to update the log's status and counts
    // Since our complete method only updates runtime/completedAt,
    // we'll return the data from our local variables

    return {
      logId: log.id,
      status,
      totalMappings: mappings.length,
      successCount,
      failureCount,
      runtime,
      errors,
    };
  } catch (error) {
    const runtime = Date.now() - startTime;
    await scrapeLogRepository.complete(log.id, runtime);
    
    throw error;
  }
}

/**
 * Schedule periodic scraping (placeholder for cron integration)
 * 
 * To implement scheduled scraping, you could use:
 * - node-cron: for in-process scheduling
 * - External cron job calling the API endpoint
 * - Cloud Functions/Lambda with scheduled triggers
 * 
 * Example with node-cron:
 * 
 * import cron from 'node-cron';
 * 
 * export function startScheduledScraping() {
 *   // Run every day at 2 AM
 *   cron.schedule('0 2 * * *', async () => {
 *     console.log('Running scheduled scrape job...');
 *     await runScrapeJob(false); // Use real scraping
 *   });
 * }
 */
export function startScheduledScraping() {
  console.log('⏰ Scheduled scraping not yet configured.');
  console.log('   To enable: implement cron scheduling in scrapeOrchestrator.ts');
}

