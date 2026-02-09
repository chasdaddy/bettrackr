import { useState } from 'react';
import { RANK_TIERS } from '../lib/ranks';
import { COLORS } from '../lib/styles';
import { Wallet, Pencil, Zap, Target, TrendingUp, ArrowUpRight, ArrowDownRight, Sparkles, ChevronRight } from 'lucide-react';
import StatCard from './StatCard';
import MarketEdge from './MarketEdge';

export default function Dashboard({
  stats,
  bets,
  completedBets,
  gutCalls,
  startingBankroll,
  setStartingBankroll,
  onNavigateToBets,
  onOpenPremium,
  pendingBets = [],
  plChart: PLChart,
  bankrollChart: BankrollChart,
}) {
  const {
    profit, roi, winRate, wins, losses,
    totalBets, totalStaked, bestSport,
    whatIfBestSportOnly, totalMissedMoney,
    streakInfo, rankInfo, archetype, detailedStreaks, psychHooks,
  } = stats;

  const [editingBankroll, setEditingBankroll] = useState(false);
  const [bankrollInput, setBankrollInput] = useState(String(startingBankroll || ''));

  const saveBankroll = () => {
    const val = parseFloat(bankrollInput);
    if (!isNaN(val) && val >= 0) {
      setStartingBankroll(val);
    }
    setEditingBankroll(false);
  };

  const currentBankroll = startingBankroll + profit;
  const roiPositive = parseFloat(roi) >= 0;

  // Pick the most impactful psych hook for the Smart Insight card
  const bestHook = psychHooks?.filter(h => h.show)?.[0];

  return (
    <div>
      {/* BalanceCard Hero */}
      <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl p-6 relative overflow-hidden mb-5 animate-slideUp">
        <Wallet className="absolute -right-4 -bottom-4 w-24 h-24 text-white/5" />
        {startingBankroll > 0 && !editingBankroll ? (
          <>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Bankroll</span>
              <button
                onClick={() => { setEditingBankroll(true); setBankrollInput(String(startingBankroll)); }}
                className="text-slate-500 hover:text-slate-300 transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="text-4xl font-black text-white mb-2">
              ${currentBankroll.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </div>
            <div className="flex items-center gap-3">
              <span className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-lg ${roiPositive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                {roiPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {roi}% ROI
              </span>
              <span className="text-xs text-slate-500">Started at ${startingBankroll.toLocaleString()}</span>
            </div>
          </>
        ) : (
          <div className="relative z-10">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Set Your Bankroll</span>
            <p className="text-sm text-slate-500 mt-1 mb-3">Track your bankroll growth over time</p>
            <input
              type="number"
              placeholder="Starting bankroll ($)"
              value={bankrollInput}
              onChange={e => setBankrollInput(e.target.value)}
              className="w-full bg-slate-950/60 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm mb-3 focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-600"
            />
            <div className="flex gap-2">
              <button onClick={saveBankroll} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-colors">
                Set Bankroll
              </button>
              {startingBankroll > 0 && (
                <button onClick={() => setEditingBankroll(false)} className="px-4 py-2.5 border border-slate-700 text-slate-400 text-xs rounded-xl hover:text-white transition-colors">
                  Cancel
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Stat Pills — 3 cards with icons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        <StatCard label="Win Rate" value={`${winRate}%`} color={COLORS.blue} subtext={`${wins}W - ${losses}L`} icon={Target} />
        <StatCard label="ROI" value={`${roi}%`} color={profit >= 0 ? COLORS.green : COLORS.red} subtext={`${profit >= 0 ? '+' : ''}$${profit.toFixed(2)} profit`} icon={TrendingUp} />
        <StatCard label="Total Bets" value={totalBets} color={COLORS.primary} subtext={`$${totalStaked.toFixed(0)} wagered`} icon={Zap} />
      </div>

      {/* Smart Insight card */}
      {bestHook && totalBets > 0 && (
        <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl p-5 mb-5 text-white animate-slideUp">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-200">Smart Insight</span>
          </div>
          <div className="text-lg font-bold mb-1">{bestHook.value}</div>
          <p className="text-sm text-indigo-100/80 mb-3">{bestHook.message}</p>
          <button
            onClick={onNavigateToBets}
            className="flex items-center gap-1 text-xs font-bold text-white/80 hover:text-white transition-colors"
          >
            See Details <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Active Bets */}
      {pendingBets.length > 0 && (
        <div className="mb-5 animate-slideUp">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-glowPulse absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <h3 className="text-sm font-bold text-white">Active Bets</h3>
              <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">{pendingBets.length}</span>
            </div>
            <button onClick={onNavigateToBets} className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors">View All</button>
          </div>
          <div className="space-y-2">
            {pendingBets.slice(0, 3).map(bet => (
              <div key={bet.id} className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="animate-glowPulse absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-white truncate">{bet.pick}</div>
                    <div className="text-[10px] text-slate-500">{bet.sport} &middot; ${Number(bet.stake).toFixed(0)}</div>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-slate-400 shrink-0">{bet.odds > 0 ? '+' : ''}{bet.odds}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rank Progress */}
      {rankInfo && rankInfo.nextRank && totalBets > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-5 animate-slideUp">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">{rankInfo.icon}</span>
              <span className="text-sm font-bold text-white">{rankInfo.name}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-500">
              <span className="text-xs">{rankInfo.progress.percentage}%</span>
              <span className="text-lg">{rankInfo.nextRank.icon}</span>
              <span className="text-sm font-bold">{rankInfo.nextRank.name}</span>
            </div>
          </div>
          <div className="bg-slate-800 h-2 rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-gradient-to-r from-indigo-600 to-violet-500 rounded-full animate-progressFill"
              style={{ width: `${rankInfo.progress.percentage}%` }}
            />
          </div>
          <div className="text-xs text-slate-500 flex gap-3">
            {rankInfo.progress.betsNeeded > 0 && <span>{rankInfo.progress.betsNeeded} more bets</span>}
            {rankInfo.progress.winRateNeeded > 0 && <span>+{rankInfo.progress.winRateNeeded.toFixed(1)}% win rate needed</span>}
          </div>
        </div>
      )}

      {/* Charts */}
      {PLChart && completedBets.length >= 2 && (
        <div className="mb-5 animate-fadeIn">
          <PLChart bets={bets} />
        </div>
      )}
      {BankrollChart && startingBankroll > 0 && completedBets.length >= 2 && (
        <div className="mb-5 animate-fadeIn">
          <BankrollChart bets={bets} startingBankroll={startingBankroll} />
        </div>
      )}

      {/* Market Edge */}
      {totalBets > 0 && (
        <div className="mb-5">
          <MarketEdge onOpenPremium={onOpenPremium} />
        </div>
      )}

      {/* Psych Hooks */}
      {psychHooks && psychHooks.filter(h => h.show).length > 0 && (
        <>
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Intelligence Feed</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
            {psychHooks.filter(h => h.show).map((hook, i) => (
              <div
                key={hook.type}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 animate-slideUp"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-base">{hook.icon}</span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{hook.title}</span>
                </div>
                <div className="text-xl font-black text-white mb-1">{hook.value}</div>
                <div className="text-xs text-slate-500">{hook.message}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Detailed Streaks */}
      {detailedStreaks && totalBets > 0 && (detailedStreaks.longestWin > 0 || detailedStreaks.longestLoss > 0) && (
        <div className="grid grid-cols-3 gap-3 mb-5 animate-slideUp">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Best Win Streak</div>
            <div className="text-2xl font-black text-emerald-400">{detailedStreaks.longestWin}</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Worst Loss Streak</div>
            <div className="text-2xl font-black text-rose-400">{detailedStreaks.longestLoss}</div>
          </div>
          {detailedStreaks.currentStreak > 1 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Current</div>
              <div className={`text-2xl font-black ${detailedStreaks.currentType === 'win' ? 'text-emerald-400' : 'text-rose-400'}`}>
                {detailedStreaks.currentStreak}{detailedStreaks.currentType === 'win' ? 'W' : 'L'}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {totalBets === 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center animate-fadeIn">
          <div className="w-14 h-14 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/20">
            <Target className="text-white w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Welcome, Rookie</h3>
          <p className="text-slate-500 text-sm mb-6">
            Log bets to unlock your rank and discover your betting archetype
          </p>

          {/* Rank tier preview */}
          <div className="flex justify-center gap-2 mb-8 flex-wrap">
            {RANK_TIERS.map((tier, i) => (
              <div
                key={tier.id}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${
                  i === 0 ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-slate-800/50 border-slate-700/50 opacity-40'
                }`}
              >
                <span className="text-sm">{tier.icon}</span>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${i === 0 ? 'text-indigo-400' : 'text-slate-500'}`}>
                  {tier.name}
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={onNavigateToBets}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm transition-colors shadow-lg shadow-indigo-900/20"
          >
            Log Your First Bet
          </button>
        </div>
      )}
    </div>
  );
}
