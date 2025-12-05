// Standalone script to run the scraper
import dotenv from 'dotenv';
dotenv.config();

import { runScrapeJob } from '../services/scrapeOrchestrator';
import prisma from '../db/client';

async function main() {
  console.log('🔍 Starting scrape job...\n');

  try {
    // Use mock scraping by default
    // Set to false to use real scraping (requires valid URLs and selectors)
    const useMock = process.env.USE_MOCK_SCRAPER !== 'false';

    if (useMock) {
      console.log('📝 Using MOCK scraper (generates realistic test data)');
      console.log('   To use real scraping, set USE_MOCK_SCRAPER=false in .env\n');
    }

    const result = await runScrapeJob(useMock);

    console.log('\n═══════════════════════════════════════');
    console.log('✅ Scrape job completed!');
    console.log('═══════════════════════════════════════');
    console.log(`   Status: ${result.status}`);
    console.log(`   Total Mappings: ${result.totalMappings}`);
    console.log(`   Successful: ${result.successCount}`);
    console.log(`   Failed: ${result.failureCount}`);
    console.log(`   Runtime: ${result.runtime}ms`);
    console.log('═══════════════════════════════════════\n');

    if (result.errors.length > 0) {
      console.log('Errors encountered:');
      result.errors.forEach(err => {
        console.log(`  - Mapping ${err.mappingId}: ${err.error}`);
      });
      console.log('');
    }

    console.log('Next steps:');
    console.log('1. Start the backend: npm run dev');
    console.log('2. View the dashboard at http://localhost:5173\n');
  } catch (error) {
    console.error('❌ Error running scrape job:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

