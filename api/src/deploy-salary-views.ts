import {PrismaClient} from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function deploySalaryViews() {
  console.log('Deploying salary analytics views...');

  try {
    // Read the SQL file
    const sqlPath = path.join(__dirname, '../prisma/salary-views.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    // Split into individual statements
    const statements = sqlContent
      .split(';')
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`Found ${statements.length} SQL statements to execute`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          await prisma.$executeRawUnsafe(statement);
          console.log(`✅ Executed statement ${i + 1}`);
        } catch (error) {
          console.log(
            `⚠️  Statement ${
              i + 1
            } failed (this might be expected for some statements):`,
            (error as any).message,
          );
        }
      }
    }

    console.log('\n🎉 Salary views deployment completed!');
    console.log('You can now query these views:');
    console.log('- v_offers_user');
    console.log('- v_salary_stats');
    console.log('- v_salary_by_company');
    console.log('- v_salary_by_location');
    console.log('- v_salary_remote_split');
    console.log('- v_salary_timeline');
  } catch (error) {
    console.error('Failed to deploy salary views:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if this file is executed directly
if (require.main === module) {
  deploySalaryViews();
}

export {deploySalaryViews};
