import express from 'express';
import prisma from '../prisma';

const router = express.Router();

// Get salary analytics for the current user
router.get('/salary/analytics', async (req, res) => {
  const userId = (req as any).userId as string;

  try {
    // Get all jobs with salary data
    const jobsWithSalary = await prisma.job.findMany({
      where: {
        userId,
        OR: [
          {salaryMin: {not: null}},
          {salaryMax: {not: null}},
          {salary: {not: null}},
        ],
      },
      select: {
        id: true,
        title: true,
        company: true,
        location: true,
        salaryMin: true,
        salaryMax: true,
        salaryCurrency: true,
        salaryType: true,
        status: true,
        createdAt: true,
      },
      orderBy: {createdAt: 'desc'},
    });

    // Get all salary offers
    const offers = await prisma.salaryOffer.findMany({
      where: {userId},
      include: {
        job: {
          select: {
            title: true,
            company: true,
            location: true,
          },
        },
      },
      orderBy: {offeredAt: 'desc'},
    });

    // Get salary history
    const salaryHistory = await prisma.salaryHistory.findMany({
      where: {userId},
      include: {
        job: {
          select: {
            title: true,
            company: true,
          },
        },
      },
      orderBy: {effectiveDate: 'desc'},
    });

    // Calculate analytics
    const analytics = {
      totalJobsWithSalary: jobsWithSalary.length,
      totalOffers: offers.length,
      pendingOffers: offers.filter((o) => o.status === 'PENDING').length,
      acceptedOffers: offers.filter((o) => o.status === 'ACCEPTED').length,
      averageSalary:
        jobsWithSalary.length > 0
          ? jobsWithSalary.reduce((sum, job) => {
              const avg = ((job.salaryMin || 0) + (job.salaryMax || 0)) / 2;
              return sum + avg;
            }, 0) / jobsWithSalary.length
          : 0,
      salaryRange: {
        min:
          jobsWithSalary.length > 0
            ? Math.min(
                ...jobsWithSalary
                  .map((j) => j.salaryMin || 0)
                  .filter((v) => v > 0),
              )
            : 0,
        max:
          jobsWithSalary.length > 0
            ? Math.max(
                ...jobsWithSalary
                  .map((j) => j.salaryMax || 0)
                  .filter((v) => v > 0),
              )
            : 0,
      },
      byLocation: {} as Record<string, {count: number; avgSalary: number}>,
      byCompany: {} as Record<string, {count: number; avgSalary: number}>,
    };

    // Group by location
    jobsWithSalary.forEach((job) => {
      if (job.location) {
        if (!analytics.byLocation[job.location]) {
          analytics.byLocation[job.location] = {count: 0, avgSalary: 0};
        }
        analytics.byLocation[job.location].count++;
        const avg = ((job.salaryMin || 0) + (job.salaryMax || 0)) / 2;
        analytics.byLocation[job.location].avgSalary += avg;
      }
    });

    // Group by company
    jobsWithSalary.forEach((job) => {
      if (!analytics.byCompany[job.company]) {
        analytics.byCompany[job.company] = {count: 0, avgSalary: 0};
      }
      analytics.byCompany[job.company].count++;
      const avg = ((job.salaryMin || 0) + (job.salaryMax || 0)) / 2;
      analytics.byCompany[job.company].avgSalary += avg;
    });

    // Calculate averages
    Object.keys(analytics.byLocation).forEach((location) => {
      analytics.byLocation[location].avgSalary /=
        analytics.byLocation[location].count;
    });

    Object.keys(analytics.byCompany).forEach((company) => {
      analytics.byCompany[company].avgSalary /=
        analytics.byCompany[company].count;
    });

    res.json({
      analytics,
      jobs: jobsWithSalary,
      offers,
      salaryHistory,
    });
  } catch (error) {
    console.error('Failed to fetch salary analytics:', error);
    res.status(500).json({error: 'Failed to fetch salary analytics'});
  }
});

// Create a new salary offer
router.post('/salary/offers', async (req, res) => {
  const userId = (req as any).userId as string;
  const {
    jobId,
    applicationId,
    amount,
    currency = 'USD',
    type = 'ANNUAL',
    status = 'PENDING',
    expiresAt,
    notes,
    benefits = [],
  } = req.body ?? {};

  if (!jobId || !amount) {
    return res.status(400).json({error: 'jobId and amount are required'});
  }

  try {
    const offer = await prisma.salaryOffer.create({
      data: {
        userId,
        jobId,
        applicationId,
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        type,
        status,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        notes,
        benefits,
      },
      include: {
        job: {
          select: {
            title: true,
            company: true,
            location: true,
          },
        },
      },
    });

    res.status(201).json(offer);
  } catch (error) {
    console.error('Failed to create salary offer:', error);
    res.status(500).json({error: 'Failed to create salary offer'});
  }
});

// Update a salary offer
router.patch('/salary/offers/:id', async (req, res) => {
  const userId = (req as any).userId as string;
  const {id} = req.params;
  const patch = req.body ?? {};

  try {
    const existing = await prisma.salaryOffer.findUnique({where: {id}});
    if (!existing || existing.userId !== userId) {
      return res.status(404).json({error: 'not found'});
    }

    // Convert amount to cents if provided
    if (patch.amount !== undefined) {
      patch.amount = Math.round(patch.amount * 100);
    }

    // Convert date if provided
    if (patch.expiresAt) {
      patch.expiresAt = new Date(patch.expiresAt);
    }

    const offer = await prisma.salaryOffer.update({
      where: {id},
      data: patch,
      include: {
        job: {
          select: {
            title: true,
            company: true,
            location: true,
          },
        },
      },
    });

    res.json(offer);
  } catch (error) {
    console.error('Failed to update salary offer:', error);
    res.status(500).json({error: 'Failed to update salary offer'});
  }
});

// Add salary history entry
router.post('/salary/history', async (req, res) => {
  const userId = (req as any).userId as string;
  const {
    jobId,
    amount,
    currency = 'USD',
    type = 'ANNUAL',
    effectiveDate,
    changeType = 'INITIAL',
    notes,
  } = req.body ?? {};

  if (!jobId || !amount) {
    return res.status(400).json({error: 'jobId and amount are required'});
  }

  try {
    const history = await prisma.salaryHistory.create({
      data: {
        userId,
        jobId,
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        type,
        effectiveDate: effectiveDate ? new Date(effectiveDate) : new Date(),
        changeType,
        notes,
      },
      include: {
        job: {
          select: {
            title: true,
            company: true,
          },
        },
      },
    });

    res.status(201).json(history);
  } catch (error) {
    console.error('Failed to create salary history:', error);
    res.status(500).json({error: 'Failed to create salary history'});
  }
});

export default router;
