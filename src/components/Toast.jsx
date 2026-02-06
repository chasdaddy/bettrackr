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
  const textColor = type === 'error' ? COLORS.red : COLORS.green;

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      background: bgColor,
      border: `1px solid ${borderColor}`,
      color: textColor,
      padding: '15px 25px',
      borderRadius: '8px',
      fontSize: '0.85rem',
      fontFamily: "'JetBrains Mono', monospace",
      zIndex: 9999,
      maxWidth: '400px',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(-10px)',
      transition: 'opacity 0.3s, transform 0.3s',
      backdropFilter: 'blur(10px)',
    }}>
      {message}
    </div>
  );
}
