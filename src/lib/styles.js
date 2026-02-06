export const COLORS = {
  green: '#00ff88',
  red: '#ff4444',
  blue: '#00d4ff',
  gold: '#ffd700',
  pink: '#ff88ff',
  teal: '#00c896',
  purple: '#aa88ff',
  bg: '#0a0a0f',
  bgCard: 'rgba(0, 0, 0, 0.4)',
  bgDarker: 'rgba(0, 0, 0, 0.3)',
  bgInput: 'rgba(0, 0, 0, 0.5)',
  border: '#333',
  borderLight: '#222',
  text: '#e0e0e0',
  textMuted: '#aaa',
  textDim: '#888',
  textDimmer: '#666',
  textDimmest: '#555',
};

export const SPORT_OPTIONS = [
  'NBA', 'NFL', 'MLB', 'NHL', 'UFC', 'Soccer', 'Tennis', 'NCAAB', 'NCAAF', 'Other'
];

export const containerStyle = {
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #0f0f1a 100%)',
  color: COLORS.text,
  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
  padding: '20px',
};

export const inputStyle = {
  background: COLORS.bgInput,
  border: `1px solid ${COLORS.border}`,
  color: COLORS.text,
  padding: '12px',
  borderRadius: '4px',
  fontFamily: 'inherit',
  fontSize: '0.85rem',
};

export const thStyle = {
  textAlign: 'left',
  padding: '15px',
  color: COLORS.textDimmer,
  fontSize: '0.7rem',
  letterSpacing: '1px',
  fontWeight: 'normal',
};

export const tdStyle = {
  padding: '15px',
  fontSize: '0.85rem',
  color: COLORS.textMuted,
};

export const miniBtn = (color) => ({
  background: 'transparent',
  border: `1px solid ${color}`,
  color: color,
  padding: '4px 8px',
  borderRadius: '3px',
  cursor: 'pointer',
  fontFamily: 'inherit',
  fontSize: '0.75rem',
});

export const gradientButtonStyle = {
  background: 'linear-gradient(90deg, #00ff88, #00d4ff)',
  border: 'none',
  color: '#000',
  padding: '15px 30px',
  borderRadius: '4px',
  cursor: 'pointer',
  fontFamily: 'inherit',
  fontSize: '0.9rem',
  fontWeight: 'bold',
  letterSpacing: '1px',
};

export const cancelButtonStyle = {
  background: 'transparent',
  border: '1px solid #444',
  color: COLORS.textDim,
  padding: '12px 24px',
  borderRadius: '4px',
  cursor: 'pointer',
  fontFamily: 'inherit',
};
