import { TrendingUp } from 'lucide-react';

export function FullPageSpinner() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center animate-fadeIn">
      <div className="text-center">
        <div className="w-12 h-12 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/20 animate-pulse">
          <TrendingUp className="text-white w-6 h-6" />
        </div>
        <div className="text-slate-500 text-sm font-medium">Loading...</div>
      </div>
    </div>
  );
}

export function InlineSpinner({ size = 20 }) {
  return (
    <div
      className="border-2 border-slate-800 border-t-indigo-500 rounded-full animate-spin"
      style={{ width: size, height: size }}
    />
  );
}
