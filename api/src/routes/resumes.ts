import express from 'express';
import {PrismaClient} from '@prisma/client';
const prisma = new PrismaClient();
const router = express.Router();

// List all resumes for the current user
router.get('/resumes', async (req, res) => {
  const userId = (req as any).userId as string;

  try {
    const resumes = await prisma.resume.findMany({
      where: {userId},
      orderBy: {createdAt: 'desc'},
      include: {
        applications: {
          select: {
            id: true,
            job: {
              select: {
                title: true,
                company: true,
                status: true,
              },
            },
          },
        },
      },
    });

    res.json(resumes);
  } catch (error) {
    console.error('Failed to fetch resumes:', error);
    res.status(500).json({error: 'Failed to fetch resumes'});
  }
});

// Create a new resume
router.post('/resumes', async (req, res) => {
  const userId = (req as any).userId as string;
  const {name, fileUrl} = req.body ?? {};

  if (!name || !fileUrl) {
    return res.status(400).json({error: 'name and fileUrl required'});
  }

  try {
    const resume = await prisma.resume.create({
      data: {
        userId,
        name,
        fileUrl,
      },
    });

    res.status(201).json(resume);
  } catch (error) {
    console.error('Failed to create resume:', error);
    res.status(500).json({error: 'Failed to create resume'});
  }
});

// Update a resume
router.patch('/resumes/:id', async (req, res) => {
  const userId = (req as any).userId as string;
  const {id} = req.params;
  const patch = req.body ?? {};

  try {
    const existing = await prisma.resume.findUnique({where: {id}});
    if (!existing || existing.userId !== userId) {
      return res.status(404).json({error: 'not found'});
    }

    const resume = await prisma.resume.update({
      where: {id},
      data: patch,
    });

    res.json(resume);
  } catch (error) {
    console.error('Failed to update resume:', error);
    res.status(500).json({error: 'Failed to update resume'});
  }
});

// Delete a resume
router.delete('/resumes/:id', async (req, res) => {
  const userId = (req as any).userId as string;
  const {id} = req.params;

  try {
    const existing = await prisma.resume.findUnique({where: {id}});
    if (!existing || existing.userId !== userId) {
      return res.status(404).json({error: 'not found'});
    }

    await prisma.resume.delete({where: {id}});
    res.status(204).end();
  } catch (error) {
    console.error('Failed to delete resume:', error);
    res.status(500).json({error: 'Failed to delete resume'});
  }
});

export default router;
