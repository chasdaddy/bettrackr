export default function StatCard({ label, value, color, subtext, index = 0 }) {
  const colorClass =
    color === '#10b981' ? 'text-emerald-400' :
    color === '#f43f5e' ? 'text-rose-400' :
    color === '#3b82f6' ? 'text-blue-400' :
    color === '#f59e0b' ? 'text-amber-400' :
    color === '#ec4899' ? 'text-pink-400' :
    color === '#6366f1' ? 'text-indigo-400' :
    'text-white';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 animate-slideUp">
      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
        {label}
      </div>
      <div className={`text-2xl font-black ${colorClass}`}>
        {value}
      </div>
      <div className="text-xs text-slate-500 mt-1">
        {subtext}
      </div>
    </div>
  );
}
