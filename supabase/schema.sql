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
-- RPC: Sum by Year
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
-- RPC: Sum by State (optionally filtered by years)
-- =========================
create or replace function public.h1b_sum_by_state(years int[] default null)
returns table (state text, total bigint)
language plpgsql stable as $$
begin
  perform set_config('statement_timeout','20000', true);
  return query
    select c.petitioner_state::text as state,
           sum(c.new_employment_approval)::bigint as total
    from public.h1b_cases c
    where c.new_employment_approval > 0
      and coalesce(trim(c.petitioner_state), '') <> ''
      and (years is null or c.fiscal_year = any(years))
    group by c.petitioner_state
    order by total desc;
end; $$;

grant execute on function public.h1b_sum_by_state(int[]) to anon, authenticated;

-- =========================
-- RPC: Sum by State with optional years and states filters
-- =========================
create or replace function public.h1b_sum_by_state_filtered(years int[] default null, states text[] default null)
returns table (state text, total bigint)
language plpgsql stable as $$
begin
  perform set_config('statement_timeout','20000', true);
  return query
    select c.petitioner_state::text as state,
           sum(c.new_employment_approval)::bigint as total
    from public.h1b_cases c
    where c.new_employment_approval > 0
      and coalesce(trim(c.petitioner_state), '') <> ''
      and (years  is null or c.fiscal_year      = any(years))
      and (states is null or c.petitioner_state = any(states))
    group by c.petitioner_state
    order by total desc;
end; $$;

grant execute on function public.h1b_sum_by_state_filtered(int[], text[]) to anon, authenticated;

-- =========================
-- RPC: Sum by Year with optional years and states filters
-- =========================
create or replace function public.h1b_sum_by_year_states(years int[] default null, states text[] default null)
returns table (year int, total bigint)
language plpgsql stable as $$
begin
  perform set_config('statement_timeout','20000', true);
  return query
    select c.fiscal_year::int as year,
           sum(c.new_employment_approval)::bigint as total
    from public.h1b_cases c
    where c.new_employment_approval > 0
      and (years  is null or c.fiscal_year      = any(years))
      and (states is null or c.petitioner_state = any(states))
    group by c.fiscal_year
    order by year asc;
end; $$;

grant execute on function public.h1b_sum_by_year_states(int[], text[]) to anon, authenticated;

-- =========================
-- RPC: Top Cities (limit 20) with optional filters
-- =========================
create or replace function public.h1b_top_cities(years int[] default null, states text[] default null)
returns table (city text, total bigint)
language plpgsql stable as $$
begin
  perform set_config('statement_timeout','45000', true);

  return query
    with city_totals as (
      select
        c.petitioner_city,
        sum(c.new_employment_approval) as city_total
      from public.h1b_cases c
      where c.new_employment_approval > 0
        and coalesce(trim(c.petitioner_city), '') <> ''
        and (years  is null or c.fiscal_year      = any(years))
        and (states is null or c.petitioner_state = any(states))
      group by c.petitioner_city
    )
    select petitioner_city::text as city,
           city_total::bigint as total
    from city_totals
    order by city_total desc
    limit 20;
end; $$;

grant execute on function public.h1b_top_cities(int[], text[]) to anon, authenticated;

-- =========================
-- RPC: Top Employers (limit 20) with optional filters
-- =========================
create or replace function public.h1b_top_employers(years int[] default null, states text[] default null)
returns table (employer text, total bigint)
language plpgsql stable as $$
begin
  perform set_config('statement_timeout','45000', true);

  return query
    with emp_totals as (
      select
        c.employer_name,
        sum(c.new_employment_approval) as emp_total
      from public.h1b_cases c
      where c.new_employment_approval > 0
        and coalesce(trim(c.employer_name), '') <> ''
        and (years  is null or c.fiscal_year      = any(years))
        and (states is null or c.petitioner_state = any(states))
      group by c.employer_name
    )
    select employer_name::text as employer,
           emp_total::bigint as total
    from emp_totals
    order by emp_total desc
    limit 20;
end; $$;

grant execute on function public.h1b_top_employers(int[], text[]) to anon, authenticated;

-- =========================
-- Ask PostgREST to reload its schema cache
-- =========================
select pg_notify('pgrst', 'reload schema');