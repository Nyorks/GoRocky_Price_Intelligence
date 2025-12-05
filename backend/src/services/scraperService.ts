// Scraping service with both mock and real implementations
import * as cheerio from 'cheerio';
import { ScrapeResult, SelectorConfig } from '../types';

/**
 * Mock scraper for testing without hitting real websites
 * Returns randomized but realistic price data
 */
export async function mockScrape(
  url: string,
  ourPrice: number
): Promise<ScrapeResult> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

  // Randomly simulate occasional failures
  if (Math.random() < 0.05) {
    return {
      success: false,
      error: 'Simulated network timeout',
    };
  }

  // Generate a price variation around our price (-30% to +20%)
  const priceVariation = -0.3 + Math.random() * 0.5;
  const competitorPrice = Math.round(ourPrice * (1 + priceVariation) * 100) / 100;

  // Random discount info (30% chance)
  const discounts = [
    null,
    null,
    null,
    '10% off',
    '15% off with code SAVE15',
    'Buy 2 Get 1 Free',
    '20% Black Friday Sale',
    'Free Shipping',
  ];
  const discountInfo = discounts[Math.floor(Math.random() * discounts.length)];

  return {
    success: true,
    price: competitorPrice,
    currency: 'USD',
    productName: 'Competitor Product Name',
    discountInfo: discountInfo || undefined,
  };
}

/**
 * Real scraper using Cheerio for simple HTML parsing
 * For JS-heavy sites, you would use Playwright (see playwrightScrape below)
 */
export async function cheerioScrape(
  url: string,
  selectors: SelectorConfig
): Promise<ScrapeResult> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': process.env.SCRAPE_USER_AGENT || 'Mozilla/5.0',
      },
    });

    if (!response.ok) {
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract price
    let price: number | undefined;
    if (selectors.priceSelector) {
      const priceText = $(selectors.priceSelector).first().text().trim();
      // Extract numeric value (handles formats like "$99.99", "99,99 €", etc.)
      const priceMatch = priceText.match(/[\d,]+\.?\d*/);
      if (priceMatch) {
        price = parseFloat(priceMatch[0].replace(',', ''));
      }
    }

    // Extract product name
    let productName: string | undefined;
    if (selectors.nameSelector) {
      productName = $(selectors.nameSelector).first().text().trim();
    }

    // Extract discount info
    let discountInfo: string | undefined;
    if (selectors.discountSelector) {
      const discount = $(selectors.discountSelector).first().text().trim();
      if (discount) {
        discountInfo = discount;
      }
    }

    if (price === undefined) {
      return {
        success: false,
        error: 'Could not extract price from page',
      };
    }

    return {
      success: true,
      price,
      currency: 'USD', // TODO: Extract currency from page
      productName,
      discountInfo,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Playwright scraper for JavaScript-heavy sites
 * Note: Playwright is installed but this is a placeholder implementation
 * Uncomment and configure when needed for real JS-heavy sites
 */
export async function playwrightScrape(
  url: string,
  selectors: SelectorConfig
): Promise<ScrapeResult> {
  try {
    // Uncomment when ready to use Playwright:
    // const { chromium } = await import('playwright');
    // const browser = await chromium.launch({ headless: true });
    // const page = await browser.newPage();
    // 
    // await page.goto(url, { waitUntil: 'networkidle' });
    // 
    // // Extract data using selectors
    // const price = await page.locator(selectors.priceSelector || '').textContent();
    // // ... parse and extract
    // 
    // await browser.close();
    // return { success: true, price: parsedPrice, ... };

    return {
      success: false,
      error: 'Playwright scraper not yet implemented',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Main scraper function that routes to appropriate scraper
 * For demo purposes, uses mock scraper by default
 */
export async function scrape(
  url: string,
  selectors: SelectorConfig | undefined,
  ourPrice: number,
  useMock = true // Set to false to use real scraping
): Promise<ScrapeResult> {
  // Respect rate limiting
  const rateLimitMs = parseInt(process.env.SCRAPE_RATE_LIMIT_MS || '2000', 10);
  await new Promise(resolve => setTimeout(resolve, rateLimitMs));

  if (useMock) {
    return mockScrape(url, ourPrice);
  }

  // For real scraping, choose between Cheerio and Playwright
  // If URL contains known JS-heavy indicators, use Playwright
  const usePlaywright = url.includes('spa') || url.includes('react'); // Naive check
  
  if (usePlaywright) {
    return playwrightScrape(url, selectors || {});
  } else {
    return cheerioScrape(url, selectors || {});
  }
}

