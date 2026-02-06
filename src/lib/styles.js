function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}

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
  glassBg: 'rgba(255, 255, 255, 0.03)',
  glassBgHover: 'rgba(255, 255, 255, 0.06)',
  glassBorder: 'rgba(255, 255, 255, 0.08)',
  glassBorderHover: 'rgba(255, 255, 255, 0.15)',
};

export const SPORT_OPTIONS = [
  'NBA', 'NFL', 'MLB', 'NHL', 'UFC', 'Soccer', 'Tennis', 'NCAAB', 'NCAAF', 'Other'
];

export const glassCardStyle = {
  background: COLORS.glassBg,
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: `1px solid ${COLORS.glassBorder}`,
  borderRadius: '12px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
  transition: 'all 0.3s ease',
};

export const colorGlow = (color, intensity = 0.3) =>
  `0 0 20px rgba(${hexToRgb(color)}, ${intensity}), 0 8px 32px rgba(0, 0, 0, 0.3)`;

export const containerStyle = {
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #0f0f1a 100%)',
  color: COLORS.text,
  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
  padding: '20px',
};

export const inputStyle = {
  background: 'rgba(0, 0, 0, 0.4)',
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)',
  border: `1px solid ${COLORS.glassBorder}`,
  color: COLORS.text,
  padding: '12px',
  borderRadius: '6px',
  fontFamily: 'inherit',
  fontSize: '0.85rem',
  transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
};

export const thStyle = {
  textAlign: 'left',
  padding: '15px',
  color: COLORS.textDimmer,
  fontSize: '0.7rem',
  letterSpacing: '1px',
  fontWeight: 'normal',
  borderBottom: `1px solid ${COLORS.glassBorder}`,
};

export const tdStyle = {
  padding: '15px',
  fontSize: '0.85rem',
  color: COLORS.textMuted,
  transition: 'background 0.2s ease',
};

export const miniBtn = (color) => ({
  background: 'transparent',
  border: `1px solid ${color}`,
  color: color,
  padding: '4px 8px',
  borderRadius: '4px',
  cursor: 'pointer',
  fontFamily: 'inherit',
  fontSize: '0.75rem',
  transition: 'all 0.2s ease',
});

export const gradientButtonStyle = {
  background: 'linear-gradient(90deg, #00ff88, #00d4ff)',
  border: 'none',
  color: '#000',
  padding: '15px 30px',
  borderRadius: '6px',
  cursor: 'pointer',
  fontFamily: 'inherit',
  fontSize: '0.9rem',
  fontWeight: 'bold',
  letterSpacing: '1px',
  boxShadow: '0 4px 15px rgba(0, 255, 136, 0.2)',
  transition: 'all 0.3s ease',
};

export const cancelButtonStyle = {
  background: 'transparent',
  border: `1px solid ${COLORS.glassBorder}`,
  color: COLORS.textDim,
  padding: '12px 24px',
  borderRadius: '6px',
  cursor: 'pointer',
  fontFamily: 'inherit',
  transition: 'all 0.2s ease',
};
