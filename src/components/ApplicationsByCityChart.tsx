import { useEffect, useRef } from 'react';

export type CityDatum = { city: string; total: number };

export default function ApplicationsByCityChart({ data }: { data: CityDatum[] }) {
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

      // Title inside chart with spacing
      const title = chart.children.unshift(
        am5.Label.new(root, {
          text: 'Top Cities by New Employment Approvals',
          fontSize: 18,
          fontWeight: '600',
          x: am5.p50,
          centerX: am5.p50,
          paddingBottom: 12
        })
      );

      // Increase chart height to accommodate better label spacing
      chart.set('height', 480);
      chart.set('paddingBottom', 28);
      // Add horizontal scrollbar to assist with many labels
      chart.set('scrollbarX', am5.Scrollbar.new(root, { orientation: 'horizontal' }));

      const xAxis = chart.xAxes.push(
        am5xy.CategoryAxis.new(root, {
          categoryField: 'city',
          renderer: am5xy.AxisRendererX.new(root, { 
            minGridDistance: 70,
            cellStartLocation: 0.1,
            cellEndLocation: 0.9
          })
        })
      );

      // Improve label readability: rotate and truncate
      const xRenderer: any = xAxis.get('renderer');
      xRenderer.labels.template.setAll({
        rotation: -40,
        centerY: am5.p50,
        paddingTop: 8,
        maxWidth: 90,
        textAlign: 'center',
        oversizedBehavior: 'truncate'
      });

      const yAxis = chart.yAxes.push(
        am5xy.ValueAxis.new(root, {
          renderer: am5xy.AxisRendererY.new(root, {})
        })
      );

      const series = chart.series.push(
        am5xy.ColumnSeries.new(root, {
          name: 'New Employment Approval',
          xAxis,
          yAxis,
          valueYField: 'total',
          categoryXField: 'city'
        })
      );
      series.columns.template.setAll({ strokeOpacity: 0, fillOpacity: 0.9 });
      series.columns.template.setAll({ tooltipText: '{categoryX}: {valueY.formatNumber("#,###")}' });

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
      .sort((a, b) => b.total - a.total)
      .map((d) => ({ city: String(d.city), total: d.total }));
    xAxis.data.setAll(items);
    series.data.setAll(items);
  }, [data]);

  return <div style={{ width: '100%', height: 480 }} ref={chartRef} />;
}


