import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { calculatePayout } from '../lib/odds';
import { Plus, Brain } from 'lucide-react';
import GutCallForm from './GutCallForm';

export default function GutCalls({ gutCalls, setGutCalls, userId, showToast }) {
  const [showForm, setShowForm] = useState(false);
  const [newGutCall, setNewGutCall] = useState({ event: '', pick: '', odds: '', potential_stake: '' });

  const addGutCall = async () => {
    if (!newGutCall.event || !newGutCall.pick || !newGutCall.odds || !newGutCall.potential_stake) return;

    const { data, error } = await supabase
      .from('gut_calls')
      .insert({
        user_id: userId,
        event: newGutCall.event,
        pick: newGutCall.pick,
        odds: parseFloat(newGutCall.odds),
        potential_stake: parseFloat(newGutCall.potential_stake),
        date: new Date().toISOString().split('T')[0],
      })
      .select();

    if (error) {
      showToast(error.message, 'error');
      return;
    }
    if (data) {
      setGutCalls([data[0], ...gutCalls]);
      setNewGutCall({ event: '', pick: '', odds: '', potential_stake: '' });
      setShowForm(false);
    }
  };

  const resolveGutCall = async (id, won) => {
    const gc = gutCalls.find(g => g.id === id);
    const wouldHaveWon = won ? calculatePayout(gc.odds, gc.potential_stake, 'win') : 0;

    const { error } = await supabase
      .from('gut_calls')
      .update({
        actual_result: won ? 'won' : 'lost',
        would_have_won: wouldHaveWon,
      })
      .eq('id', id);

    if (error) {
      showToast(error.message, 'error');
      return;
    }
    setGutCalls(gutCalls.map(g => g.id === id
      ? { ...g, actual_result: won ? 'won' : 'lost', would_have_won: wouldHaveWon }
      : g
    ));
  };

  return (
    <div>
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-1">
          <Brain className="w-5 h-5 text-indigo-400" />
          <h2 className="text-lg font-bold text-white">Gut Calls</h2>
        </div>
        <p className="text-sm text-slate-500">
          Log bets you're considering but not placing. See if your gut was right.
        </p>
      </div>

      <button
        onClick={() => setShowForm(true)}
        className="flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm transition-colors shadow-lg shadow-indigo-900/20 mb-5 animate-slideUp"
      >
        <Plus className="w-4 h-4" />
        Log Gut Call
      </button>

      {showForm && (
        <GutCallForm
          newGutCall={newGutCall}
          setNewGutCall={setNewGutCall}
          onSubmit={addGutCall}
          onCancel={() => setShowForm(false)}
        />
      )}

      <div className="space-y-3">
        {gutCalls.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center animate-fadeIn">
            <p className="text-slate-500 text-sm">No gut calls yet. Start tracking those "almost bet" moments!</p>
          </div>
        ) : (
          gutCalls.map((gc, index) => (
            <div
              key={gc.id}
              className={`bg-slate-900 border rounded-2xl p-4 animate-slideUp ${
                gc.actual_result === 'won' ? 'border-emerald-500/20' :
                gc.actual_result === 'lost' ? 'border-rose-500/20' :
                'border-slate-800'
              }`}
            >
              <div className="flex justify-between items-start flex-wrap gap-3">
                <div>
                  <div className="text-xs text-slate-500">{gc.date}</div>
                  <div className="text-white font-bold mt-1">{gc.event}</div>
                  <div className="text-sm text-slate-400 mt-1">
                    {gc.pick} @ <span className="font-mono">{gc.odds > 0 ? `+${gc.odds}` : gc.odds}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Would've bet: <span className="font-mono">${gc.potential_stake}</span>
                  </div>
                </div>
                <div>
                  {!gc.actual_result ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => resolveGutCall(gc.id, true)}
                        className="px-4 py-2 text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl hover:bg-emerald-500/20 transition-colors"
                      >
                        It Hit
                      </button>
                      <button
                        onClick={() => resolveGutCall(gc.id, false)}
                        className="px-4 py-2 text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-xl hover:bg-rose-500/20 transition-colors"
                      >
                        It Missed
                      </button>
                    </div>
                  ) : (
                    <div className={`px-4 py-2.5 rounded-xl text-center ${
                      gc.actual_result === 'won' ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-slate-800 border border-slate-700'
                    }`}>
                      {gc.actual_result === 'won' ? (
                        <>
                          <div className="text-emerald-400 font-bold text-xs">It Hit</div>
                          <div className="text-amber-400 font-bold text-sm mt-0.5">
                            +${gc.would_have_won?.toFixed(0)} missed
                          </div>
                        </>
                      ) : (
                        <div className="text-slate-500 text-xs font-medium">Missed — good fold</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
