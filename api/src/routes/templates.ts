import express from 'express';
import {PrismaClient} from '@prisma/client';
const prisma = new PrismaClient();
const router = express.Router();

// List all templates for the current user
router.get('/templates', async (req, res) => {
  const userId = (req as any).userId as string;

  try {
    const templates = await prisma.template.findMany({
      where: {userId},
      orderBy: {createdAt: 'desc'},
    });

    res.json(templates);
  } catch (error) {
    console.error('Failed to fetch templates:', error);
    res.status(500).json({error: 'Failed to fetch templates'});
  }
});

// Create a new template
router.post('/templates', async (req, res) => {
  const userId = (req as any).userId as string;
  const {name, body} = req.body ?? {};

  if (!name || !body) {
    return res.status(400).json({error: 'name and body required'});
  }

  try {
    const template = await prisma.template.create({
      data: {
        userId,
        name,
        body,
      },
    });

    res.status(201).json(template);
  } catch (error) {
    console.error('Failed to create template:', error);
    res.status(500).json({error: 'Failed to create template'});
  }
});

// Update a template
router.patch('/templates/:id', async (req, res) => {
  const userId = (req as any).userId as string;
  const {id} = req.params;
  const patch = req.body ?? {};

  try {
    const existing = await prisma.template.findUnique({where: {id}});
    if (!existing || existing.userId !== userId) {
      return res.status(404).json({error: 'not found'});
    }

    const template = await prisma.template.update({
      where: {id},
      data: patch,
    });

    res.json(template);
  } catch (error) {
    console.error('Failed to update template:', error);
    res.status(500).json({error: 'Failed to update template'});
  }
});

// Delete a template
router.delete('/templates/:id', async (req, res) => {
  const userId = (req as any).userId as string;
  const {id} = req.params;

  try {
    const existing = await prisma.template.findUnique({where: {id}});
    if (!existing || existing.userId !== userId) {
      return res.status(404).json({error: 'not found'});
    }

    await prisma.template.delete({where: {id}});
    res.status(204).end();
  } catch (error) {
    console.error('Failed to delete template:', error);
    res.status(500).json({error: 'Failed to delete template'});
  }
});

export default router;
