export default function Footer() {
  return (
    <footer style={{ background: '#102C33', color: '#F1EFE8', padding: '16px 16px', marginTop: 24 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ opacity: 0.9 }}>© {new Date().getFullYear()} H1B Explorer</span>
        <span style={{ color: '#FBA765' }}>Built with AG Grid + Supabase</span>
      </div>
    </footer>
  );
}
