import { containerStyle, COLORS } from '../lib/styles';

export function FullPageSpinner() {
  return (
    <div style={containerStyle}>
      <div style={{ textAlign: 'center', paddingTop: '100px' }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: `3px solid ${COLORS.border}`,
          borderTop: `3px solid ${COLORS.green}`,
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          margin: '0 auto 20px',
        }} />
        <div style={{ color: COLORS.green, fontSize: '1rem', letterSpacing: '2px' }}>LOADING...</div>
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
    }} />
  );
}
