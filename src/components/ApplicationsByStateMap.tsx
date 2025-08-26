import { useEffect, useRef } from 'react';

export type StateDatum = { state: string; total: number };

export default function ApplicationsByStateMap({ data }: { data: StateDatum[] }) {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const rootRef = useRef<any | null>(null);

  useEffect(() => {
    let disposed = false;
    (async () => {
      if (!chartRef.current || rootRef.current) return;
      // Load amCharts modules from esm.sh CDN to ensure proper ESM bindings
      const am5: any = await import('https://esm.sh/@amcharts/amcharts5');
      const am5map: any = await import('https://esm.sh/@amcharts/amcharts5/map');
      const Animated: any = (await import('https://esm.sh/@amcharts/amcharts5/themes/Animated')).default;
      if (disposed || !chartRef.current) return;

      // Load US geodata as ES module from CDN
      const geodataMod: any = await import('https://esm.sh/@amcharts/amcharts5-geodata/usaLow');
      const geo = (geodataMod as any).default || geodataMod;

      const root = am5.Root.new(chartRef.current);
      root.setThemes([Animated.new(root)]);

      const chart = root.container.children.push(
        am5map.MapChart.new(root, {
          panX: 'none',
          panY: 'none',
          wheelX: 'none',
          wheelY: 'none',
          layout: root.verticalLayout,
          projection: am5map.geoAlbersUsa(),
        })
      );

      // Title
      chart.children.unshift(
        am5.Label.new(root, {
          text: 'New Employment Approvals by State (Map)',
          fontSize: 18,
          fontWeight: '600',
          x: am5.p50,
          centerX: am5.p50,
          paddingBottom: 12
        })
      );

      // Create polygon series
      const polygonSeries = chart.series.push(
        am5map.MapPolygonSeries.new(root, {
          geoJSON: geo,
          valueField: 'value',
        })
      );

      polygonSeries.mapPolygons.template.setAll({
        tooltipText: '{name}: {value.formatNumber("#,###")}',
        interactive: true,
        strokeOpacity: 0.8,
        strokeWidth: 0.5,
      });

      polygonSeries.set('heatRules', [
        {
          target: polygonSeries.mapPolygons.template,
          dataField: 'value',
          min: am5.color(0xe0f3f3),
          max: am5.color(0x006d77),
        },
      ]);

      // Heat legend
      const heatLegend = chart.children.push(
        am5.HeatLegend.new(root, {
          startColor: am5.color(0xe0f3f3),
          endColor: am5.color(0x006d77),
          startText: 'Low',
          endText: 'High',
          orientation: 'horizontal',
          width: am5.percent(80),
          x: am5.p50,
          centerX: am5.p50,
          paddingTop: 8
        })
      );

      (root as any)._polygonSeries = polygonSeries;
      (root as any)._heatLegend = heatLegend;
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
    const polygonSeries = root._polygonSeries;

    // Map state code to amCharts polygon id 'US-XX'
    const items = (data || [])
      .slice()
      .map((d) => ({ id: `US-${String(d.state || '').toUpperCase()}`, value: Number(d.total || 0) }))
      .filter((d) => !!d.id && !Number.isNaN(d.value));

    polygonSeries.data.setAll(items);

    const maxVal = items.reduce((m, it) => (it.value > m ? it.value : m), 0);
    const heatLegend = root._heatLegend;
    if (heatLegend) {
      heatLegend.set('startValue', 0);
      heatLegend.set('endValue', maxVal || 1);
      heatLegend.labels.values.forEach((l: any) => l.set('fill', root.interfaceColors.get('text')));
    }
  }, [data]);

  return <div style={{ width: '100%', height: 520 }} ref={chartRef} />;
}
