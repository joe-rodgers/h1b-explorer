import fs from 'node:fs'
import path from 'node:path'
import { Client } from 'pg'
import { from as copyFrom } from 'pg-copy-streams'

async function main() {
  const csvPath = process.env.H1B_CSV_PATH || 'C:/Projects/h1b/data/outputs/production/H1B_MASTER_DATASET_2009_2025.csv'
  const host = 'db.aqoftkhldudhmgeawmcg.supabase.co'
  const port = 5432
  const database = 'postgres'
  const user = 'postgres'
  const password = process.env.PGPASSWORD || ''

  if (!password) {
    console.error('Missing PGPASSWORD in env. Aborting.')
    process.exit(1)
  }

  if (!fs.existsSync(csvPath)) {
    console.error('CSV not found at', csvPath)
    process.exit(1)
  }

  const client = new Client({ host, port, database, user, password, ssl: { rejectUnauthorized: false } })
  await client.connect()
  console.log('Connected to Supabase Postgres')

  // Turn off constraints for faster load (within transaction)
  await client.query('begin')
  try {
    // 1) Create staging table with all columns as TEXT for safe load
    await client.query(`
      create table if not exists public.h1b_cases_staging (
        line_by_line text,
        fiscal_year text,
        employer_name text,
        tax_id text,
        naics_code text,
        petitioner_city text,
        petitioner_state text,
        petitioner_zip text,
        new_employment_approval text,
        new_employment_denial text,
        continuation_approval text,
        continuation_denial text,
        change_same_employer_approval text,
        change_same_employer_denial text,
        new_concurrent_approval text,
        new_concurrent_denial text,
        change_of_employer_approval text,
        change_of_employer_denial text,
        amended_approval text,
        amended_denial text,
        employer_name_cleaned text,
        data_year text,
        source_file text
      );
      truncate table public.h1b_cases_staging;
    `)

    const stream = client.query(copyFrom(`COPY public.h1b_cases_staging (
      line_by_line,
      fiscal_year,
      employer_name,
      tax_id,
      naics_code,
      petitioner_city,
      petitioner_state,
      petitioner_zip,
      new_employment_approval,
      new_employment_denial,
      continuation_approval,
      continuation_denial,
      change_same_employer_approval,
      change_same_employer_denial,
      new_concurrent_approval,
      new_concurrent_denial,
      change_of_employer_approval,
      change_of_employer_denial,
      amended_approval,
      amended_denial,
      employer_name_cleaned,
      data_year,
      source_file
    ) FROM STDIN WITH (FORMAT csv, HEADER true, DELIMITER ',', QUOTE '"', ENCODING 'UTF8', NULL '')`))

    const fileStream = fs.createReadStream(path.resolve(csvPath))
    let bytes = 0
    fileStream.on('data', (chunk) => {
      bytes += chunk.length
      if (bytes % (50 * 1024 * 1024) < chunk.length) {
        console.log(` streamed ${(bytes / (1024 * 1024)).toFixed(1)} MB`)
      }
    })

    await new Promise<void>((resolve, reject) => {
      fileStream.pipe(stream)
        .on('finish', resolve)
        .on('error', reject)
    })

    console.log('Staging COPY completed, transforming into final table...')
    // 2) Move from staging into final table with numeric cleanup
    await client.query(`
      insert into public.h1b_cases (
        line_by_line,
        fiscal_year,
        employer_name,
        tax_id,
        naics_code,
        petitioner_city,
        petitioner_state,
        petitioner_zip,
        new_employment_approval,
        new_employment_denial,
        continuation_approval,
        continuation_denial,
        change_same_employer_approval,
        change_same_employer_denial,
        new_concurrent_approval,
        new_concurrent_denial,
        change_of_employer_approval,
        change_of_employer_denial,
        amended_approval,
        amended_denial,
        employer_name_cleaned,
        data_year,
        source_file
      )
      select
        line_by_line,
        nullif(regexp_replace(fiscal_year, '[^0-9-]', '', 'g'), '')::int,
        employer_name,
        tax_id,
        naics_code,
        petitioner_city,
        petitioner_state,
        petitioner_zip,
        nullif(regexp_replace(new_employment_approval, '[^0-9-]', '', 'g'), '')::int,
        nullif(regexp_replace(new_employment_denial, '[^0-9-]', '', 'g'), '')::int,
        nullif(regexp_replace(continuation_approval, '[^0-9-]', '', 'g'), '')::int,
        nullif(regexp_replace(continuation_denial, '[^0-9-]', '', 'g'), '')::int,
        nullif(regexp_replace(change_same_employer_approval, '[^0-9-]', '', 'g'), '')::int,
        nullif(regexp_replace(change_same_employer_denial, '[^0-9-]', '', 'g'), '')::int,
        nullif(regexp_replace(new_concurrent_approval, '[^0-9-]', '', 'g'), '')::int,
        nullif(regexp_replace(new_concurrent_denial, '[^0-9-]', '', 'g'), '')::int,
        nullif(regexp_replace(change_of_employer_approval, '[^0-9-]', '', 'g'), '')::int,
        nullif(regexp_replace(change_of_employer_denial, '[^0-9-]', '', 'g'), '')::int,
        nullif(regexp_replace(amended_approval, '[^0-9-]', '', 'g'), '')::int,
        nullif(regexp_replace(amended_denial, '[^0-9-]', '', 'g'), '')::int,
        employer_name_cleaned,
        nullif(regexp_replace(data_year, '[^0-9-]', '', 'g'), '')::int,
        source_file
      from public.h1b_cases_staging;
    `)
    await client.query('commit')
    console.log('Import completed successfully')
  } catch (e) {
    await client.query('rollback')
    console.error('COPY failed', e)
    process.exit(1)
  } finally {
    await client.end()
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
