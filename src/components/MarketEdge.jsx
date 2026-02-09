import { Lock, TrendingUp, Zap } from 'lucide-react';

const OPPORTUNITIES = [
  { event: 'Lakers vs Celtics', pick: 'Lakers ML', edge: '+4.2%', book: 'DraftKings', visible: true },
  { event: 'Chiefs vs Bills', pick: 'Chiefs -2.5', edge: '+3.8%', book: 'FanDuel', visible: true },
  { event: 'Djokovic vs Alcaraz', pick: 'Over 3.5 sets', edge: '+5.1%', book: 'BetMGM', visible: false },
  { event: 'Man City vs Arsenal', pick: 'BTTS Yes', edge: '+6.3%', book: 'Caesars', visible: false },
];

export default function MarketEdge({ onOpenPremium }) {
  return (
    <div className="animate-slideUp">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-white">Market Edge</h3>
        </div>
        <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">BETA</span>
      </div>

      <div className="space-y-2">
        {OPPORTUNITIES.map((opp, i) => (
          <div key={i} className="relative">
            <div className={`bg-slate-900 border border-slate-800 rounded-xl p-4 ${!opp.visible ? 'blur-[6px] select-none' : ''}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-400">{opp.event}</span>
                <span className="text-[10px] text-slate-600">{opp.book}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">{opp.pick}</span>
                <div className="flex items-center gap-1">
                  <Zap className="w-3 h-3 text-emerald-400" />
                  <span className="text-sm font-bold text-emerald-400">{opp.edge}</span>
                </div>
              </div>
            </div>

            {!opp.visible && (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Lock className="w-4 h-4 text-slate-400 mb-1" />
                <span className="text-[10px] font-bold text-slate-400 mb-2">Premium Opportunity</span>
                <button
                  onClick={onOpenPremium}
                  className="text-[10px] font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1.5 rounded-lg hover:from-amber-400 hover:to-orange-400 transition-all"
                >
                  Unlock Now
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
