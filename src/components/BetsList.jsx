import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { calculatePayout } from '../lib/odds';
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import BetForm from './BetForm';

const BETS_PER_PAGE = 20;

export default function BetsList({ bets, setBets, userId, showToast, onEditBet }) {
  const [showForm, setShowForm] = useState(false);
  const [newBet, setNewBet] = useState({ sport: 'NBA', event: '', pick: '', odds: '', stake: '', result: 'pending' });
  const [page, setPage] = useState(0);

  const totalPages = Math.max(1, Math.ceil(bets.length / BETS_PER_PAGE));
  const paginatedBets = bets.slice(page * BETS_PER_PAGE, (page + 1) * BETS_PER_PAGE);

  const addBet = async () => {
    if (!newBet.event || !newBet.pick || !newBet.odds || !newBet.stake) return;

    const odds = parseFloat(newBet.odds);
    const stake = parseFloat(newBet.stake);
    const payout = calculatePayout(odds, stake, newBet.result);

    const { data, error } = await supabase
      .from('bets')
      .insert({
        user_id: userId,
        sport: newBet.sport,
        event: newBet.event,
        pick: newBet.pick,
        odds,
        stake,
        result: newBet.result,
        payout,
        date: new Date().toISOString().split('T')[0],
      })
      .select();

    if (error) {
      showToast(error.message, 'error');
      return;
    }
    if (data) {
      setBets([data[0], ...bets]);
      setNewBet({ sport: 'NBA', event: '', pick: '', odds: '', stake: '', result: 'pending' });
      setShowForm(false);
    }
  };

  const updateBetResult = async (betId, result) => {
    const bet = bets.find(b => b.id === betId);
    const payout = calculatePayout(bet.odds, bet.stake, result);

    const { error } = await supabase
      .from('bets')
      .update({ result, payout })
      .eq('id', betId);

    if (error) {
      showToast(error.message, 'error');
      return;
    }
    setBets(bets.map(b => b.id === betId ? { ...b, result, payout } : b));
  };

  const deleteBet = async (betId) => {
    if (!window.confirm('Delete this bet? This cannot be undone.')) return;

    const { error } = await supabase
      .from('bets')
      .delete()
      .eq('id', betId);

    if (error) {
      showToast(error.message, 'error');
      return;
    }
    setBets(bets.filter(b => b.id !== betId));
  };

  return (
    <div>
      <button
        onClick={() => setShowForm(true)}
        className="flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm transition-colors shadow-lg shadow-indigo-900/20 mb-5 animate-slideUp"
      >
        <Plus className="w-4 h-4" />
        Log New Bet
      </button>

      {showForm && (
        <BetForm
          newBet={newBet}
          setNewBet={setNewBet}
          onSubmit={addBet}
          onCancel={() => setShowForm(false)}
        />
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden animate-fadeIn">
        {bets.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            No bets yet. Start tracking!
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b border-slate-800">
                    {['Date', 'Sport', 'Event', 'Pick', 'Odds', 'Stake', 'Result', 'P/L', 'Actions'].map(h => (
                      <th key={h} className="text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider px-4 py-3">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedBets.map(bet => (
                    <tr key={bet.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3 text-sm text-slate-400">{bet.date}</td>
                      <td className="px-4 py-3 text-sm text-slate-300">{bet.sport}</td>
                      <td className="px-4 py-3 text-sm text-white font-medium">{bet.event}</td>
                      <td className="px-4 py-3 text-sm text-slate-300">{bet.pick}</td>
                      <td className="px-4 py-3 text-sm text-slate-300 font-mono">{bet.odds > 0 ? `+${bet.odds}` : bet.odds}</td>
                      <td className="px-4 py-3 text-sm text-slate-300 font-mono">${bet.stake}</td>
                      <td className="px-4 py-3">
                        {bet.result === 'pending' ? (
                          <div className="flex gap-1.5">
                            <button onClick={() => updateBetResult(bet.id, 'win')} className="px-2.5 py-1 text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/20 transition-colors">
                              W
                            </button>
                            <button onClick={() => updateBetResult(bet.id, 'loss')} className="px-2.5 py-1 text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-lg hover:bg-rose-500/20 transition-colors">
                              L
                            </button>
                            <button onClick={() => updateBetResult(bet.id, 'push')} className="px-2.5 py-1 text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg hover:bg-amber-500/20 transition-colors">
                              P
                            </button>
                          </div>
                        ) : (
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                            bet.result === 'win' ? 'bg-emerald-500/10 text-emerald-400' :
                            bet.result === 'loss' ? 'bg-rose-500/10 text-rose-400' :
                            'bg-amber-500/10 text-amber-400'
                          }`}>
                            {bet.result.toUpperCase()}
                          </span>
                        )}
                      </td>
                      <td className={`px-4 py-3 text-sm font-bold font-mono ${
                        bet.result === 'win' ? 'text-emerald-400' :
                        bet.result === 'loss' ? 'text-rose-400' :
                        'text-slate-500'
                      }`}>
                        {bet.result === 'win' ? `+$${(bet.payout - bet.stake).toFixed(0)}` :
                         bet.result === 'loss' ? `-$${bet.stake}` : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5">
                          <button onClick={() => onEditBet(bet)} className="p-1.5 text-slate-500 hover:text-indigo-400 transition-colors rounded-lg hover:bg-slate-800">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => deleteBet(bet.id)} className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors rounded-lg hover:bg-slate-800">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 p-4 border-t border-slate-800">
                <button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-white border border-slate-700 rounded-lg transition-colors disabled:opacity-30"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Prev
                </button>
                <span className="text-xs text-slate-500 font-medium">
                  {page + 1} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-white border border-slate-700 rounded-lg transition-colors disabled:opacity-30"
                >
                  Next
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
