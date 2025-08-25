import { Suspense, lazy } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';

const LabPage = lazy(() => import('./routes/lab/LabPage'));

const router = createBrowserRouter([
  { path: '/', element: <App /> },
  {
    path: '/lab',
    element: (
      <Suspense fallback={<div>Loading…</div>}>
        <LabPage />
      </Suspense>
    ),
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
