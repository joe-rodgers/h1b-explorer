import { Link, NavLink } from 'react-router-dom';
import { useState } from 'react';

export default function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header style={{ background: '#004F54', color: '#F1EFE8' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '8px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" style={{ color: 'inherit', textDecoration: 'none', fontWeight: 700 }}>H1B Explorer</Link>
          <button
            aria-label="Toggle navigation"
            onClick={() => setOpen(!open)}
            style={{
              background: 'transparent',
              border: '0',
              color: 'inherit',
              fontSize: 24,
              lineHeight: 1,
              cursor: 'pointer'
            }}
          >
            ☰
          </button>
        </div>
        <nav
          style={{
            display: open ? 'block' : 'none',
            padding: '8px 0'
          }}
        >
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', gap: 16 }}>
            <li><NavLink to="/" onClick={() => setOpen(false)} style={{ color: 'inherit', textDecoration: 'none' }}>Home</NavLink></li>
            <li><NavLink to="/about" onClick={() => setOpen(false)} style={{ color: 'inherit', textDecoration: 'none' }}>About</NavLink></li>
            <li><NavLink to="/contact" onClick={() => setOpen(false)} style={{ color: 'inherit', textDecoration: 'none' }}>Contact</NavLink></li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
