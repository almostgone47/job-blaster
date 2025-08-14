import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();

async function createSampleOffers() {
  console.log('Creating sample offers for salary analytics testing...');

  try {
    // Get existing jobs to attach offers to
    const jobs = await prisma.job.findMany({
      take: 5,
      select: {id: true, title: true, company: true, userId: true},
    });

    if (jobs.length === 0) {
      console.log('No jobs found. Please create some jobs first.');
      return;
    }

    // Get the first user ID from the jobs
    const userId = jobs[0].userId;
    console.log(`Found ${jobs.length} jobs to create offers for`);
    console.log(`Using user ID: ${userId}`);

    // Sample offer data with realistic salary ranges
    const sampleOffers = [
      {
        jobId: jobs[0].id,
        amount: 100000, // $100k (average of range)
        currency: 'USD',
        type: 'ANNUAL' as any,
        status: 'PENDING' as any,
        expiresAt: new Date('2024-01-15'),
        notes: 'Great benefits package',
        benefits: ['Health insurance', '401k', 'Stock options']
      },
      {
        jobId: jobs[0].id,
        amount: 100000, // $100k (average of range)
        currency: 'USD',
        type: 'ANNUAL' as any,
        status: 'PENDING' as any,
        expiresAt: new Date('2024-02-01'),
        notes: 'Competitive offer',
        benefits: ['Health insurance', '401k', 'Stock options']
      },
      {
        jobId: jobs[1]?.id || jobs[0].id,
        amount: 95000, // $95k
        currency: 'USD',
        type: 'ANNUAL' as any,
        status: 'PENDING' as any,
        expiresAt: new Date('2024-01-20'),
        notes: 'Remote-first company',
        benefits: ['Health insurance', '401k', 'Stock options']
      },
      {
        jobId: jobs[2]?.id || jobs[0].id,
        amount: 77500, // $77.5k (average of range)
        currency: 'USD',
        type: 'ANNUAL' as any,
        status: 'PENDING' as any,
        expiresAt: new Date('2024-02-15'),
        notes: 'Growing startup',
        benefits: ['Health insurance', '401k', 'Stock options']
      },
      {
        jobId: jobs[3]?.id || jobs[0].id,
        amount: 110000, // $110k
        currency: 'USD',
        type: 'ANNUAL' as any,
        status: 'PENDING' as any,
        expiresAt: new Date('2024-03-01'),
        notes: 'Big tech company',
        benefits: ['Health insurance', '401k', 'Stock options']
      },
      {
        jobId: jobs[4]?.id || jobs[0].id,
        amount: 70000, // $70k (average of range)
        currency: 'USD',
        type: 'ANNUAL' as any,
        status: 'PENDING' as any,
        expiresAt: new Date('2024-02-28'),
        notes: 'Established company',
        benefits: ['Health insurance', '401k', 'Stock options']
      }
    ];

    // Create the offers
    for (const offerData of sampleOffers) {
              const offer = await prisma.salaryOffer.create({
          data: {
            userId: userId,
            ...offerData,
          },
        });
      console.log(
        `✅ Created offer: $${offerData.amount}k at ${offerData.notes}`,
      );
    }

    console.log(`\n🎉 Created ${sampleOffers.length} sample offers!`);
    console.log('Now you can test the salary analytics views.');
  } catch (error) {
    console.error('Failed to create sample offers:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if this file is executed directly
if (require.main === module) {
  createSampleOffers();
}

export {createSampleOffers};
