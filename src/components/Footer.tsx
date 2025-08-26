export default function Footer() {
  return (
    <footer style={{ background: '#102C33', color: '#F1EFE8' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ opacity: 0.9 }}>© {new Date().getFullYear()} H1B Explorer</span>
        <nav>
          <a href="/about" style={{ color: '#FBA765', textDecoration: 'none', marginRight: 16 }}>About</a>
          <a href="/contact" style={{ color: '#FBA765', textDecoration: 'none' }}>Contact</a>
        </nav>
      </div>
    </footer>
  );
}
