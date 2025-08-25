import { Suspense, lazy } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';
import Layout from './components/Layout';

const About = lazy(() => import('./routes/About'));
const Contact = lazy(() => import('./routes/Contact'));

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Layout>
        <App />
      </Layout>
    ),
  },
  {
    path: '/about',
    element: (
      <Layout>
        <Suspense fallback={<div>Loading…</div>}>
          <About />
        </Suspense>
      </Layout>
    ),
  },
  {
    path: '/contact',
    element: (
      <Layout>
        <Suspense fallback={<div>Loading…</div>}>
          <Contact />
        </Suspense>
      </Layout>
    ),
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
