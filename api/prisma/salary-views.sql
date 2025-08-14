-- Enhanced Salary Analytics Views
-- These views provide comprehensive data for the advanced UI components

-- 1. Base view with normalized per-offer salary data for current user
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

-- 2. Enhanced global statistics with percentiles
create or replace view v_salary_stats as
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

-- 3. Company leaderboard with detailed stats
create or replace view v_salary_by_company as
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

-- 4. Location breakdown with detailed stats
create or replace view v_salary_by_location as
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

-- 5. Remote vs onsite salary comparison
create or replace view v_salary_remote_split as
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

-- 6. Monthly salary trends over time
create or replace view v_salary_timeline as
select
  date_trunc('month', offer_date) as month,
  count(*) as offer_count,
  avg(effective_base) as avg_salary,
  min(effective_base) as min_salary,
  max(effective_base) as max_salary,
  -- Calculate month-over-month growth
  lag(avg(effective_base)) over (order by date_trunc('month', offer_date)) as prev_month_avg,
  -- Calculate growth percentage
  case 
    when lag(avg(effective_base)) over (order by date_trunc('month', offer_date)) > 0 
    then ((avg(effective_base) - lag(avg(effective_base)) over (order by date_trunc('month', offer_date))) / lag(avg(effective_base)) over (order by date_trunc('month', offer_date))) * 100
    else null
  end as growth_percentage
from v_offers_user
group by date_trunc('month', offer_date)
order by month desc;

-- 7. Market positioning analysis
create or replace view v_market_positioning as
select
  -- How user's offers compare to overall distribution
  avg(effective_base) as user_avg_salary,
  (select avg_salary from v_salary_stats) as overall_avg_salary,
  -- Calculate percentile ranking
  (select 
    case 
      when count(*) > 0 then 
        (count(*) filter (where effective_base <= o.effective_base)::float / count(*) * 100)
      else 0 
    end
   from v_offers_user) as percentile_rank,
  -- Market positioning insights
  case 
    when avg(effective_base) > (select p75 from v_salary_stats) then 'Above 75th percentile'
    when avg(effective_base) > (select median from v_salary_stats) then 'Above median'
    when avg(effective_base) > (select p25 from v_salary_stats) then 'Above 25th percentile'
    else 'Below 25th percentile'
  end as market_position
from v_offers_user o;

-- Grant permissions to authenticated users
grant select on v_offers_user to authenticated;
grant select on v_salary_stats to authenticated;
grant select on v_salary_by_company to authenticated;
grant select on v_salary_by_location to authenticated;
grant select on v_salary_remote_split to authenticated;
grant select on v_salary_timeline to authenticated;
grant select on v_market_positioning to authenticated;
