const inputClass = "w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-colors";

export default function GutCallForm({ newGutCall, setNewGutCall, onSubmit, onCancel }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-5 animate-scaleIn">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3 mb-4">
        <input
          placeholder="Event"
          value={newGutCall.event}
          onChange={e => setNewGutCall({ ...newGutCall, event: e.target.value })}
          className={inputClass}
        />
        <input
          placeholder="Pick you're considering"
          value={newGutCall.pick}
          onChange={e => setNewGutCall({ ...newGutCall, pick: e.target.value })}
          className={inputClass}
        />
        <input
          placeholder="Odds"
          value={newGutCall.odds}
          onChange={e => setNewGutCall({ ...newGutCall, odds: e.target.value })}
          className={inputClass}
        />
        <input
          placeholder="Would bet ($)"
          value={newGutCall.potential_stake}
          onChange={e => setNewGutCall({ ...newGutCall, potential_stake: e.target.value })}
          className={inputClass}
        />
      </div>
      <div className="flex gap-3">
        <button
          onClick={onSubmit}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm transition-colors shadow-lg shadow-indigo-900/20"
        >
          Save Gut Call
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
