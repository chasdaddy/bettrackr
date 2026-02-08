import { useState } from 'react';
import { RANK_TIERS } from '../lib/ranks';
import { COLORS } from '../lib/styles';
import { Wallet, Pencil, Zap, Trophy, Flame, Target } from 'lucide-react';
import StatCard from './StatCard';

export default function Dashboard({
  stats,
  bets,
  completedBets,
  gutCalls,
  startingBankroll,
  setStartingBankroll,
  onNavigateToBets,
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

  return (
    <div>
      {/* Stat Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-5">
        <StatCard label="Total P/L" value={`${profit >= 0 ? '+' : ''}$${profit.toFixed(2)}`} color={profit >= 0 ? COLORS.green : COLORS.red} subtext={`${roi}% ROI`} />
        <StatCard label="Win Rate" value={`${winRate}%`} color={COLORS.blue} subtext={`${wins}W - ${losses}L`} />
        <StatCard label="Wagered" value={`$${totalStaked.toFixed(0)}`} color={COLORS.gold} subtext={`${totalBets} bets`} />
        <StatCard label="Best Sport" value={bestSport.sport || 'N/A'} color={COLORS.pink} subtext={bestSport.profit ? `${bestSport.profit >= 0 ? '+' : ''}$${bestSport.profit.toFixed(0)}` : '-'} />

        {/* Bankroll card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 animate-slideUp">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Bankroll</div>
            <Wallet className="w-3.5 h-3.5 text-amber-400" />
          </div>
          {startingBankroll > 0 && !editingBankroll ? (
            <>
              <div className="text-2xl font-black text-amber-400">
                ${(startingBankroll + profit).toFixed(0)}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-slate-500">Start: ${startingBankroll.toFixed(0)}</span>
                <button
                  onClick={() => { setEditingBankroll(true); setBankrollInput(String(startingBankroll)); }}
                  className="text-slate-600 hover:text-slate-400 transition-colors"
                >
                  <Pencil className="w-3 h-3" />
                </button>
              </div>
            </>
          ) : (
            <div>
              <input
                type="number"
                placeholder="Starting ($)"
                value={bankrollInput}
                onChange={e => setBankrollInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2 text-sm mb-2 focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <div className="flex gap-2">
                <button onClick={saveBankroll} className="px-3 py-1.5 bg-amber-500 text-black text-xs font-bold rounded-lg hover:bg-amber-400 transition-colors">
                  Set
                </button>
                {startingBankroll > 0 && (
                  <button onClick={() => setEditingBankroll(false)} className="px-3 py-1.5 border border-slate-700 text-slate-400 text-xs rounded-lg hover:text-white transition-colors">
                    Cancel
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

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
