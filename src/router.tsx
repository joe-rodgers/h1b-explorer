import { Suspense, lazy } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';

const About = lazy(() => import('./routes/About'));
const Contact = lazy(() => import('./routes/Contact'));

const router = createBrowserRouter([
  { path: '/', element: <App /> },
  { path: '/about', element: <Suspense fallback={<div>Loading…</div>}><About /></Suspense> },
  { path: '/contact', element: <Suspense fallback={<div>Loading…</div>}><Contact /></Suspense> },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
