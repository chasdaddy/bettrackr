import { useState, useEffect } from 'react';
import { COLORS } from '../lib/styles';

export default function Toast({ message, type = 'error', onDismiss }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 300);
    }, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const bgColor = type === 'error'
    ? 'rgba(255, 68, 68, 0.15)'
    : 'rgba(0, 255, 136, 0.15)';
  const borderColor = type === 'error' ? COLORS.red : COLORS.green;
  const glowColor = type === 'error'
    ? '0 0 15px rgba(255, 68, 68, 0.2), 0 8px 32px rgba(0, 0, 0, 0.3)'
    : '0 0 15px rgba(0, 255, 136, 0.2), 0 8px 32px rgba(0, 0, 0, 0.3)';

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      background: bgColor,
      border: `1px solid ${borderColor}`,
      color: borderColor,
      padding: '15px 25px',
      borderRadius: '10px',
      fontSize: '0.85rem',
      fontFamily: "'JetBrains Mono', monospace",
      zIndex: 9999,
      maxWidth: '400px',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(-10px)',
      transition: 'opacity 0.3s, transform 0.3s',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      boxShadow: glowColor,
      animation: 'slideUp 0.4s ease',
    }}>
      {message}
    </div>
  );
}
