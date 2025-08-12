import express from 'express';
import {PrismaClient} from '@prisma/client';
const prisma = new PrismaClient();
const router = express.Router();

/**
 * POST /applications
 * body: { jobId: string, coverNote?: string }
 * - sets appliedAt = now, nextAction = appliedAt + 5 days
 * - updates Job.lastActivityAt
 */
router.post('/applications', async (req, res) => {
  const userId = (req as any).userId as string;
  const {jobId, coverNote} = req.body ?? {};
  if (!jobId) return res.status(400).json({error: 'jobId required'});

  const job = await prisma.job.findUnique({where: {id: jobId}});
  if (!job || job.userId !== userId)
    return res.status(404).json({error: 'job not found'});

  const appliedAt = new Date();
  const nextAction = new Date(appliedAt.getTime() + 5 * 24 * 60 * 60 * 1000);

  const app = await prisma.application.create({
    data: {
      userId,
      jobId,
      coverNote: coverNote ?? null,
      status: 'APPLIED',
      appliedAt,
      nextAction,
      notes: null,
    },
  });

  await prisma.job.update({
    where: {id: jobId},
    data: {status: 'APPLIED', lastActivityAt: new Date()},
  });

  res.status(201).json(app);
});

/**
 * GET /applications?due=today
 * Returns applications whose nextAction is due today (UTC for now).
 * (We’ll later adjust for user TZ.)
 */
router.get('/applications', async (req, res) => {
  const userId = (req as any).userId as string;
  const due = req.query.due as string | undefined;

  if (due === 'today') {
    const now = new Date();
    const start = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        0,
        0,
        0,
      ),
    );
    const end = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        23,
        59,
        59,
      ),
    );

    const apps = await prisma.application.findMany({
      where: {
        userId,
        nextAction: {gte: start, lte: end},
      },
      orderBy: {nextAction: 'asc'},
      include: {job: true},
    });
    return res.json(apps);
  }

  const apps = await prisma.application.findMany({
    where: {userId},
    orderBy: [{appliedAt: 'desc'}, {createdAt: 'desc'}],
    include: {job: true},
  });
  res.json(apps);
});

/**
 * PATCH /applications/:id
 * body: partial application fields (status, nextAction, notes, coverNote)
 */
router.patch('/applications/:id', async (req, res) => {
  const userId = (req as any).userId as string;
  const {id} = req.params;
  const patch = req.body ?? {};

  const existing = await prisma.application.findUnique({
    where: {id},
    include: {job: true},
  });
  if (!existing || existing.userId !== userId)
    return res.status(404).json({error: 'not found'});

  const app = await prisma.application.update({
    where: {id},
    data: patch,
  });

  await prisma.job.update({
    where: {id: existing.jobId},
    data: {lastActivityAt: new Date()},
  });

  res.json(app);
});

export default router;
