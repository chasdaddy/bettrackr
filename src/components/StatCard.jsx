import { useState } from 'react';
import { glassCardStyle, colorGlow, COLORS } from '../lib/styles';

export default function StatCard({ label, value, color, subtext, index = 0 }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        ...glassCardStyle,
        padding: '20px',
        position: 'relative',
        overflow: 'hidden',
        ...(hovered ? {
          background: COLORS.glassBgHover,
          border: `1px solid ${COLORS.glassBorderHover}`,
          transform: 'translateY(-2px)',
          boxShadow: colorGlow(color),
        } : {}),
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`animate-slideUp stagger-${index + 1}`}
    >
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '2px',
        background: color,
        boxShadow: hovered ? `0 0 10px ${color}, 0 0 20px ${color}` : 'none',
        transition: 'box-shadow 0.3s ease',
      }} />
      <div style={{ color: COLORS.textDimmer, fontSize: '0.7rem', letterSpacing: '1px', marginBottom: '8px' }}>
        {label}
      </div>
      <div style={{
        color,
        fontSize: '1.8rem',
        fontWeight: 'bold',
        textShadow: hovered ? `0 0 15px ${color}` : 'none',
        transition: 'text-shadow 0.3s ease',
      }}>
        {value}
      </div>
      <div style={{ color: COLORS.textDimmest, fontSize: '0.75rem', marginTop: '5px' }}>
        {subtext}
      </div>
    </div>
  );
}
