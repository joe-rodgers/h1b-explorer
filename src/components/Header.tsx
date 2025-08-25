import { Link, NavLink } from 'react-router-dom';
import { useState } from 'react';

export default function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header style={{ background: '#004F54', color: '#F1EFE8', padding: '12px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: 1200, margin: '0 auto' }}>
        <Link to="/" style={{ color: '#F1EFE8', textDecoration: 'none', fontWeight: 700 }}>H1B Explorer</Link>
        <button aria-label="Toggle navigation" onClick={() => setOpen(!open)} style={{ background: 'transparent', border: '1px solid #F1EFE8', color: '#F1EFE8', padding: '6px 10px', borderRadius: 6, cursor: 'pointer' }}>
          ☰
        </button>
      </div>
      {open && (
        <nav style={{ maxWidth: 1200, margin: '8px auto 0', display: 'flex', gap: 16 }}>
          <NavLink to="/" onClick={() => setOpen(false)} style={{ color: '#F1EFE8', textDecoration: 'none' }}>Home</NavLink>
          <NavLink to="/about" onClick={() => setOpen(false)} style={{ color: '#F1EFE8', textDecoration: 'none' }}>About</NavLink>
          <NavLink to="/contact" onClick={() => setOpen(false)} style={{ color: '#F1EFE8', textDecoration: 'none' }}>Contact</NavLink>
        </nav>
      )}
    </header>
  );
}
