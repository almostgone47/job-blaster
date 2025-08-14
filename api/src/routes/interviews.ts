import express from 'express';
import prisma from '../prisma';
const router = express.Router();

// List all interviews for the current user
router.get('/interviews', async (req, res) => {
  const userId = (req as any).userId as string;

  try {
    const interviews = await prisma.interview.findMany({
      where: {userId},
      orderBy: {scheduledAt: 'asc'},
      include: {
        job: {
          select: {
            id: true,
            title: true,
            company: true,
            status: true,
          },
        },
        application: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    });

    res.json(interviews);
  } catch (error) {
    console.error('Failed to fetch interviews:', error);
    res.status(500).json({error: 'Failed to fetch interviews'});
  }
});

// Get interviews for a specific job
router.get('/interviews/job/:jobId', async (req, res) => {
  const userId = (req as any).userId as string;
  const {jobId} = req.params;

  try {
    const interviews = await prisma.interview.findMany({
      where: {
        userId,
        jobId,
      },
      orderBy: {scheduledAt: 'asc'},
      include: {
        job: {
          select: {
            id: true,
            title: true,
            company: true,
            status: true,
          },
        },
        application: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    });

    res.json(interviews);
  } catch (error) {
    console.error('Failed to fetch job interviews:', error);
    res.status(500).json({error: 'Failed to fetch job interviews'});
  }
});

// Create a new interview
router.post('/interviews', async (req, res) => {
  const userId = (req as any).userId as string;
  const {
    jobId,
    applicationId,
    title,
    type,
    scheduledAt,
    duration,
    location,
    participants,
    notes,
    reminderAt,
  } = req.body ?? {};

  if (!jobId || !title || !type || !scheduledAt || !duration) {
    return res.status(400).json({
      error: 'jobId, title, type, scheduledAt, and duration are required',
    });
  }

  try {
    const interview = await prisma.interview.create({
      data: {
        userId,
        jobId,
        applicationId,
        title,
        type,
        scheduledAt: new Date(scheduledAt),
        duration,
        location,
        participants,
        notes,
        reminderAt: reminderAt ? new Date(reminderAt) : undefined,
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            company: true,
            status: true,
          },
        },
      },
    });

    res.status(201).json(interview);
  } catch (error) {
    console.error('Failed to create interview:', error);
    res.status(500).json({error: 'Failed to create interview'});
  }
});

// Update an interview
router.patch('/interviews/:id', async (req, res) => {
  const userId = (req as any).userId as string;
  const {id} = req.params;
  const patch = req.body ?? {};

  try {
    const existing = await prisma.interview.findUnique({where: {id}});
    if (!existing || existing.userId !== userId) {
      return res.status(404).json({error: 'not found'});
    }

    // Convert date strings to Date objects if present
    if (patch.scheduledAt) patch.scheduledAt = new Date(patch.scheduledAt);
    if (patch.reminderAt) patch.reminderAt = new Date(patch.reminderAt);

    const interview = await prisma.interview.update({
      where: {id},
      data: patch,
      include: {
        job: {
          select: {
            id: true,
            title: true,
            company: true,
            status: true,
          },
        },
      },
    });

    res.json(interview);
  } catch (error) {
    console.error('Failed to update interview:', error);
    res.status(500).json({error: 'Failed to update interview'});
  }
});

// Delete an interview
router.delete('/interviews/:id', async (req, res) => {
  const userId = (req as any).userId as string;
  const {id} = req.params;

  try {
    const existing = await prisma.interview.findUnique({where: {id}});
    if (!existing || existing.userId !== userId) {
      return res.status(404).json({error: 'not found'});
    }

    await prisma.interview.delete({where: {id}});
    res.status(204).end();
  } catch (error) {
    console.error('Failed to delete interview:', error);
    res.status(500).json({error: 'Failed to delete interview'});
  }
});

export default router;
