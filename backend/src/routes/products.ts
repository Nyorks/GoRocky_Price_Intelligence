// REST API routes for Product management
import { Router, Request, Response } from 'express';
import { productRepository } from '../repositories/productRepository';
import { CreateProductRequest, UpdateProductRequest } from '../types';

const router = Router();

// GET /products - List all products
router.get('/', async (req: Request, res: Response) => {
  try {
    const products = await productRepository.findAll();
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// GET /products/:id - Get single product
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const product = await productRepository.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// POST /products - Create new product
router.post('/', async (req: Request, res: Response) => {
  try {
    const data: CreateProductRequest = req.body;
    
    // Validation
    if (!data.internalSku || !data.name || data.ourPrice === undefined) {
      return res.status(400).json({ error: 'internalSku, name, and ourPrice are required' });
    }

    if (data.ourPrice < 0) {
      return res.status(400).json({ error: 'ourPrice must be positive' });
    }

    // Check for duplicate SKU
    const existing = await productRepository.findBySku(data.internalSku);
    if (existing) {
      return res.status(409).json({ error: 'Product with this SKU already exists' });
    }

    const product = await productRepository.create(data);
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// PUT /products/:id - Update product
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const data: UpdateProductRequest = req.body;
    
    // Check if exists
    const existing = await productRepository.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Validate price if provided
    if (data.ourPrice !== undefined && data.ourPrice < 0) {
      return res.status(400).json({ error: 'ourPrice must be positive' });
    }

    // Check for duplicate SKU if SKU is being changed
    if (data.internalSku && data.internalSku !== existing.internalSku) {
      const duplicate = await productRepository.findBySku(data.internalSku);
      if (duplicate) {
        return res.status(409).json({ error: 'Product with this SKU already exists' });
      }
    }

    const product = await productRepository.update(req.params.id, data);
    res.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// DELETE /products/:id - Delete product
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await productRepository.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await productRepository.delete(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

export default router;

