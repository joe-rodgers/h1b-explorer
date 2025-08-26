import React, { useMemo, useState, useEffect, useRef, lazy, Suspense } from 'react';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef, IGetRowsParams, GridApi } from 'ag-grid-community';
// AG Grid v34 requires base CSS plus theme CSS when using legacy themes
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
const ApplicationsByYearChart = lazy(() => import('./ApplicationsByYearChart'));
const ApplicationsByStateChart = lazy(() => import('./ApplicationsByStateChart'));
const ApplicationsByCityChart = lazy(() => import('./ApplicationsByCityChart'));
const ApplicationsByEmployerChart = lazy(() => import('./ApplicationsByEmployerChart'));
const ApplicationsByStateMap = lazy(() => import('./ApplicationsByStateMap'));

interface H1BRecord { [key: string]: any }

import { createClient } from '@supabase/supabase-js'
// Vite exposes env via import.meta.env in runtime; add type fallbacks for build
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL
const supabaseAnon = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseAnon)

const H1BDataGrid: React.FC = () => {
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [yearSeries, setYearSeries] = useState<{ year: number; total: number }[]>([]);
  const [stateSeries, setStateSeries] = useState<{ state: string; total: number }[]>([]);
  const [citySeries, setCitySeries] = useState<{ city: string; total: number }[]>([]);
  const [employerSeries, setEmployerSeries] = useState<{ employer: string; total: number }[]>([]);
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [selectedYears, setSelectedYears] = useState<number[]>([]);
  const gridApiRef = useRef<GridApi | null>(null);

  // Year domains to avoid full-table scans on initial load
  const YEARS_ALL = useMemo(() => Array.from({ length: 2025 - 2009 + 1 }, (_, i) => 2009 + i), []);
  const YEARS_DEFAULT = useMemo(() => YEARS_ALL.slice(-11), [YEARS_ALL]); // 2015..2025

  // Column definitions mapped to Supabase (snake_case) schema
  const columnDefs: ColDef[] = [
    { field: 'fiscal_year', headerName: 'Fiscal Year', sortable: true, filter: 'agNumberColumnFilter', filterParams: { filterOptions: ['equals','lessThan','greaterThan'] } },
    { field: 'employer_name', headerName: 'Employer Name', sortable: true, filter: 'agTextColumnFilter', cellStyle: { textAlign: 'left' } },
    { field: 'naics_code', headerName: 'NAICS Code', sortable: true, filter: 'agTextColumnFilter' },
    { field: 'petitioner_city', headerName: 'City', sortable: true, filter: 'agTextColumnFilter' },
    { field: 'petitioner_state', headerName: 'State', sortable: true, filter: 'agTextColumnFilter' },
    { field: 'new_employment_approval', headerName: 'New Employment Approval', sortable: true, filter: 'agNumberColumnFilter', filterParams: { filterOptions: ['greaterThan','equals','lessThan'] } }
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
        // Use planned count and select only visible columns to reduce query cost
        let query = supabase
          .from('h1b_cases')
          .select('id,fiscal_year,employer_name,naics_code,petitioner_city,petitioner_state,new_employment_approval', { count: 'planned' })

        // External filters: years and states
        if (selectedYears.length > 0) {
          query = query.in('fiscal_year', selectedYears)
        }
        if (selectedStates.length > 0) {
          query = query.in('petitioner_state', selectedStates)
        }

        // Filtering (map AG Grid filter model to Supabase)
        const fm = params.filterModel as Record<string, any>
        const textCols = new Set(['line_by_line','employer_name','tax_id','naics_code','petitioner_city','petitioner_state','petitioner_zip','source_file'])
        const numberCols = new Set(['fiscal_year','new_employment_approval','data_year'])

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
  }), [selectedYears, selectedStates])

  // (unused param kept for future extension and to match existing calls)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  

  // Fetch aggregated year series via RPC
  const fetchYearAggregate = async (_fm?: Record<string, any>) => {
    try {
      const years = selectedYears.length ? selectedYears : YEARS_DEFAULT;
      const states = selectedStates.length ? selectedStates : null;
      const { data, error } = await supabase.rpc('h1b_sum_by_year_states', { years, states });
      if (error || !Array.isArray(data)) { console.error('fetchYearAggregate RPC error', error); setYearSeries([]); return; }
      const series = (data as any[]).map((r) => ({ year: Number((r as any).year ?? (r as any).fiscal_year), total: Number((r as any).total || 0) }));
      setYearSeries(series);
    } catch (e) { console.error('fetchYearAggregate RPC exception', e); setYearSeries([]); }
  };

  // Fetch state aggregate via RPC
  const fetchStateAggregate = async (_fm?: Record<string, any>) => {
    try {
      const years = selectedYears.length ? selectedYears : YEARS_DEFAULT;
      const states = selectedStates.length ? selectedStates : null;
      const { data, error } = await supabase.rpc('h1b_sum_by_state_filtered', { years, states });
      if (error || !Array.isArray(data)) { console.error('fetchStateAggregate RPC error', error); setStateSeries([]); return; }
      const series = (data as any[])
        .map((r) => ({
          state: String(((r as any).state ?? (r as any).petitioner_state) || ''),
          total: Number((r as any).total || 0)
        }))
        .filter((d) => !!d.state);
      setStateSeries(series);
    } catch (e) { console.error('fetchStateAggregate RPC exception', e); setStateSeries([]); }
  }

  // Fetch top cities aggregate
  const fetchTopCities = async () => {
    try {
      const years = selectedYears.length ? selectedYears : YEARS_DEFAULT;
      const states = selectedStates.length ? selectedStates : null;
      
      // Prevent loading cities when too many states are selected (could cause timeout)
      if (states && states.length > 10) {
        console.log('Too many states selected, skipping cities load to prevent timeout');
        setCitySeries([]);
        return;
      }
      
      const { data, error } = await supabase.rpc('h1b_top_cities', { years, states });
      if (error || !Array.isArray(data)) { console.error('fetchTopCities RPC error', error); setCitySeries([]); return; }
      const series = (data as any[])
        .map((r) => ({ city: String((r as any).city || ''), total: Number((r as any).total || 0) }))
        .filter((d) => !!d.city);
      setCitySeries(series);
    } catch (e) { console.error('fetchTopCities RPC exception', e); setCitySeries([]); }
  }

  // Fetch top employers aggregate
  const fetchTopEmployers = async () => {
    try {
      const years = selectedYears.length ? selectedYears : YEARS_DEFAULT;
      const states = selectedStates.length ? selectedStates : null;
      const { data, error } = await supabase.rpc('h1b_top_employers', { years, states });
      if (error || !Array.isArray(data)) { console.error('fetchTopEmployers RPC error', error); setEmployerSeries([]); return; }
      const series = (data as any[])
        .map((r) => ({ employer: String((r as any).employer || ''), total: Number((r as any).total || 0) }))
        .filter((d) => !!d.employer);
      setEmployerSeries(series);
    } catch (e) { console.error('fetchTopEmployers RPC exception', e); setEmployerSeries([]); }
  }

  // initial aggregate
  useEffect(() => { fetchYearAggregate(); fetchStateAggregate(); fetchTopCities(); fetchTopEmployers(); }, []);

  // Refresh charts when external year buttons change (uses current grid filters)
  useEffect(() => {
    const fm = gridApiRef.current?.getFilterModel() as any;
    fetchYearAggregate(fm);
    fetchStateAggregate(fm);
    fetchTopCities();
    fetchTopEmployers();
  }, [selectedYears, selectedStates]);

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
        <p className="grid-info">Use the buttons to filter by Fiscal Year. Multiple years can be selected; charts will update too.</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
          {Array.from({ length: 2025 - 2009 + 1 }, (_, i) => 2009 + i).map((y) => {
            const active = selectedYears.includes(y);
            return (
              <button
                key={y}
                onClick={() => {
                  setSelectedYears((prev) => (prev.includes(y) ? prev.filter((v) => v !== y) : [...prev, y]));
                }}
                style={{
                  padding: '6px 10px',
                  borderRadius: 6,
                  border: active ? '2px solid #004F54' : '1px solid #bbb',
                  background: active ? '#FBA765' : '#F1EFE8',
                  color: '#102C33',
                  cursor: 'pointer'
                }}
              >
                {y}
              </button>
            );
          })}
          <button
            onClick={() => setSelectedYears([])}
            style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #bbb', background: '#fff', cursor: 'pointer' }}
          >
            Clear
          </button>
        </div>
        <div style={{ marginTop: 4, marginBottom: 8 }}>
          <p className="grid-info">Filter by State (click to toggle). Multiple states can be selected.</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC','PR','VI','GU','MP']
              .sort()
              .map((s) => {
                const active = selectedStates.includes(s);
                return (
                  <button
                    key={s}
                    onClick={() => setSelectedStates((prev) => (prev.includes(s) ? prev.filter((v) => v !== s) : [...prev, s]))}
                    style={{
                      padding: '4px 8px',
                      borderRadius: 6,
                      border: active ? '2px solid #004F54' : '1px solid #bbb',
                      background: active ? '#A1E3D8' : '#F1EFE8',
                      color: '#102C33',
                      cursor: 'pointer'
                    }}
                  >
                    {s}
                  </button>
                );
              })}
            <button
              onClick={() => setSelectedStates([])}
              style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #bbb', background: '#fff', cursor: 'pointer' }}
            >
              Clear
            </button>
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
          <Suspense fallback={null}>
            <ApplicationsByYearChart data={yearSeries} />
          </Suspense>
        </div>
        {selectedYears.length === 0 && (
          <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
            Showing recent years by default for performance. Select years above to change.
          </div>
        )}
        <div style={{ marginTop: 12 }}>
          <Suspense fallback={null}>
            <ApplicationsByStateChart data={stateSeries} />
          </Suspense>
        </div>
        <div style={{ marginTop: 12 }}>
          <Suspense fallback={null}>
            <ApplicationsByStateMap data={stateSeries} />
          </Suspense>
        </div>
        <div style={{ marginTop: 12 }}>
          {selectedStates.length > 10 && (
            <div style={{ 
              padding: '8px 12px', 
              backgroundColor: '#fff3cd', 
              border: '1px solid #ffeaa7', 
              borderRadius: '4px', 
              marginBottom: '8px',
              fontSize: '14px',
              color: '#856404'
            }}>
              ⚠️ Cities chart hidden: Too many states selected (limit: 10). Reduce state selection to see cities data.
            </div>
          )}
          <Suspense fallback={null}>
            <ApplicationsByCityChart data={citySeries} />
          </Suspense>
        </div>
        <div style={{ marginTop: 12 }}>
          <Suspense fallback={null}>
            <ApplicationsByEmployerChart data={employerSeries} />
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
            // Apply default filter: show rows with New Employment Approval > 0
            params.api.setFilterModel({
              new_employment_approval: { type: 'greaterThan', filter: 0 }
            });
            params.api.sizeColumnsToFit();
            const fm = params.api.getFilterModel() as any;
            fetchYearAggregate(fm);
            fetchStateAggregate(fm);
            gridApiRef.current = params.api;
          }}
          onFilterChanged={(e) => {
            const fm = e.api.getFilterModel();
            if ((window as any).__aggTimer) clearTimeout((window as any).__aggTimer);
            (window as any).__aggTimer = setTimeout(() => {
              fetchYearAggregate(fm as any);
              fetchStateAggregate(fm as any);
            }, 250);
          }}
        />
      </div>
    </div>
  );
};

export default H1BDataGrid;
