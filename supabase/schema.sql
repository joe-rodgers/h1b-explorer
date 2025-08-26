-- H1B Explorer schema helpers (indexes + RPC functions)
-- Safe to re-run: uses CREATE INDEX IF NOT EXISTS and CREATE OR REPLACE FUNCTION

-- =========================
-- Indexes
-- =========================
create index if not exists idx_h1b_new_employment_approval on public.h1b_cases (new_employment_approval);
create index if not exists idx_h1b_year_state on public.h1b_cases (fiscal_year, petitioner_state);
create index if not exists idx_h1b_year_approval on public.h1b_cases (fiscal_year, new_employment_approval);
create index if not exists idx_h1b_year_state_city_approval on public.h1b_cases (fiscal_year, petitioner_state, petitioner_city, new_employment_approval);
create index if not exists idx_h1b_year_city_approval on public.h1b_cases (fiscal_year, petitioner_city, new_employment_approval);
create index if not exists idx_h1b_city_approval on public.h1b_cases (petitioner_city, new_employment_approval) where new_employment_approval > 0;
create index if not exists idx_h1b_state_city_approval on public.h1b_cases (petitioner_state, petitioner_city, new_employment_approval) where new_employment_approval > 0;
create index if not exists idx_h1b_year_state_city_approval_opt on public.h1b_cases (fiscal_year, petitioner_state, petitioner_city, new_employment_approval) where new_employment_approval > 0;
-- Indexes for employer aggregations
create index if not exists idx_h1b_employer_approval on public.h1b_cases (employer_name, new_employment_approval) where new_employment_approval > 0;
create index if not exists idx_h1b_year_state_employer_approval on public.h1b_cases (fiscal_year, petitioner_state, employer_name, new_employment_approval) where new_employment_approval > 0;

-- =========================
-- Extra index to support year fallback
-- =========================
create index if not exists idx_h1b_data_year on public.h1b_cases (data_year);

-- =========================
-- Helper generated column for fast year filtering
-- =========================
alter table public.h1b_cases
  add column if not exists year_coalesced int generated always as (coalesce(fiscal_year, data_year)) stored;

create index if not exists idx_h1b_year_coalesced on public.h1b_cases (year_coalesced);
create index if not exists idx_h1b_year_state_coalesced on public.h1b_cases (year_coalesced, petitioner_state);

-- =========================
-- Materialized Views (pre-aggregated)
-- =========================
create materialized view if not exists public.mv_h1b_year_state as
select c.fiscal_year::int          as fiscal_year,
       c.petitioner_state::text    as petitioner_state,
       sum(c.new_employment_approval)::bigint as total
from public.h1b_cases c
where c.new_employment_approval > 0
  and coalesce(trim(c.petitioner_state), '') <> ''
group by c.fiscal_year, c.petitioner_state;

create unique index if not exists uq_mv_year_state
  on public.mv_h1b_year_state (fiscal_year, petitioner_state);

create materialized view if not exists public.mv_h1b_city_year_state as
select c.fiscal_year::int          as fiscal_year,
       c.petitioner_state::text    as petitioner_state,
       c.petitioner_city::text     as petitioner_city,
       sum(c.new_employment_approval)::bigint as total
from public.h1b_cases c
where c.new_employment_approval > 0
  and coalesce(trim(c.petitioner_state), '') <> ''
  and coalesce(trim(c.petitioner_city),  '') <> ''
group by c.fiscal_year, c.petitioner_state, c.petitioner_city;

create unique index if not exists uq_mv_city_year_state
  on public.mv_h1b_city_year_state (fiscal_year, petitioner_state, petitioner_city);

create materialized view if not exists public.mv_h1b_employer_year_state as
select c.fiscal_year::int          as fiscal_year,
       c.petitioner_state::text    as petitioner_state,
       c.employer_name::text       as employer_name,
       sum(c.new_employment_approval)::bigint as total
from public.h1b_cases c
where c.new_employment_approval > 0
  and coalesce(trim(c.petitioner_state), '') <> ''
  and coalesce(trim(c.employer_name),  '') <> ''
group by c.fiscal_year, c.petitioner_state, c.employer_name;

create unique index if not exists uq_mv_emp_year_state
  on public.mv_h1b_employer_year_state (fiscal_year, petitioner_state, employer_name);

-- =========================
-- RPC: Sum by Year (reverted: fiscal_year only, approvals > 0)
-- =========================
create or replace function public.h1b_sum_by_year(years int[] default null)
returns table (year int, total bigint)
language plpgsql stable as $$
begin
  perform set_config('statement_timeout','20000', true);
  return query
    select c.fiscal_year::int as year,
           sum(c.new_employment_approval)::bigint as total
    from public.h1b_cases c
    where c.new_employment_approval > 0
      and (years is null or c.fiscal_year = any(years))
    group by c.fiscal_year
    order by year asc;
end; $$;

grant execute on function public.h1b_sum_by_year(int[]) to anon, authenticated;

-- =========================
-- RPC: Sum by State (optionally filtered by years) via MV
-- =========================
create or replace function public.h1b_sum_by_state(years int[] default null)
returns table (state text, total bigint)
language sql stable as $$
  select m.petitioner_state::text as state,
         sum(m.total)::bigint     as total
  from public.mv_h1b_year_state m
  where (
          (years is null and m.fiscal_year between 2015 and 2025)
       or (years is not null and m.fiscal_year = any(years))
        )
  group by m.petitioner_state
  order by total desc;
$$;

grant execute on function public.h1b_sum_by_state(int[]) to anon, authenticated;

-- =========================
-- RPC: Sum by State with optional years and states filters via MV
-- =========================
create or replace function public.h1b_sum_by_state_filtered(years int[] default null, states text[] default null)
returns table (state text, total bigint)
language sql stable as $$
  select m.petitioner_state::text as state,
         sum(m.total)::bigint     as total
  from public.mv_h1b_year_state m
  where (
          (years is null and m.fiscal_year between 2015 and 2025)
       or (years is not null and m.fiscal_year = any(years))
        )
    and (states is null or m.petitioner_state = any(states))
  group by m.petitioner_state
  order by total desc;
$$;

grant execute on function public.h1b_sum_by_state_filtered(int[], text[]) to anon, authenticated;

-- =========================
-- Partial indexes to speed filtered aggregates (kept for base table ops)
-- =========================
create index if not exists idx_h1b_year_coalesced_approval on public.h1b_cases (year_coalesced) where new_employment_approval > 0;
create index if not exists idx_h1b_year_state_coalesced_approval on public.h1b_cases (year_coalesced, petitioner_state) where new_employment_approval > 0;
create index if not exists idx_h1b_state_approval on public.h1b_cases (petitioner_state) where new_employment_approval > 0;

-- =========================
-- RPC: Sum by Year with optional years and states filters via MV
-- =========================
create or replace function public.h1b_sum_by_year_states(years int[] default null, states text[] default null)
returns table (year int, total bigint)
language sql stable as $$
  select m.fiscal_year::int as year,
         sum(m.total)::bigint as total
  from public.mv_h1b_year_state m
  where (
          (years is null and m.fiscal_year between 2015 and 2025)
       or (years is not null and m.fiscal_year = any(years))
        )
    and (states is null or m.petitioner_state = any(states))
  group by m.fiscal_year
  order by year asc;
$$;

grant execute on function public.h1b_sum_by_year_states(int[], text[]) to anon, authenticated;

-- =========================
-- RPC: Top Cities (limit 20) with optional filters via MV
-- =========================
create or replace function public.h1b_top_cities(years int[] default null, states text[] default null)
returns table (city text, total bigint)
language sql stable as $$
  select m.petitioner_city::text as city,
         sum(m.total)::bigint    as total
  from public.mv_h1b_city_year_state m
  where (
          (years is null and m.fiscal_year between 2015 and 2025)
       or (years is not null and m.fiscal_year = any(years))
        )
    and (states is null or m.petitioner_state = any(states))
  group by m.petitioner_city
  order by total desc
  limit 20;
$$;

grant execute on function public.h1b_top_cities(int[], text[]) to anon, authenticated;

-- =========================
-- RPC: Top Employers (limit 20) with optional filters via MV
-- =========================
create or replace function public.h1b_top_employers(years int[] default null, states text[] default null)
returns table (employer text, total bigint)
language sql stable as $$
  select m.employer_name::text as employer,
         sum(m.total)::bigint   as total
  from public.mv_h1b_employer_year_state m
  where (
          (years is null and m.fiscal_year between 2015 and 2025)
       or (years is not null and m.fiscal_year = any(years))
        )
    and (states is null or m.petitioner_state = any(states))
  group by m.employer_name
  order by total desc
  limit 20;
$$;

grant execute on function public.h1b_top_employers(int[], text[]) to anon, authenticated;

-- =========================
-- Ask PostgREST to reload its schema cache
-- =========================
select pg_notify('pgrst', 'reload schema');