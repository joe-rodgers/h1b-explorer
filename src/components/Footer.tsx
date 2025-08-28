export default function Footer() {
  return (
    <footer style={{ background: '#f7f4ef', color: '#242424', borderTop: '1px solid #d8d8d8' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ opacity: 0.9 }}>© {new Date().getFullYear()} H1B Explorer</span>
        <nav>
          <a href="/about" style={{ color: '#7e0f0f', textDecoration: 'none', marginRight: 16 }}>About</a>
          <a href="/contact" style={{ color: '#7e0f0f', textDecoration: 'none' }}>Contact</a>
        </nav>
      </div>
    </footer>
  );
}
