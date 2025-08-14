import {PrismaClient} from '@prisma/client';

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

    // Step 2: Create enhanced salary stats view with percentiles
    console.log('\n📊 Step 2: Creating v_salary_stats view...');
    await prisma.$executeRawUnsafe(`drop view if exists v_salary_stats;`);
    await prisma.$executeRawUnsafe(`
      create view v_salary_stats as
      select
        count(*) as total_offers,
        avg(effective_base) as average_salary,
        percentile_cont(0.25) within group (order by effective_base) as p25,
        percentile_cont(0.50) within group (order by effective_base) as median,
        percentile_cont(0.75) within group (order by effective_base) as p75,
        percentile_cont(0.90) within group (order by effective_base) as p90,
        min(effective_base) as min_salary,
        max(effective_base) as max_salary,
        stddev(effective_base) as salary_stddev
      from v_offers_user;
    `);
    console.log('✅ v_salary_stats view created');

    // Step 3: Create enhanced company leaderboard view
    console.log('\n🏢 Step 3: Creating v_salary_by_company view...');
    await prisma.$executeRawUnsafe(`drop view if exists v_salary_by_company;`);
    await prisma.$executeRawUnsafe(`
      create view v_salary_by_company as
      select
        company,
        count(*) as offer_count,
        avg(effective_base) as avg_salary,
        min(effective_base) as min_salary,
        max(effective_base) as max_salary,
        percentile_cont(0.25) within group (order by effective_base) as p25,
        percentile_cont(0.75) within group (order by effective_base) as p75
      from v_offers_user
      group by company
      order by avg_salary desc;
    `);
    console.log('✅ v_salary_by_company view created');

    // Step 4: Create enhanced location breakdown view
    console.log('\n🌍 Step 4: Creating v_salary_by_location view...');
    await prisma.$executeRawUnsafe(`drop view if exists v_salary_by_location;`);
    await prisma.$executeRawUnsafe(`
      create view v_salary_by_location as
      select
        coalesce(city, 'Unknown') as location,
        count(*) as offer_count,
        avg(effective_base) as avg_salary,
        min(effective_base) as min_salary,
        max(effective_base) as max_salary,
        percentile_cont(0.25) within group (order by effective_base) as p25,
        percentile_cont(0.75) within group (order by effective_base) as p75
      from v_offers_user
      group by coalesce(city, 'Unknown')
      order by avg_salary desc;
    `);
    console.log('✅ v_salary_by_location view created');

    // Step 5: Create enhanced remote vs onsite view
    console.log('\n🏠 Step 5: Creating v_salary_remote_split view...');
    await prisma.$executeRawUnsafe(
      `drop view if exists v_salary_remote_split;`,
    );
    await prisma.$executeRawUnsafe(`
      create view v_salary_remote_split as
      select
        is_remote,
        count(*) as offer_count,
        avg(effective_base) as avg_salary,
        min(effective_base) as min_salary,
        max(effective_base) as max_salary,
        percentile_cont(0.25) within group (order by effective_base) as p25,
        percentile_cont(0.75) within group (order by effective_base) as p75
      from v_offers_user
      group by is_remote
      order by is_remote desc;
    `);
    console.log('✅ v_salary_remote_split view created');

    // Step 6: Create enhanced timeline view with growth analysis
    console.log('\n📅 Step 6: Creating v_salary_timeline view...');
    await prisma.$executeRawUnsafe(`drop view if exists v_salary_timeline;`);
    await prisma.$executeRawUnsafe(`
      create view v_salary_timeline as
      select
        date_trunc('month', offer_date) as month,
        count(*) as offer_count,
        avg(effective_base) as avg_salary,
        min(effective_base) as min_salary,
        max(effective_base) as max_salary,
        lag(avg(effective_base)) over (order by date_trunc('month', offer_date)) as prev_month_avg,
        case 
          when lag(avg(effective_base)) over (order by date_trunc('month', offer_date)) > 0 
          then ((avg(effective_base) - lag(avg(effective_base)) over (order by date_trunc('month', offer_date))) / lag(avg(effective_base)) over (order by date_trunc('month', offer_date))) * 100
          else null
        end as growth_percentage
      from v_offers_user
      group by date_trunc('month', offer_date)
      order by month desc;
    `);
    console.log('✅ v_salary_timeline view created');

    // Step 7: Create market positioning view
    console.log('\n🎯 Step 7: Creating v_market_positioning view...');
    await prisma.$executeRawUnsafe(`
      create or replace view v_market_positioning as
      select
        avg(effective_base) as user_avg_salary,
        (select average_salary from v_salary_stats) as overall_avg_salary,
        case 
          when avg(effective_base) > (select p75 from v_salary_stats) then 'Above 75th percentile'
          when avg(effective_base) > (select median from v_salary_stats) then 'Above median'
          when avg(effective_base) > (select p25 from v_salary_stats) then 'Above 25th percentile'
          else 'Below 25th percentile'
        end as market_position
      from v_offers_user;
    `);
    console.log('✅ v_market_positioning view created');

    // Step 8: Grant permissions
    console.log('\n🔐 Step 8: Granting permissions...');
    const views = [
      'v_offers_user',
      'v_salary_stats',
      'v_salary_by_company',
      'v_salary_by_location',
      'v_salary_remote_split',
      'v_salary_timeline',
      'v_market_positioning',
    ];

    for (const view of views) {
      try {
        await prisma.$executeRawUnsafe(
          `grant select on ${view} to authenticated;`,
        );
        console.log(`✅ Permissions granted for ${view}`);
      } catch (error) {
        console.log(
          `⚠️  Permission grant for ${view} failed (might already exist)`,
        );
      }
    }

    console.log('\n🎉 All salary analytics views deployed successfully!');
    console.log('\n📋 Available views:');
    views.forEach((view) => console.log(`  - ${view}`));

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

export {deployViewsStepByStep};
