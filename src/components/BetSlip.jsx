import { Ticket, Lock } from 'lucide-react';
import { calculatePayout } from '../lib/odds';
import { calculateKelly, getSportWinRate } from '../lib/kelly';

export default function BetSlip({ pendingBets, completedBets = [], bankroll = 0 }) {
  const toWin = (bet) => {
    const payout = calculatePayout(Number(bet.odds), Number(bet.stake), 'win');
    return (payout - Number(bet.stake)).toFixed(2);
  };

  const totalPotential = pendingBets.reduce((sum, b) => {
    return sum + calculatePayout(Number(b.odds), Number(b.stake), 'win');
  }, 0);

  const getKellyPct = (bet) => {
    if (completedBets.length < 5 || bankroll <= 0) return null;
    const winRate = getSportWinRate(completedBets, bet.sport);
    const { fraction } = calculateKelly(Number(bet.odds), winRate, bankroll);
    return (fraction * 100).toFixed(1);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden mb-4">
      <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Ticket className="w-4 h-4 text-indigo-400" />
          <span className="text-sm font-bold text-white">Bet Slip</span>
        </div>
        {pendingBets.length > 0 && (
          <span className="text-[10px] font-bold bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full">
            {pendingBets.length}
          </span>
        )}
      </div>

      {pendingBets.length === 0 ? (
        <div className="p-6 text-center">
          <Ticket className="w-6 h-6 text-slate-700 mx-auto mb-2" />
          <span className="text-xs text-slate-600">Slip Empty</span>
        </div>
      ) : (
        <>
          <div className="divide-y divide-slate-800/50 max-h-48 overflow-y-auto no-scrollbar">
            {pendingBets.slice(0, 5).map(bet => {
              const kellyPct = getKellyPct(bet);
              return (
                <div key={bet.id} className="px-4 py-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white truncate mr-2">{bet.pick}</span>
                    <span className="text-xs font-mono text-slate-400">{bet.odds > 0 ? '+' : ''}{bet.odds}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-500">${Number(bet.stake).toFixed(0)} to win ${toWin(bet)}</span>
                    <div className="flex items-center gap-1 text-[10px] text-amber-400/50">
                      <Lock className="w-2.5 h-2.5" />
                      <span className="blur-[3px] select-none">Kelly {kellyPct ?? '—'}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="px-4 py-3 border-t border-slate-800 bg-slate-950/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Est. Payout</span>
              <span className="text-sm font-bold text-emerald-400">${totalPotential.toFixed(2)}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
