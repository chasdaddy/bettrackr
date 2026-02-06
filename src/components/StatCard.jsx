export default function StatCard({ label, value, color, subtext }) {
  return (
    <div style={{
      background: 'rgba(0, 0, 0, 0.4)',
      border: '1px solid #222',
      borderRadius: '8px',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '2px',
        background: color,
      }} />
      <div style={{ color: '#666', fontSize: '0.7rem', letterSpacing: '1px', marginBottom: '8px' }}>
        {label}
      </div>
      <div style={{ color, fontSize: '1.8rem', fontWeight: 'bold' }}>
        {value}
      </div>
      <div style={{ color: '#555', fontSize: '0.75rem', marginTop: '5px' }}>
        {subtext}
      </div>
    </div>
  );
}
