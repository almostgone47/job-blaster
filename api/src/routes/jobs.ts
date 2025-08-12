import express from 'express';
import {PrismaClient, JobStatus} from '@prisma/client';
const prisma = new PrismaClient();
const router = express.Router();

router.get('/jobs', async (req, res) => {
  const userId = (req as any).userId as string;
  const status = req.query.status as JobStatus | undefined;
  const jobs = await prisma.job.findMany({
    where: {userId, ...(status ? {status} : {})},
    orderBy: [{lastActivityAt: 'desc'}, {createdAt: 'desc'}],
  });
  res.json(jobs);
});

router.post('/jobs', async (req, res) => {
  const userId = (req as any).userId as string;
  const {title, company, url, source, faviconUrl} = req.body ?? {};
  if (!title || !company || !url)
    return res.status(400).json({error: 'title, company, url required'});

  const job = await prisma.job.create({
    data: {userId, title, company, url, source, faviconUrl},
  });
  res.status(201).json(job);
});

router.patch('/jobs/:id', async (req, res) => {
  const userId = (req as any).userId as string;
  const {id} = req.params;
  const patch = req.body ?? {};

  const existing = await prisma.job.findUnique({where: {id}});
  if (!existing || existing.userId !== userId)
    return res.status(404).json({error: 'not found'});

  const job = await prisma.job.update({
    where: {id},
    data: {...patch, lastActivityAt: new Date()},
  });
  res.json(job);
});

router.delete('/jobs/:id', async (req, res) => {
  const userId = (req as any).userId as string;
  const {id} = req.params;

  const existing = await prisma.job.findUnique({where: {id}});
  if (!existing || existing.userId !== userId)
    return res.status(404).json({error: 'not found'});

  await prisma.job.delete({where: {id}});
  res.status(204).end();
});

router.get('/jobs/export', async (req, res) => {
  const userId = (req as any).userId as string;
  const jobs = await prisma.job.findMany({
    where: {userId},
    include: {
      applications: {
        orderBy: {appliedAt: 'desc'},
        take: 1,
      },
    },
    orderBy: [{status: 'asc'}, {lastActivityAt: 'desc'}],
  });

  const csv = [
    'Title,Company,Status,Source,Location,Salary,Notes,Applied Date,Last Activity',
    ...jobs.map((job) => {
      const appliedDate = job.applications[0]?.appliedAt
        ? job.applications[0].appliedAt.toISOString().split('T')[0]
        : '';

      return [
        `"${job.title.replace(/"/g, '""')}"`,
        `"${job.company.replace(/"/g, '""')}"`,
        job.status,
        `"${job.source || ''}"`,
        `"${job.location || ''}"`,
        `"${job.salary || ''}"`,
        `"${job.notes || ''}"`,
        appliedDate,
        job.lastActivityAt.toISOString().split('T')[0],
      ].join(',');
    }),
  ].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader(
    'Content-Disposition',
    'attachment; filename="jobs-export.csv"',
  );
  res.send(csv);
});

export default router;
