import { Link, NavLink } from 'react-router-dom';

export default function Header() {
  return (
    <header style={{ background: '#004F54', color: '#F1EFE8', padding: '12px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: 1200, margin: '0 auto' }}>
        <Link to="/" style={{ color: '#F1EFE8', textDecoration: 'none', fontWeight: 700 }}>H1B Explorer</Link>
        <nav style={{ display: 'flex', gap: 16 }}>
          <NavLink to="/" style={{ color: '#F1EFE8', textDecoration: 'none' }}>Home</NavLink>
          <NavLink to="/about" style={{ color: '#F1EFE8', textDecoration: 'none' }}>About</NavLink>
          <NavLink to="/contact" style={{ color: '#F1EFE8', textDecoration: 'none' }}>Contact</NavLink>
        </nav>
      </div>
    </header>
  );
}
