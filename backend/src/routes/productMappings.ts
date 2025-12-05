// REST API routes for ProductMapping management
import { Router, Request, Response } from 'express';
import { productMappingRepository } from '../repositories/productMappingRepository';
import { productRepository } from '../repositories/productRepository';
import { competitorRepository } from '../repositories/competitorRepository';
import { CreateProductMappingRequest, UpdateProductMappingRequest } from '../types';

const router = Router();

// GET /product-mappings - List all mappings
router.get('/', async (req: Request, res: Response) => {
  try {
    const mappings = await productMappingRepository.findAll();
    res.json(mappings);
  } catch (error) {
    console.error('Error fetching product mappings:', error);
    res.status(500).json({ error: 'Failed to fetch product mappings' });
  }
});

// GET /product-mappings/active - List active mappings
router.get('/active', async (req: Request, res: Response) => {
  try {
    const mappings = await productMappingRepository.findActive();
    res.json(mappings);
  } catch (error) {
    console.error('Error fetching active mappings:', error);
    res.status(500).json({ error: 'Failed to fetch active mappings' });
  }
});

// GET /product-mappings/:id - Get single mapping
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const mapping = await productMappingRepository.findById(req.params.id);
    if (!mapping) {
      return res.status(404).json({ error: 'Product mapping not found' });
    }
    res.json(mapping);
  } catch (error) {
    console.error('Error fetching product mapping:', error);
    res.status(500).json({ error: 'Failed to fetch product mapping' });
  }
});

// POST /product-mappings - Create new mapping
router.post('/', async (req: Request, res: Response) => {
  try {
    const data: CreateProductMappingRequest = req.body;
    
    // Validation
    if (!data.productId || !data.competitorId || !data.productUrl) {
      return res.status(400).json({ 
        error: 'productId, competitorId, and productUrl are required' 
      });
    }

    // Validate product exists
    const product = await productRepository.findById(data.productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Validate competitor exists
    const competitor = await competitorRepository.findById(data.competitorId);
    if (!competitor) {
      return res.status(404).json({ error: 'Competitor not found' });
    }

    const mapping = await productMappingRepository.create(data);
    res.status(201).json(mapping);
  } catch (error: any) {
    console.error('Error creating product mapping:', error);
    
    // Handle unique constraint violation
    if (error.code === 'P2002') {
      return res.status(409).json({ 
        error: 'Mapping for this product and competitor already exists' 
      });
    }
    
    res.status(500).json({ error: 'Failed to create product mapping' });
  }
});

// PUT /product-mappings/:id - Update mapping
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const data: UpdateProductMappingRequest = req.body;
    
    // Check if exists
    const existing = await productMappingRepository.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Product mapping not found' });
    }

    const mapping = await productMappingRepository.update(req.params.id, data);
    res.json(mapping);
  } catch (error) {
    console.error('Error updating product mapping:', error);
    res.status(500).json({ error: 'Failed to update product mapping' });
  }
});

// DELETE /product-mappings/:id - Delete mapping
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await productMappingRepository.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Product mapping not found' });
    }

    await productMappingRepository.delete(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting product mapping:', error);
    res.status(500).json({ error: 'Failed to delete product mapping' });
  }
});

export default router;

