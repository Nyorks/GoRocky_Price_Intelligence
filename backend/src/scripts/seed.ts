// Seed script to populate the database with demo data
import dotenv from 'dotenv';
dotenv.config();

import { competitorRepository } from '../repositories/competitorRepository';
import { productRepository } from '../repositories/productRepository';
import { productMappingRepository } from '../repositories/productMappingRepository';
import prisma from '../db/client';

async function seed() {
  console.log('🌱 Seeding database...\n');

  try {
    // Clear existing data
    console.log('Clearing existing data...');
    await prisma.priceSnapshot.deleteMany();
    await prisma.scrapeLog.deleteMany();
    await prisma.productMapping.deleteMany();
    await prisma.product.deleteMany();
    await prisma.competitor.deleteMany();
    console.log('✓ Cleared existing data\n');

    // Create competitors
    console.log('Creating competitors...');
    const amazon = await competitorRepository.create({
      name: 'Amazon',
      baseUrl: 'https://www.amazon.com',
      notes: 'Major e-commerce platform',
    });

    const walmart = await competitorRepository.create({
      name: 'Walmart',
      baseUrl: 'https://www.walmart.com',
      notes: 'Large retail competitor',
    });

    const target = await competitorRepository.create({
      name: 'Target',
      baseUrl: 'https://www.target.com',
      notes: 'Retail competitor with strong online presence',
    });
    console.log(`✓ Created ${[amazon, walmart, target].length} competitors\n`);

    // Create products
    console.log('Creating products...');
    const wirelessMouse = await productRepository.create({
      internalSku: 'MOUSE-WL-001',
      name: 'Wireless Ergonomic Mouse',
      ourPrice: 29.99,
      currency: 'USD',
    });

    const mechanicalKeyboard = await productRepository.create({
      internalSku: 'KB-MECH-001',
      name: 'RGB Mechanical Keyboard',
      ourPrice: 89.99,
      currency: 'USD',
    });

    const usbCHub = await productRepository.create({
      internalSku: 'HUB-USBC-001',
      name: 'USB-C Hub 7-in-1',
      ourPrice: 49.99,
      currency: 'USD',
    });

    const webcam = await productRepository.create({
      internalSku: 'CAM-HD-001',
      name: '1080p HD Webcam',
      ourPrice: 79.99,
      currency: 'USD',
    });

    const standingDesk = await productRepository.create({
      internalSku: 'DESK-STAND-001',
      name: 'Electric Standing Desk',
      ourPrice: 399.99,
      currency: 'USD',
    });

    const products = [wirelessMouse, mechanicalKeyboard, usbCHub, webcam, standingDesk];
    console.log(`✓ Created ${products.length} products\n`);

    // Create product mappings (linking products to competitor URLs)
    console.log('Creating product mappings...');
    const mappings = [];

    // Wireless Mouse mappings
    mappings.push(
      await productMappingRepository.create({
        productId: wirelessMouse.id,
        competitorId: amazon.id,
        productUrl: 'https://www.amazon.com/wireless-ergonomic-mouse/dp/B08XYZ123',
        selectors: {
          priceSelector: '.a-price-whole',
          nameSelector: '#productTitle',
          discountSelector: '.savingsPercentage',
        },
        isActive: true,
      })
    );

    mappings.push(
      await productMappingRepository.create({
        productId: wirelessMouse.id,
        competitorId: walmart.id,
        productUrl: 'https://www.walmart.com/ip/wireless-mouse-ergonomic/123456789',
        selectors: {
          priceSelector: '.price-main',
          nameSelector: 'h1.product-name',
        },
        isActive: true,
      })
    );

    mappings.push(
      await productMappingRepository.create({
        productId: wirelessMouse.id,
        competitorId: target.id,
        productUrl: 'https://www.target.com/p/wireless-ergonomic-mouse/-/A-12345678',
        isActive: true,
      })
    );

    // Mechanical Keyboard mappings
    mappings.push(
      await productMappingRepository.create({
        productId: mechanicalKeyboard.id,
        competitorId: amazon.id,
        productUrl: 'https://www.amazon.com/rgb-mechanical-keyboard/dp/B08ABC456',
        isActive: true,
      })
    );

    mappings.push(
      await productMappingRepository.create({
        productId: mechanicalKeyboard.id,
        competitorId: walmart.id,
        productUrl: 'https://www.walmart.com/ip/mechanical-keyboard-rgb/987654321',
        isActive: true,
      })
    );

    // USB-C Hub mappings
    mappings.push(
      await productMappingRepository.create({
        productId: usbCHub.id,
        competitorId: amazon.id,
        productUrl: 'https://www.amazon.com/usb-c-hub-7in1/dp/B08DEF789',
        isActive: true,
      })
    );

    mappings.push(
      await productMappingRepository.create({
        productId: usbCHub.id,
        competitorId: target.id,
        productUrl: 'https://www.target.com/p/usb-c-hub-multiport/-/A-87654321',
        isActive: true,
      })
    );

    // Webcam mappings
    mappings.push(
      await productMappingRepository.create({
        productId: webcam.id,
        competitorId: amazon.id,
        productUrl: 'https://www.amazon.com/1080p-hd-webcam/dp/B08GHI012',
        isActive: true,
      })
    );

    mappings.push(
      await productMappingRepository.create({
        productId: webcam.id,
        competitorId: walmart.id,
        productUrl: 'https://www.walmart.com/ip/hd-webcam-1080p/456789123',
        isActive: true,
      })
    );

    // Standing Desk mappings
    mappings.push(
      await productMappingRepository.create({
        productId: standingDesk.id,
        competitorId: amazon.id,
        productUrl: 'https://www.amazon.com/electric-standing-desk/dp/B08JKL345',
        isActive: true,
      })
    );

    console.log(`✓ Created ${mappings.length} product mappings\n`);

    // Summary
    console.log('═══════════════════════════════════════');
    console.log('✅ Database seeded successfully!');
    console.log('═══════════════════════════════════════');
    console.log(`   Competitors: ${[amazon, walmart, target].length}`);
    console.log(`   Products: ${products.length}`);
    console.log(`   Product Mappings: ${mappings.length}`);
    console.log('═══════════════════════════════════════\n');

    console.log('Next steps:');
    console.log('1. Run the scraper: npm run scrape');
    console.log('2. Start the backend: npm run dev');
    console.log('3. View the dashboard in the frontend\n');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed();

