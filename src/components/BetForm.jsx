import { SPORT_OPTIONS } from '../lib/styles';

const inputClass = "w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-colors";

export default function BetForm({ newBet, setNewBet, onSubmit, onCancel }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-5 animate-scaleIn">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3 mb-4">
        <select
          value={newBet.sport}
          onChange={e => setNewBet({ ...newBet, sport: e.target.value })}
          className={inputClass}
        >
          {SPORT_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <input
          placeholder="Event"
          value={newBet.event}
          onChange={e => setNewBet({ ...newBet, event: e.target.value })}
          className={inputClass}
        />
        <input
          placeholder="Your Pick"
          value={newBet.pick}
          onChange={e => setNewBet({ ...newBet, pick: e.target.value })}
          className={inputClass}
        />
        <input
          placeholder="Odds (-110)"
          value={newBet.odds}
          onChange={e => setNewBet({ ...newBet, odds: e.target.value })}
          className={inputClass}
        />
        <input
          placeholder="Stake ($)"
          value={newBet.stake}
          onChange={e => setNewBet({ ...newBet, stake: e.target.value })}
          className={inputClass}
        />
        <select
          value={newBet.result}
          onChange={e => setNewBet({ ...newBet, result: e.target.value })}
          className={inputClass}
        >
          <option value="pending">Pending</option>
          <option value="win">Win</option>
          <option value="loss">Loss</option>
          <option value="push">Push</option>
        </select>
      </div>
      <div className="flex gap-3">
        <button
          onClick={onSubmit}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm transition-colors shadow-lg shadow-indigo-900/20"
        >
          Add Bet
        </button>
        <button
          onClick={onCancel}
          className="px-6 py-3 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 rounded-xl text-sm transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
