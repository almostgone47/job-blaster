import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deployViewsStepByStep() {
  console.log('Deploying salary analytics views step by step...');

  try {
    // Step 1: Create the base view first
    console.log('\n📋 Step 1: Creating v_offers_user view...');
    await prisma.$executeRawUnsafe(`
      create or replace view v_offers_user as
      select
        o.id,
        o."userId" as user_id,
        o."jobId" as job_id,
        o.amount::numeric as effective_base,
        o.currency,
        j."isRemote" as is_remote,
        coalesce(j."locationCountry", '') as country,
        coalesce(j."locationState", '')     as state,
        coalesce(j."locationCity", '')       as city,
        j.company,
        j.title,
        o."offeredAt" as offer_date
      from "SalaryOffer" o
      join "Job" j on j.id = o."jobId"
      where o."userId"::text = auth.uid()::text;
    `);
    console.log('✅ v_offers_user view created');

    // Step 2: Create salary stats view
    console.log('\n📊 Step 2: Creating v_salary_stats view...');
    await prisma.$executeRawUnsafe(`
      create or replace view v_salary_stats as
      select
        auth.uid() as user_id,
        count(*)                         as n,
        round(avg(effective_base))       as avg_salary,
        percentile_cont(0.5) within group (order by effective_base) as median_salary,
        percentile_cont(0.25) within group (order by effective_base) as p25_salary,
        percentile_cont(0.75) within group (order by effective_base) as p75_salary,
        min(effective_base)              as min_salary,
        max(effective_base)              as max_salary
      from v_offers_user;
    `);
    console.log('✅ v_salary_stats view created');

    // Step 3: Create company leaderboard view
    console.log('\n🏢 Step 3: Creating v_salary_by_company view...');
    await prisma.$executeRawUnsafe(`
      create or replace view v_salary_by_company as
      select
        company,
        count(*) as n,
        round(avg(effective_base)) as avg_salary,
        min(effective_base) as min_salary,
        max(effective_base) as max_salary
      from v_offers_user
      group by company
      order by avg_salary desc;
    `);
    console.log('✅ v_salary_by_company view created');

    // Step 4: Create location summary view
    console.log('\n🌍 Step 4: Creating v_salary_by_location view...');
    await prisma.$executeRawUnsafe(`
      create or replace view v_salary_by_location as
      select
        coalesce(country,'Unknown') as country,
        coalesce(state,'') as state,
        coalesce(city,'') as city,
        count(*) as n,
        round(avg(effective_base)) as avg_salary
      from v_offers_user
      group by country, state, city
      order by avg_salary desc;
    `);
    console.log('✅ v_salary_by_location view created');

    // Step 5: Create remote split view
    console.log('\n🏠 Step 5: Creating v_salary_remote_split view...');
    await prisma.$executeRawUnsafe(`
      create or replace view v_salary_remote_split as
      select
        is_remote,
        count(*) as n,
        round(avg(effective_base)) as avg_salary
      from v_offers_user
      group by is_remote;
    `);
    console.log('✅ v_salary_remote_split view created');

    // Step 6: Create timeline view
    console.log('\n📅 Step 6: Creating v_salary_timeline view...');
    await prisma.$executeRawUnsafe(`
      create or replace view v_salary_timeline as
      select
        date_trunc('month', coalesce(offer_date, now())) as month,
        count(*) as n,
        round(avg(effective_base)) as avg_salary
      from v_offers_user
      group by 1
      order by 1 asc;
    `);
    console.log('✅ v_salary_timeline view created');

    // Step 7: Grant permissions
    console.log('\n🔐 Step 7: Granting permissions...');
    const views = [
      'v_offers_user',
      'v_salary_stats', 
      'v_salary_by_company',
      'v_salary_by_location',
      'v_salary_remote_split',
      'v_salary_timeline'
    ];

    for (const view of views) {
      try {
        await prisma.$executeRawUnsafe(`grant select on ${view} to authenticated;`);
        console.log(`✅ Permissions granted for ${view}`);
      } catch (error) {
        console.log(`⚠️  Permission grant for ${view} failed (might already exist)`);
      }
    }

    console.log('\n🎉 All salary analytics views deployed successfully!');
    console.log('\n📋 Available views:');
    views.forEach(view => console.log(`  - ${view}`));
    
    console.log('\n🧪 Test them with:');
    console.log('  SELECT * FROM v_offers_user LIMIT 5;');
    console.log('  SELECT * FROM v_salary_stats;');
    console.log('  SELECT * FROM v_salary_by_company;');

  } catch (error) {
    console.error('❌ Failed to deploy views:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if this file is executed directly
if (require.main === module) {
  deployViewsStepByStep();
}

export { deployViewsStepByStep };
