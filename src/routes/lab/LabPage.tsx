import { Suspense, lazy, useMemo } from 'react';
import ErrorBoundary from '../../components/ErrorBoundary';

const ExperimentalContainer = lazy(() => import('../../app/(features)/experimental/Container'));

export default function LabPage() {
  const showNewWidget = useMemo(() => {
    const v = (import.meta as any).env?.NEXT_PUBLIC_SHOW_NEW_WIDGET || process.env.NEXT_PUBLIC_SHOW_NEW_WIDGET;
    return String(v).toLowerCase() === 'true';
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h2>Lab</h2>
      <p>Safe space to experiment with new components.</p>
      <ErrorBoundary>
        <Suspense fallback={<div>Loading experiment…</div>}>
          {showNewWidget ? (
            <ExperimentalContainer />
          ) : (
            <div style={{ color: '#666' }}>
              Experimental widget is hidden. Set NEXT_PUBLIC_SHOW_NEW_WIDGET=true to enable.
            </div>
          )}
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
