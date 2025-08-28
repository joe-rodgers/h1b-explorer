import type { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="App">
      <Header />
      <main>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px' }}>{children}</div>
      </main>
      <Footer />
    </div>
  );
}
