create table if not exists public.h1b_cases (
  id bigserial primary key,
  line_by_line text,
  fiscal_year integer,
  employer_name text,
  tax_id text,
  naics_code text,
  petitioner_city text,
  petitioner_state text,
  petitioner_zip text,
  new_employment_approval integer,
  new_employment_denial integer,
  continuation_approval integer,
  continuation_denial integer,
  change_same_employer_approval integer,
  change_same_employer_denial integer,
  new_concurrent_approval integer,
  new_concurrent_denial integer,
  change_of_employer_approval integer,
  change_of_employer_denial integer,
  amended_approval integer,
  amended_denial integer,
  employer_name_cleaned text,
  data_year integer,
  source_file text
);

-- Performance indexes for common filters/sorts
create index if not exists idx_h1b_fiscal_year on public.h1b_cases (fiscal_year);
create index if not exists idx_h1b_state on public.h1b_cases (petitioner_state);
create index if not exists idx_h1b_data_year on public.h1b_cases (data_year);
create index if not exists idx_h1b_naics on public.h1b_cases (naics_code);
create index if not exists idx_h1b_employer on public.h1b_cases (employer_name_cleaned);
