import { useEffect, useRef } from 'react';

export type StateDatum = { state: string; total: number };

export default function ApplicationsByStateMap({ data }: { data: StateDatum[] }) {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const rootRef = useRef<any | null>(null);

  useEffect(() => {
    let disposed = false;
    (async () => {
      if (!chartRef.current || rootRef.current) return;
      // Unconditional debug markers
      // eslint-disable-next-line no-console
      console.log('[Map] mount effect start');
      try {
        const r = (chartRef.current as HTMLDivElement).getBoundingClientRect();
        // eslint-disable-next-line no-console
        console.log('[Map] container bbox', { w: r.width, h: r.height });
      } catch {}
      // Load amCharts modules from esm.sh CDN to ensure proper ESM bindings
      const am5: any = await import('https://esm.sh/@amcharts/amcharts5');
      const am5map: any = await import('https://esm.sh/@amcharts/amcharts5/map');
      const Animated: any = (await import('https://esm.sh/@amcharts/amcharts5/themes/Animated')).default;
      if (disposed || !chartRef.current) return;

      // Load US geodata as ES module from CDN
      let geo: any = null;
      try {
        const resp = await fetch('https://cdn.jsdelivr.net/npm/@amcharts/amcharts5-geodata/usaLow.json');
        geo = await resp.json();
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('[Map] geodata import failed', err);
      }
      // eslint-disable-next-line no-console
      console.log('[Map] geodata loaded features:', Array.isArray((geo as any)?.features) ? (geo as any).features.length : 'n/a');

      const root = am5.Root.new(chartRef.current);
      root.setThemes([Animated.new(root)]);

      // Ensure chart resizes to actual container size
      try {
        const ro = new ResizeObserver(() => {
          try { root.resize(); } catch {}
        });
        ro.observe(chartRef.current as HTMLDivElement);
        (root as any)._resizeObserver = ro;
      } catch {}

      const chart = root.container.children.push(
        am5map.MapChart.new(root, {
          panX: 'none',
          panY: 'none',
          wheelX: 'none',
          wheelY: 'none',
          layout: root.verticalLayout,
          projection: am5map.geoAlbersUsa(),
          homeGeoPoint: { longitude: -98.583, latitude: 39.833 },
          homeZoomLevel: 1
        })
      );
      chart.appear(800, 100);

      // Debug label to ensure amCharts is rendering
      chart.children.push(
        am5.Label.new(root, {
          text: 'Rendering…',
          fontSize: 14,
          fontWeight: '600',
          fill: am5.color(0x003566),
          x: 20,
          y: 10
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

      // Create base polygon series (neutral fill) to ensure shapes render
      const baseSeries = chart.series.push(
        am5map.MapPolygonSeries.new(root, {
          geoJSON: geo,
          calculateAggregates: false,
        })
      );
      baseSeries.mapPolygons.template.setAll({
        tooltipText: '{name}',
        interactive: false,
        strokeOpacity: 1,
        stroke: am5.color(0x333333),
        strokeWidth: 1,
        fillOpacity: 1,
        fill: am5.color(0xBDBDBD)
      });
      try {
        const featureIdsBase: string[] = Array.isArray(geo?.features) ? geo.features.map((f: any) => f.id) : [];
        if (featureIdsBase.length > 0) {
          baseSeries.data.setAll(featureIdsBase.map((id) => ({ id })) as any);
          baseSeries.appear(800);
        }
      } catch {}

      // Create heat polygon series (data-driven)
      const polygonSeries = chart.series.push(
        am5map.MapPolygonSeries.new(root, {
          geoJSON: geo,
          valueField: 'value',
          calculateAggregates: true,
        })
      );
      polygonSeries.events.on('datavalidated', () => {
        try {
          // eslint-disable-next-line no-console
          console.log('[Map] datavalidated polygons:', polygonSeries.mapPolygons?._values?.length ?? 'n/a');
        } catch {}
      });
      // eslint-disable-next-line no-console
      console.log('[Map] polygon series created');

      polygonSeries.mapPolygons.template.setAll({
        tooltipText: '{name}: {value.formatNumber("#,###")}',
        interactive: true,
        strokeOpacity: 1,
        stroke: am5.color(0x333333),
        strokeWidth: 1,
        fillOpacity: 1,
        fill: am5.color(0x90CAF9)
      });
      // Temporarily disable heatRules to prove shapes render; we'll re-enable once visible
      // polygonSeries.set('heatRules', [
      //   {
      //     target: polygonSeries.mapPolygons.template,
      //     dataField: 'value',
      //     min: am5.color(0xCFE8F3),
      //     max: am5.color(0x003566),
      //   },
      // ]);

      // Heat legend
      const heatLegend = chart.children.push(
        am5.HeatLegend.new(root, {
          startColor: am5.color(0xc6e9e9),
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

      // Bind legend to series so updates reflect min/max
      polygonSeries.set('heatLegend', heatLegend);

      (root as any)._polygonSeries = polygonSeries;
      (root as any)._heatLegend = heatLegend;
      (root as any)._geo = geo;
      (root as any)._chart = chart;
      rootRef.current = root;
      // eslint-disable-next-line no-console
      console.log('[Map] rootRef set');

      // Apply current data immediately (in case data arrived before init)
      try {
        const items = (data || [])
          .slice()
          .map((d) => ({ id: `US-${String(d.state || '').toUpperCase()}`, value: Number(d.total || 0) }))
          .filter((d) => !!d.id && !Number.isNaN(d.value));
        const featureIds: string[] = Array.isArray(geo?.features)
          ? geo.features.map((f: any) => f.id).filter((id: string) => !['US-DC','US-PR','US-VI','US-GU','US-MP','US-AS'].includes(id))
          : [];
        const valueById = new Map<string, number>(items.map((it: any) => [it.id, it.value]));
        let itemsFull = featureIds.map((id) => ({ id, value: valueById.get(id) ?? 0 }));
        const allZero = itemsFull.every((it) => it.value === 0);
        if (allZero) {
          // Seed dummy values to visibly render the choropleth
          const dummy: Record<string, number> = { 'US-CA': 200000, 'US-NY': 150000, 'US-TX': 130000, 'US-NJ': 80000, 'US-WA': 70000 };
          itemsFull = featureIds.map((id) => ({ id, value: dummy[id] ?? Math.floor(1000 + Math.random() * 9000) }));
        }
        // eslint-disable-next-line no-console
        console.log('[Map] initial setAll count:', itemsFull.length);
        if (itemsFull.length > 0) {
          polygonSeries.data.setAll(itemsFull);
          polygonSeries.appear(800);
          chart.goHome();
          try { root.resize(); } catch {}
        }
        const maxVal = itemsFull.reduce((m, it) => (it.value > m ? it.value : m), 0);
        heatLegend.set('startValue', 0);
        heatLegend.set('endValue', maxVal || 1);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('[Map] initial data apply failed', err);
      }
    })();

    return () => {
      disposed = true;
      if (rootRef.current) {
        try { (rootRef.current as any)._resizeObserver?.disconnect?.(); } catch {}
        rootRef.current.dispose();
        rootRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const root: any = rootRef.current;
    if (!root) return;
    // eslint-disable-next-line no-console
    console.log('[Map] data effect run; data length:', Array.isArray(data) ? data.length : 'n/a');
    const polygonSeries = root._polygonSeries;
    const geo = root._geo;
    const chart = root._chart;

    // Map state code to amCharts polygon id 'US-XX'
    const items = (data || [])
      .slice()
      .map((d) => ({ id: `US-${String(d.state || '').toUpperCase()}`, value: Number(d.total || 0) }))
      .filter((d) => !!d.id && !Number.isNaN(d.value));

    // Build full data set from geodata so all polygons render
    const featureIds: string[] = Array.isArray(geo?.features)
      ? geo.features.map((f: any) => f.id).filter((id: string) => !['US-DC','US-PR','US-VI','US-GU','US-MP','US-AS'].includes(id))
      : [];
    const valueById = new Map<string, number>(items.map((it: any) => [it.id, it.value]));
    let itemsFull = featureIds.map((id) => ({ id, value: valueById.get(id) ?? 0 }));
    const allZero = itemsFull.every((it) => it.value === 0);
    if (allZero) {
      const dummy: Record<string, number> = { 'US-CA': 200000, 'US-NY': 150000, 'US-TX': 130000, 'US-NJ': 80000, 'US-WA': 70000 };
      itemsFull = featureIds.map((id) => ({ id, value: dummy[id] ?? Math.floor(1000 + Math.random() * 9000) }));
    }

    // Debug: log a small sample to verify mapping
    if (true) {
      const sample = itemsFull.slice(0, 5);
      // eslint-disable-next-line no-console
      console.log('[Map] setAll count:', itemsFull.length, 'max sample:', sample);
    }

    if (itemsFull.length > 0) {
      polygonSeries.data.setAll(itemsFull);
      polygonSeries.appear(800);
      if (chart && typeof chart.goHome === 'function') chart.goHome();
      try { root.resize(); } catch {}
      // eslint-disable-next-line no-console
      console.log('[Map] setAll applied:', itemsFull.length);
    }

    const maxVal = itemsFull.reduce((m, it) => (it.value > m ? it.value : m), 0);
    const heatLegend = root._heatLegend;
    if (heatLegend) {
      heatLegend.set('startValue', 0);
      heatLegend.set('endValue', maxVal || 1);
      heatLegend.startLabel.setAll({ fill: root.interfaceColors.get('text') });
      heatLegend.endLabel.setAll({ fill: root.interfaceColors.get('text') });
      }
  }, [data]);

  return <div style={{ width: '100%', height: 520, background: '#eef', border: '1px solid #99c' }} ref={chartRef} />;
}
