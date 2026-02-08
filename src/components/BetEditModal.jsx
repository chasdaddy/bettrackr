import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { calculatePayout } from '../lib/odds';
import { SPORT_OPTIONS } from '../lib/styles';
import { X } from 'lucide-react';

const inputClass = "w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-colors";

export default function BetEditModal({ bet, onClose, onSave, showToast }) {
  const [form, setForm] = useState({
    sport: bet.sport,
    event: bet.event,
    pick: bet.pick,
    odds: String(bet.odds),
    stake: String(bet.stake),
  });

  const handleSave = async () => {
    if (!form.event || !form.pick || !form.odds || !form.stake) return;

    const odds = parseFloat(form.odds);
    const stake = parseFloat(form.stake);
    const payout = calculatePayout(odds, stake, bet.result);

    const { error } = await supabase
      .from('bets')
      .update({
        sport: form.sport,
        event: form.event,
        pick: form.pick,
        odds,
        stake,
        payout,
      })
      .eq('id', bet.id);

    if (error) {
      showToast(error.message, 'error');
      return;
    }

    onSave({ ...bet, ...form, odds, stake, payout });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[1000] p-5 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full shadow-2xl animate-scaleIn"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <h3 className="text-white font-bold text-lg">Edit Bet</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-3">
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Sport</label>
            <select
              value={form.sport}
              onChange={e => setForm({ ...form, sport: e.target.value })}
              className={inputClass}
            >
              {SPORT_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Event</label>
            <input
              placeholder="Event"
              value={form.event}
              onChange={e => setForm({ ...form, event: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Pick</label>
            <input
              placeholder="Your Pick"
              value={form.pick}
              onChange={e => setForm({ ...form, pick: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Odds</label>
            <input
              placeholder="Odds (-110)"
              value={form.odds}
              onChange={e => setForm({ ...form, odds: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Stake</label>
            <input
              placeholder="Stake ($)"
              value={form.stake}
              onChange={e => setForm({ ...form, stake: e.target.value })}
              className={inputClass}
            />
          </div>
        </div>

        <div className="flex gap-3 p-5 pt-0">
          <button
            onClick={handleSave}
            className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm transition-colors shadow-lg shadow-indigo-900/20"
          >
            Save Changes
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 rounded-xl text-sm transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
