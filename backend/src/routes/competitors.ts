// REST API routes for Competitor management
import { Router, Request, Response } from 'express';
import { competitorRepository } from '../repositories/competitorRepository';
import { CreateCompetitorRequest, UpdateCompetitorRequest } from '../types';

const router = Router();

// GET /competitors - List all competitors
router.get('/', async (req: Request, res: Response) => {
  try {
    const competitors = await competitorRepository.findAll();
    res.json(competitors);
  } catch (error) {
    console.error('Error fetching competitors:', error);
    res.status(500).json({ error: 'Failed to fetch competitors' });
  }
});

// GET /competitors/:id - Get single competitor
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const competitor = await competitorRepository.findById(req.params.id);
    if (!competitor) {
      return res.status(404).json({ error: 'Competitor not found' });
    }
    res.json(competitor);
  } catch (error) {
    console.error('Error fetching competitor:', error);
    res.status(500).json({ error: 'Failed to fetch competitor' });
  }
});

// POST /competitors - Create new competitor
router.post('/', async (req: Request, res: Response) => {
  try {
    const data: CreateCompetitorRequest = req.body;
    
    // Validation
    if (!data.name || !data.baseUrl) {
      return res.status(400).json({ error: 'Name and baseUrl are required' });
    }

    // Check for duplicate name
    const existing = await competitorRepository.findByName(data.name);
    if (existing) {
      return res.status(409).json({ error: 'Competitor with this name already exists' });
    }

    const competitor = await competitorRepository.create(data);
    res.status(201).json(competitor);
  } catch (error) {
    console.error('Error creating competitor:', error);
    res.status(500).json({ error: 'Failed to create competitor' });
  }
});

// PUT /competitors/:id - Update competitor
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const data: UpdateCompetitorRequest = req.body;
    
    // Check if exists
    const existing = await competitorRepository.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Competitor not found' });
    }

    // Check for duplicate name if name is being changed
    if (data.name && data.name !== existing.name) {
      const duplicate = await competitorRepository.findByName(data.name);
      if (duplicate) {
        return res.status(409).json({ error: 'Competitor with this name already exists' });
      }
    }

    const competitor = await competitorRepository.update(req.params.id, data);
    res.json(competitor);
  } catch (error) {
    console.error('Error updating competitor:', error);
    res.status(500).json({ error: 'Failed to update competitor' });
  }
});

// DELETE /competitors/:id - Delete competitor
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await competitorRepository.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Competitor not found' });
    }

    await competitorRepository.delete(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting competitor:', error);
    res.status(500).json({ error: 'Failed to delete competitor' });
  }
});

export default router;

