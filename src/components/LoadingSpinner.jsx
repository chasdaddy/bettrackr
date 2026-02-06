import { containerStyle, COLORS } from '../lib/styles';

export function FullPageSpinner() {
  return (
    <div style={containerStyle} className="animate-fadeIn">
      <div style={{ textAlign: 'center', paddingTop: '100px' }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: `3px solid ${COLORS.border}`,
          borderTop: `3px solid ${COLORS.green}`,
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          margin: '0 auto 20px',
          boxShadow: '0 0 15px rgba(0, 255, 136, 0.4), 0 0 30px rgba(0, 255, 136, 0.1)',
        }} />
        <div style={{
          color: COLORS.green,
          fontSize: '1rem',
          letterSpacing: '2px',
          animation: 'pulse 1.5s ease-in-out infinite',
          textShadow: '0 0 10px rgba(0, 255, 136, 0.3)',
        }}>
          LOADING...
        </div>
      </div>
    </div>
  );
}

export function InlineSpinner({ size = 20 }) {
  return (
    <span style={{
      display: 'inline-block',
      width: size,
      height: size,
      border: `2px solid ${COLORS.border}`,
      borderTop: `2px solid ${COLORS.green}`,
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
      boxShadow: '0 0 8px rgba(0, 255, 136, 0.3)',
    }} />
  );
}
