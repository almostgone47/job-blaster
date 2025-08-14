import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();

async function migrateSalaryData() {
  console.log('Starting salary data migration...');

  try {
    // Get all jobs with salary data in the old format
    const jobsWithOldSalary = await prisma.job.findMany({
      where: {
        salary: {
          not: null,
        },
      },
      select: {
        id: true,
        salary: true,
        title: true,
        company: true,
      },
    });

    console.log(`Found ${jobsWithOldSalary.length} jobs with old salary data`);

    let migratedCount = 0;
    let skippedCount = 0;

    for (const job of jobsWithOldSalary) {
      if (!job.salary) continue;

      try {
        // Parse the salary string to extract min/max values
        const salaryData = parseSalaryString(job.salary);

        if (salaryData) {
          // Update the job with new salary fields
          await prisma.job.update({
            where: {id: job.id},
            data: {
              salaryMin: salaryData.min,
              salaryMax: salaryData.max,
              salaryCurrency: salaryData.currency,
              salaryType: salaryData.type as any, // Type assertion for migration
            },
          });

          console.log(
            `✅ Migrated: ${job.title} at ${job.company} - ${job.salary} → $${
              salaryData.min / 100
            }-$${salaryData.max / 100}`,
          );
          migratedCount++;
        } else {
          console.log(
            `⚠️  Skipped: ${job.title} at ${job.company} - Could not parse: ${job.salary}`,
          );
          skippedCount++;
        }
      } catch (error) {
        console.error(`❌ Error migrating ${job.title}:`, error);
        skippedCount++;
      }
    }

    console.log(`\nMigration complete!`);
    console.log(`✅ Migrated: ${migratedCount} jobs`);
    console.log(`⚠️  Skipped: ${skippedCount} jobs`);
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

function parseSalaryString(
  salaryStr: string,
): {min: number; max: number; currency: string; type: string} | null {
  // Remove common prefixes and clean up the string
  let cleanStr = salaryStr.trim();

  // Handle common salary formats
  if (
    cleanStr.toLowerCase().includes('hour') ||
    cleanStr.toLowerCase().includes('hr')
  ) {
    // Hourly rate
    const hourlyMatch = cleanStr.match(/(\d+(?:,\d+)*(?:\.\d+)?)/);
    if (hourlyMatch) {
      const hourlyRate = parseFloat(hourlyMatch[1].replace(/,/g, ''));
      // Convert hourly to annual (assuming 40 hours/week, 52 weeks/year)
      const annualSalary = hourlyRate * 40 * 52;
      return {
        min: Math.round(annualSalary * 100), // Convert to cents
        max: Math.round(annualSalary * 100),
        currency: 'USD',
        type: 'ANNUAL',
      };
    }
  }

  // Handle range formats like "$50,000 - $80,000" or "50k-80k"
  const rangeMatch = cleanStr.match(
    /(\d+(?:,\d+)*(?:\.\d+)?)\s*[-–—]\s*(\d+(?:,\d+)*(?:\.\d+)?)/i,
  );
  if (rangeMatch) {
    const min = parseFloat(rangeMatch[1].replace(/,/g, ''));
    const max = parseFloat(rangeMatch[2].replace(/,/g, ''));

    // Handle k (thousands) and M (millions)
    const minValue = cleanStr.toLowerCase().includes('k')
      ? min * 1000
      : cleanStr.toLowerCase().includes('m')
      ? min * 1000000
      : min;
    const maxValue = cleanStr.toLowerCase().includes('k')
      ? max * 1000
      : cleanStr.toLowerCase().includes('m')
      ? max * 1000000
      : max;

    return {
      min: Math.round(minValue * 100), // Convert to cents
      max: Math.round(maxValue * 100),
      currency: 'USD',
      type: 'ANNUAL',
    };
  }

  // Handle single value formats like "$75,000" or "75k"
  const singleMatch = cleanStr.match(/(\d+(?:,\d+)*(?:\.\d+)?)/);
  if (singleMatch) {
    let value = parseFloat(singleMatch[1].replace(/,/g, ''));

    // Handle k (thousands) and M (millions)
    if (cleanStr.toLowerCase().includes('k')) {
      value *= 1000;
    } else if (cleanStr.toLowerCase().includes('m')) {
      value *= 1000000;
    }

    return {
      min: Math.round(value * 100), // Convert to cents
      max: Math.round(value * 100),
      currency: 'USD',
      type: 'ANNUAL',
    };
  }

  return null;
}

// Run the migration if this file is executed directly
if (require.main === module) {
  migrateSalaryData();
}

export {migrateSalaryData, parseSalaryString};
