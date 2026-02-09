import { COLORS } from '../lib/styles';
import { Lock, TrendingUp, Calendar, Crown, GitBranch, Calculator } from 'lucide-react';
import { calculateKelly } from '../lib/kelly';
import { analyzeCorrelations } from '../lib/correlations';

export default function Insights({ completedBets, totalBets, sportBreakdownChart: SportBreakdownChart, dayOfWeekStats, onOpenPremium, bankroll = 0 }) {
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
        <div className="space-y-2 mb-5">
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

      {/* Premium Locked Sections */}
      {(() => {
        const correlations = analyzeCorrelations(completedBets);
        const corrRows = correlations.best.length > 0 ? correlations.best.slice(0, 3) : correlations.worst.slice(0, 3);

        // Real Kelly output for the calculator preview
        const overallWinRate = totalBets > 0 ? completedBets.filter(b => b.result === 'win').length / totalBets : 0.5;
        const avgOdds = totalBets > 0 ? completedBets.reduce((s, b) => s + Number(b.odds), 0) / totalBets : -110;
        const effectiveBankroll = bankroll > 0 ? bankroll : 1000;
        const kellyResult = calculateKelly(avgOdds, overallWinRate, effectiveBankroll);

        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
            {/* Bet Correlations — locked */}
            <div className="relative bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden animate-slideUp">
              <div className="px-4 py-3 border-b border-slate-800 flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-violet-400" />
                <h3 className="text-sm font-bold text-white">Bet Correlations</h3>
                <span className="text-[10px] font-bold bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full ml-auto">PRO</span>
              </div>
              <div className="p-4 blur-[6px] select-none pointer-events-none">
                <div className="space-y-3">
                  {corrRows.length > 0 ? corrRows.map((row, i) => (
                    <div key={i} className="flex justify-between">
                      <span className="text-sm text-slate-400">{row.label}</span>
                      <span className={`text-sm font-bold ${row.winRate >= 50 ? 'text-emerald-400' : 'text-rose-400'}`}>{row.winRate}% win rate</span>
                    </div>
                  )) : (
                    <>
                      <div className="flex justify-between"><span className="text-sm text-slate-400">Need more bets</span><span className="text-sm font-bold text-slate-500">—</span></div>
                      <div className="flex justify-between"><span className="text-sm text-slate-400">for pattern analysis</span><span className="text-sm font-bold text-slate-500">—</span></div>
                    </>
                  )}
                </div>
              </div>
              <div className="absolute inset-0 top-12 flex flex-col items-center justify-center">
                <Lock className="w-5 h-5 text-slate-400 mb-2" />
                <span className="text-xs font-bold text-slate-400 mb-2">Find patterns in your wins</span>
                <button
                  onClick={onOpenPremium}
                  className="flex items-center gap-1.5 text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-lg hover:from-amber-400 hover:to-orange-400 transition-all"
                >
                  <Crown className="w-3 h-3" /> Unlock with Pro
                </button>
              </div>
            </div>

            {/* Optimal Stake Calculator — locked */}
            <div className="relative bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden animate-slideUp">
              <div className="px-4 py-3 border-b border-slate-800 flex items-center gap-2">
                <Calculator className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Optimal Stake Calculator</h3>
                <span className="text-[10px] font-bold bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full ml-auto">PRO</span>
              </div>
              <div className="p-4 blur-[6px] select-none pointer-events-none">
                <div className="space-y-3">
                  <div className="flex justify-between"><span className="text-sm text-slate-400">Recommended stake</span><span className="text-sm font-bold text-white">${kellyResult.recommendedStake.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span className="text-sm text-slate-400">Kelly fraction</span><span className="text-sm font-bold text-white">{(kellyResult.fraction * 100).toFixed(1)}%</span></div>
                  <div className="flex justify-between"><span className="text-sm text-slate-400">Expected value</span><span className={`text-sm font-bold ${kellyResult.expectedValue >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{kellyResult.expectedValue >= 0 ? '+' : ''}${kellyResult.expectedValue.toFixed(2)}</span></div>
                </div>
              </div>
              <div className="absolute inset-0 top-12 flex flex-col items-center justify-center">
                <Lock className="w-5 h-5 text-slate-400 mb-2" />
                <span className="text-xs font-bold text-slate-400 mb-2">Size bets with math, not gut</span>
                <button
                  onClick={onOpenPremium}
                  className="flex items-center gap-1.5 text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-lg hover:from-amber-400 hover:to-orange-400 transition-all"
                >
                  <Crown className="w-3 h-3" /> Unlock with Pro
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
