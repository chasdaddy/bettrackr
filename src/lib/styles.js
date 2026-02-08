export function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}

// Chart colors (for recharts which needs hex values)
export const COLORS = {
  primary: '#6366f1',   // indigo-500
  green: '#10b981',     // emerald-500
  red: '#f43f5e',       // rose-500
  blue: '#3b82f6',      // blue-500
  gold: '#f59e0b',      // amber-500
  pink: '#ec4899',      // pink-500
  teal: '#14b8a6',      // teal-500
  purple: '#a855f7',    // purple-500
  orange: '#f97316',    // orange-500
  slate700: '#334155',
  slate800: '#1e293b',
  slate900: '#0f172a',
  slate950: '#020617',
};

export const SPORT_OPTIONS = [
  'NBA', 'NFL', 'MLB', 'NHL', 'UFC', 'Soccer', 'Tennis', 'NCAAB', 'NCAAF', 'Other'
];
