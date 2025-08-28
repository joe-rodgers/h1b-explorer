import { Link, NavLink } from 'react-router-dom';
import { useState } from 'react';

export default function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header style={{ background: '#f7f4ef', color: '#242424', borderBottom: '1px solid #d8d8d8' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '10px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" style={{ color: 'inherit', textDecoration: 'none', fontWeight: 700, fontFamily: 'Georgia, Times New Roman, Times, serif' }}>H1B Explorer</Link>
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
            <li><NavLink to="/" onClick={() => setOpen(false)} style={{ color: '#7e0f0f', textDecoration: 'none' }}>Home</NavLink></li>
            <li><NavLink to="/about" onClick={() => setOpen(false)} style={{ color: '#7e0f0f', textDecoration: 'none' }}>About</NavLink></li>
            <li><NavLink to="/contact" onClick={() => setOpen(false)} style={{ color: '#7e0f0f', textDecoration: 'none' }}>Contact</NavLink></li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
