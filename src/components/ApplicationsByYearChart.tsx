import { useEffect, useRef } from 'react';

export type YearDatum = { year: number; total: number };

export default function ApplicationsByYearChart({ data }: { data: YearDatum[] }) {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const rootRef = useRef<any | null>(null);

  useEffect(() => {
    let disposed = false;
    (async () => {
      if (!chartRef.current || rootRef.current) return;
      const am5 = await import('@amcharts/amcharts5');
      const am5xy = await import('@amcharts/amcharts5/xy');
      const { default: Animated } = await import('@amcharts/amcharts5/themes/Animated');
      if (disposed || !chartRef.current) return;

      const root = am5.Root.new(chartRef.current);
      root.setThemes([Animated.new(root)]);

      const chart = root.container.children.push(
        am5xy.XYChart.new(root, {
          layout: root.verticalLayout,
          panX: false,
          panY: false,
          wheelX: 'none',
          wheelY: 'none',
        })
      );

      const xAxis = chart.xAxes.push(
        am5xy.CategoryAxis.new(root, {
          categoryField: 'year',
          renderer: am5xy.AxisRendererX.new(root, { 
            minGridDistance: 35,
            cellStartLocation: 0.1,
            cellEndLocation: 0.9
          })
        })
      );

      // Increase chart height for consistency
      chart.set('height', 400);

      const yAxis = chart.yAxes.push(
        am5xy.ValueAxis.new(root, {
          renderer: am5xy.AxisRendererY.new(root, {})
        })
      );

      const series = chart.series.push(
        am5xy.ColumnSeries.new(root, {
          name: 'Applications',
          xAxis,
          yAxis,
          valueYField: 'total',
          categoryXField: 'year'
        })
      );
      series.columns.template.setAll({ strokeOpacity: 0, fillOpacity: 0.9 });

      ;(root as any)._xAxis = xAxis;
      ;(root as any)._series = series;
      rootRef.current = root;
    })();

    return () => {
      disposed = true;
      if (rootRef.current) {
        rootRef.current.dispose();
        rootRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const root: any = rootRef.current;
    if (!root) return;
    const xAxis = root._xAxis;
    const series = root._series;
    const items = (data || [])
      .slice()
      .sort((a, b) => a.year - b.year)
      .map((d) => ({ year: String(d.year), total: d.total }));
    if (items.length === 0) {
      xAxis.data.setAll([]);
      series.data.setAll([]);
      return;
    }
    xAxis.data.setAll(items);
    series.data.setAll(items);
  }, [data]);

  return <div style={{ width: '100%', height: 400 }} ref={chartRef} />;
}
