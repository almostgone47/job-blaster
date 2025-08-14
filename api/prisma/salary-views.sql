-- Salary Analytics Views for Job Blaster
-- These views provide aggregated salary insights for authenticated users
-- Run this in Supabase SQL Editor

-- 2.1 Per-offer normalized salaries for current user
create or replace view v_offers_user as
select
  o.id,
  o.user_id,
  o.job_id,
  coalesce(o.amount, (o.amount))::numeric as effective_base,
  o.currency,
  j.is_remote,
  coalesce(j.location_country, '') as country,
  coalesce(j.location_state, '')     as state,
  coalesce(j.location_city, '')       as city,
  j.company,
  j.title,
  o.offered_at as offer_date
from "SalaryOffer" o
join jobs j on j.id = o.job_id
where o.user_id = auth.uid();

-- 2.2 Global stats for the user's dataset
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

-- 2.3 Company leaderboard
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

-- 2.4 Location summary (country/state/city combined for simplicity)
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

-- 2.5 Remote vs onsite
create or replace view v_salary_remote_split as
select
  is_remote,
  count(*) as n,
  round(avg(effective_base)) as avg_salary
from v_offers_user
group by is_remote;

-- 2.6 Timeline (monthly)
create or replace view v_salary_timeline as
select
  date_trunc('month', coalesce(offer_date, now())) as month,
  count(*) as n,
  round(avg(effective_base)) as avg_salary
from v_offers_user
group by 1
order by 1 asc;

-- RLS Policies for the views
-- Note: These views inherit RLS from the underlying tables
-- Make sure your offers and jobs tables have proper RLS policies

-- Grant select permissions on views to authenticated users
grant select on v_offers_user to authenticated;
grant select on v_salary_stats to authenticated;
grant select on v_salary_by_company to authenticated;
grant select on v_salary_by_location to authenticated;
grant select on v_salary_remote_split to authenticated;
grant select on v_salary_timeline to authenticated;
