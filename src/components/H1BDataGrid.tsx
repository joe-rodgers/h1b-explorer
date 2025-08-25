import React, { useMemo, useState, useEffect, lazy, Suspense } from 'react';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef, IGetRowsParams } from 'ag-grid-community';
// AG Grid v34 requires base CSS plus theme CSS when using legacy themes
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
const ApplicationsByYearChart = lazy(() => import('./ApplicationsByYearChart'));

interface H1BRecord { [key: string]: any }

import { createClient } from '@supabase/supabase-js'
// Vite exposes env via import.meta.env in runtime; add type fallbacks for build
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL
const supabaseAnon = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseAnon)

const H1BDataGrid: React.FC = () => {
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [yearSeries, setYearSeries] = useState<{ year: number; total: number }[]>([]);

  // Column definitions mapped to Supabase (snake_case) schema
  const columnDefs: ColDef[] = [
    { field: 'fiscal_year', headerName: 'Fiscal Year', sortable: true, filter: 'agNumberColumnFilter', filterParams: { filterOptions: ['equals','lessThan','greaterThan'] } },
    { field: 'employer_name', headerName: 'Employer Name', sortable: true, filter: 'agTextColumnFilter', cellStyle: { textAlign: 'left' } },
    { field: 'tax_id', headerName: 'Tax ID', sortable: true, filter: 'agTextColumnFilter' },
    { field: 'naics_code', headerName: 'NAICS Code', sortable: true, filter: 'agTextColumnFilter' },
    { field: 'petitioner_city', headerName: 'City', sortable: true, filter: 'agTextColumnFilter' },
    { field: 'petitioner_state', headerName: 'State', sortable: true, filter: 'agTextColumnFilter' },
    { field: 'new_employment_approval', headerName: 'New Employment Approval', sortable: true, filter: 'agNumberColumnFilter' },
    { field: 'new_employment_denial', headerName: 'New Employment Denial', sortable: true, filter: 'agNumberColumnFilter' },
    { field: 'continuation_approval', headerName: 'Continuation Approval', sortable: true, filter: 'agNumberColumnFilter' },
    { field: 'continuation_denial', headerName: 'Continuation Denial', sortable: true, filter: 'agNumberColumnFilter' }
  ];

  // Infinite row model datasource fetching from Supabase
  const datasource = useMemo(() => ({
    getRows: async (params: IGetRowsParams) => {
      try {
        const pageStart = params.startRow
        const pageEnd = params.endRow - 1
        // const pageSize = params.endRow - params.startRow

        // Sorting
        const sortModel = params.sortModel?.[0]
        let query = supabase.from('h1b_cases').select('*', { count: 'exact' })

        // Filtering (map AG Grid filter model to Supabase)
        const fm = params.filterModel as Record<string, any>
        const textCols = new Set(['line_by_line','employer_name','tax_id','naics_code','petitioner_city','petitioner_state','petitioner_zip','source_file'])
        const numberCols = new Set(['fiscal_year','new_employment_approval','new_employment_denial','continuation_approval','continuation_denial','data_year'])

        const applySingle = (colId: string, model: any) => {
          if (!model) return
          const type = model.type as string
          const raw = model.filter
          if (textCols.has(colId)) {
            const term = String(raw ?? '').trim()
            if (!term) return
            if (type === 'equals') query = query.eq(colId, term)
            else if (type === 'startsWith') query = query.ilike(colId, `${term}%`)
            else if (type === 'endsWith') query = query.ilike(colId, `%${term}`)
            else query = query.ilike(colId, `%${term}%`)
          } else if (numberCols.has(colId)) {
            const num = parseInt(String(raw ?? '').replace(/[^0-9-]/g, ''), 10)
            if (Number.isNaN(num)) return
            if (type === 'lessThan') query = query.lt(colId, num)
            else if (type === 'greaterThan') query = query.gt(colId, num)
            else query = query.eq(colId, num)
          }
        }

        if (fm && Object.keys(fm).length) {
          for (const [colId, model] of Object.entries(fm)) {
            if (model?.operator && Array.isArray(model?.conditions)) {
              const conds = model.conditions.filter(Boolean)
              if (model.operator === 'OR' && conds.length === 2) {
                const build = (m: any) => {
                  if (textCols.has(colId)) {
                    const term = String(m.filter ?? '').trim()
                    if (!term) return ''
                    if (m.type === 'equals') return `${colId}.eq.${term}`
                    if (m.type === 'startsWith') return `${colId}.ilike.${term}%`
                    if (m.type === 'endsWith') return `${colId}.ilike.%${term}`
                    return `${colId}.ilike.%${term}%`
                  } else if (numberCols.has(colId)) {
                    const num = parseInt(String(m.filter ?? '').replace(/[^0-9-]/g, ''), 10)
                    if (Number.isNaN(num)) return ''
                    if (m.type === 'lessThan') return `${colId}.lt.${num}`
                    if (m.type === 'greaterThan') return `${colId}.gt.${num}`
                    return `${colId}.eq.${num}`
                  }
                  return ''
                }
                const e1 = build(conds[0])
                const e2 = build(conds[1])
                const orStr = [e1, e2].filter(Boolean).join(',')
                if (orStr) query = query.or(orStr)
              } else {
                applySingle(colId, conds[0])
              }
            } else {
              applySingle(colId, model)
            }
          }
        }

        if (sortModel) {
          query = query.order(sortModel.colId, { ascending: sortModel.sort === 'asc' })
        }

        // Range (pagination)
        query = query.range(pageStart, pageEnd)

        const { data, error, count } = await query
        if (error) throw error
        if (typeof count === 'number') {
          setTotalCount(count)
        }
        params.successCallback(data as H1BRecord[], count ?? 0)
      } catch (e) {
        console.error(e)
        params.failCallback()
      }
    }
  }), [])

  // Helper to apply basic filters to a Supabase query (no OR handling for simplicity)
  const applyFiltersToQuery = (query: any, fm: Record<string, any> | undefined) => {
    if (!fm) return query;
    const textCols = new Set(['line_by_line','employer_name','tax_id','naics_code','petitioner_city','petitioner_state','petitioner_zip','source_file']);
    const numberCols = new Set(['fiscal_year','new_employment_approval','new_employment_denial','continuation_approval','continuation_denial','data_year']);
    for (const [colId, model] of Object.entries(fm)) {
      if (!model) continue;
      const m = (model as any).operator ? (model as any).conditions?.[0] : model;
      if (!m) continue;
      const type = String(m.type || '').toLowerCase();
      const raw = m.filter;
      if (textCols.has(colId)) {
        const term = String(raw ?? '').trim();
        if (!term) continue;
        if (type === 'equals') query = query.eq(colId, term);
        else if (type === 'startswith') query = query.ilike(colId, `${term}%`);
        else if (type === 'endswith') query = query.ilike(colId, `%${term}`);
        else query = query.ilike(colId, `%${term}%`);
      } else if (numberCols.has(colId)) {
        const num = parseInt(String(raw ?? '').replace(/[^0-9-]/g, ''), 10);
        if (Number.isNaN(num)) continue;
        if (type === 'lessthan') query = query.lt(colId, num);
        else if (type === 'greaterthan') query = query.gt(colId, num);
        else query = query.eq(colId, num);
      }
    }
    return query;
  };

  // Fetch aggregated year series respecting current filters (limited sample for safety)
  const fetchYearAggregate = async (fm?: Record<string, any>) => {
    try {
      let query = supabase.from('h1b_cases').select('fiscal_year').limit(5000);
      query = applyFiltersToQuery(query, fm);
      const { data, error } = await query;
      if (error || !Array.isArray(data)) { setYearSeries([]); return; }
      const agg = new Map<number, number>();
      for (const r of data as any[]) {
        const y = Number(r.fiscal_year);
        if (Number.isFinite(y)) agg.set(y, (agg.get(y) ?? 0) + 1);
      }
      const series = Array.from(agg.entries()).map(([year, total]) => ({ year, total })).sort((a,b)=>a.year-b.year);
      setYearSeries(series);
    } catch { setYearSeries([]); }
  };

  // initial aggregate
  useEffect(() => { fetchYearAggregate(); }, []);

  return (
    <div className="h1b-grid-container">
      <div className="grid-header">
        <h2>H1B Visa Data Explorer (2009-2025)</h2>
        <div className="grid-stats">
          <span>Total Records: {totalCount?.toLocaleString() ?? '…'}</span>
          <span>Columns: {columnDefs.length}</span>
        </div>
      </div>
      
      <div className="grid-controls">
        <p className="grid-info">This grid displays H1B visa application data with sorting, filtering, and pagination capabilities. The chart below will summarize total applications by year without affecting grid performance.</p>
        <div style={{ marginTop: 12 }}>
          <Suspense fallback={null}>
            <ApplicationsByYearChart data={yearSeries} />
          </Suspense>
        </div>
      </div>
      
      <div className="ag-theme-alpine" style={{ height: '700px', width: '100%' }}>
        <AgGridReact
          rowModelType="infinite"
          datasource={datasource as any}
          cacheBlockSize={25}
          columnDefs={columnDefs}
          pagination={true}
          paginationPageSize={25}
          paginationPageSizeSelector={[25, 50, 100, 200]}
          theme="legacy"
          defaultColDef={{
            sortable: true,
            filter: true,
            resizable: true,
            floatingFilter: true,
            flex: 1
          }}
          onGridReady={(params) => {
            console.log('Grid ready event fired');
            params.api.sizeColumnsToFit();
            fetchYearAggregate(params.api.getFilterModel() as any);
          }}
          onFilterChanged={(e) => {
            const fm = e.api.getFilterModel();
            fetchYearAggregate(fm as any);
          }}
        />
      </div>
    </div>
  );
};

export default H1BDataGrid;
