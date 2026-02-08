import { COLORS } from '../lib/styles';

export default function ShareCard({ stats }) {
  const { profit, winRate, wins, losses, roi, streakInfo, rankInfo, archetype } = stats;

  return (
    <div className="text-center">
      <p className="text-slate-500 text-sm mb-5">Screenshot and share to Twitter, Discord, or Reddit</p>

      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 border border-slate-700 rounded-3xl max-w-[480px] mx-auto mb-6 overflow-hidden shadow-2xl shadow-indigo-900/10 relative">
        {/* Shimmer */}
        <div className="absolute inset-0 bg-[linear-gradient(105deg,transparent_40%,rgba(99,102,241,0.03)_45%,rgba(99,102,241,0.06)_50%,rgba(99,102,241,0.03)_55%,transparent_60%)] animate-shimmer pointer-events-none" />

        <div className="p-6">
          {/* Top badges */}
          <div className="flex justify-between items-start mb-6">
            {archetype && archetype.id !== 'rookie' ? (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-700 bg-slate-800/50">
                <span className="text-sm">{archetype.icon}</span>
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">{archetype.badge}</span>
              </div>
            ) : <div />}

            {rankInfo && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                <span className="text-sm">{rankInfo.icon}</span>
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">{rankInfo.name}</span>
              </div>
            )}
          </div>

          {/* Logo */}
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">BetTrackr</div>

          {/* Profit */}
          <div className={`text-5xl font-black mb-1 ${profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {profit >= 0 ? '+' : ''}${profit.toFixed(0)}
          </div>
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-6">This Year</div>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Win Rate</div>
              <div className="text-lg font-black text-white">{winRate}%</div>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Record</div>
              <div className="text-lg font-black text-white">{wins}-{losses}</div>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">ROI</div>
              <div className="text-lg font-black text-white">{roi}%</div>
            </div>
          </div>

          {/* Streak */}
          {streakInfo.streak > 2 && (
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border mb-5 ${
              streakInfo.type === 'win'
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
            }`}>
              <span className="text-sm font-bold">
                {streakInfo.streak} {streakInfo.type === 'win' ? 'Win' : 'Loss'} Streak
              </span>
            </div>
          )}

          {/* Footer */}
          <div className="text-[10px] text-slate-600 tracking-[0.15em] uppercase mt-2">
            Track your edge at bettrackr.io
          </div>
        </div>
      </div>
    </div>
  );
}
