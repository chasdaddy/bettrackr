import { Lock } from 'lucide-react';

export default function StatCard({ label, value, color, subtext, icon: Icon, locked = false }) {
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
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            {label}
          </div>
          {locked ? (
            <div className="flex items-center gap-1.5">
              <Lock className="w-3 h-3 text-amber-400" />
              <span className="text-sm font-bold text-amber-400">PRO</span>
            </div>
          ) : (
            <>
              <div className={`text-2xl font-black ${colorClass}`}>
                {value}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {subtext}
              </div>
            </>
          )}
        </div>
        {Icon && (
          <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center shrink-0 ml-3">
            <Icon className={`w-4 h-4 ${colorClass}`} />
          </div>
        )}
      </div>
    </div>
  );
}
