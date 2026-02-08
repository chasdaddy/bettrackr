import { COLORS } from '../lib/styles';
import { Lock, TrendingUp, Calendar } from 'lucide-react';

export default function Insights({ completedBets, totalBets, sportBreakdownChart: SportBreakdownChart, dayOfWeekStats }) {
  if (totalBets < 5) {
    const progress = Math.min(totalBets / 5, 1);
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center animate-fadeIn">
        <Lock className="w-8 h-8 text-slate-600 mx-auto mb-3" />
        <h3 className="text-white font-bold mb-2">Insights Locked</h3>
        <div className="max-w-[200px] mx-auto bg-slate-800 h-2 rounded-full overflow-hidden mb-2">
          <div
            className="h-full bg-indigo-600 rounded-full transition-all duration-500"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        <p className="text-slate-500 text-xs">
          {totalBets}/5 bets to unlock
        </p>
      </div>
    );
  }

  const sportBreakdown = completedBets.reduce((acc, bet) => {
    if (!acc[bet.sport]) acc[bet.sport] = { wins: 0, losses: 0, profit: 0 };
    if (bet.result === 'win') acc[bet.sport].wins++;
    if (bet.result === 'loss') acc[bet.sport].losses++;
    acc[bet.sport].profit += Number(bet.payout) - Number(bet.stake);
    return acc;
  }, {});

  const favs = completedBets.filter(b => b.odds < 0);
  const dogs = completedBets.filter(b => b.odds > 0);
  const favWins = favs.filter(b => b.result === 'win').length;
  const dogWins = dogs.filter(b => b.result === 'win').length;
  const favProfit = favs.reduce((s, b) => s + Number(b.payout) - Number(b.stake), 0);
  const dogProfit = dogs.reduce((s, b) => s + Number(b.payout) - Number(b.stake), 0);

  const dayEntries = dayOfWeekStats
    ? Object.entries(dayOfWeekStats)
        .filter(([, s]) => s.total > 0)
        .sort((a, b) => b[1].profit - a[1].profit)
    : [];

  const validationMessages = [];
  const dogWinRate = dogs.length > 0 ? (dogWins / dogs.length) * 100 : 0;
  if (dogWinRate > 55 && dogs.length >= 5) {
    validationMessages.push({
      text: `Underdog picks hit ${dogWinRate.toFixed(0)}% \u2014 elite territory`,
      color: 'emerald',
    });
  }
  if (dayEntries.length > 0 && dayEntries[0][1].profit > 0) {
    validationMessages.push({
      text: `Sharpest on ${dayEntries[0][0]}s`,
      color: 'indigo',
    });
  }

  return (
    <div>
      {SportBreakdownChart && <SportBreakdownChart completedBets={completedBets} />}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
        {/* Sport breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden animate-slideUp">
          <div className="px-4 py-3 border-b border-slate-800 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-teal-400" />
            <h3 className="text-sm font-bold text-white">By Sport</h3>
          </div>
          <div className="divide-y divide-slate-800/50">
            {Object.entries(sportBreakdown).map(([sport, s]) => (
              <div key={sport} className="flex justify-between items-center px-4 py-2.5 hover:bg-slate-800/30 transition-colors">
                <span className="text-sm text-slate-300">{sport}</span>
                <span className={`text-sm font-mono font-bold ${s.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {s.wins}-{s.losses} ({s.profit >= 0 ? '+' : ''}${s.profit.toFixed(0)})
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Odds breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden animate-slideUp">
          <div className="px-4 py-3 border-b border-slate-800 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">Favorites vs Underdogs</h3>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Favorites</div>
              <div className={`text-lg font-bold font-mono ${favProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {favWins}/{favs.length} wins &middot; {favProfit >= 0 ? '+' : ''}${favProfit.toFixed(0)}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Underdogs</div>
              <div className={`text-lg font-bold font-mono ${dogProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {dogWins}/{dogs.length} wins &middot; {dogProfit >= 0 ? '+' : ''}${dogProfit.toFixed(0)}
              </div>
            </div>
          </div>
        </div>

        {/* Day of Week */}
        {dayEntries.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden animate-slideUp">
            <div className="px-4 py-3 border-b border-slate-800 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-violet-400" />
              <h3 className="text-sm font-bold text-white">Day of Week</h3>
            </div>
            <div className="divide-y divide-slate-800/50">
              {dayEntries.map(([day, s]) => (
                <div key={day} className="flex justify-between items-center px-4 py-2.5 hover:bg-slate-800/30 transition-colors">
                  <span className="text-sm text-slate-300">{day}</span>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-mono font-bold ${s.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {s.profit >= 0 ? '+' : ''}${s.profit.toFixed(0)}
                    </span>
                    <span className="text-xs text-slate-500">{s.winRate}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Validation messages */}
      {validationMessages.length > 0 && (
        <div className="space-y-2">
          {validationMessages.map((msg, i) => (
            <div
              key={i}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border animate-slideUp ${
                msg.color === 'emerald'
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
              }`}
            >
              <TrendingUp className="w-4 h-4 shrink-0" />
              <span className="text-sm font-bold">{msg.text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
