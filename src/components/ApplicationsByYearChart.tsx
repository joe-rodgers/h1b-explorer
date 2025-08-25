import { useEffect, useRef } from 'react';
import * as am5 from '@amcharts/amcharts5';
import * as am5xy from '@amcharts/amcharts5/xy';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';

export type YearDatum = { year: number; total: number };

export default function ApplicationsByYearChart({ data }: { data: YearDatum[] }) {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const rootRef = useRef<am5.Root | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    // init once
    if (!rootRef.current) {
      const root = am5.Root.new(chartRef.current);
      root.setThemes([am5themes_Animated.new(root)]);

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
          renderer: am5xy.AxisRendererX.new(root, { minGridDistance: 30 })
        })
      );

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

      // store on root for updates
      (root as any)._xAxis = xAxis;
      (root as any)._series = series;

      rootRef.current = root;
    }
    return () => {
      // cleanup on unmount
      // keep chart across updates; root is disposed in parent lifecycle if needed
    };
  }, []);

  useEffect(() => {
    const root = rootRef.current as any;
    if (!root) return;
    const xAxis: am5xy.CategoryAxis<am5.AxisRenderer> = root._xAxis;
    const series: am5xy.ColumnSeries = root._series;

    const items = data
      .slice()
      .sort((a, b) => a.year - b.year)
      .map((d) => ({ year: String(d.year), total: d.total }));

    const ds = am5.Data.new(root, items);
    xAxis.data.setAll(items);
    series.data.setAll(items);
  }, [data]);

  return <div style={{ width: '100%', height: 300 }} ref={chartRef} />;
}
