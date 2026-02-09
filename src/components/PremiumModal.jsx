import { X, Crown, CheckCircle2, Shield, Zap } from 'lucide-react';

const FEATURES = [
  'Market Edge Analysis',
  'Kelly Criterion Calculator',
  'CLV Tracking & Alerts',
  'Bet Correlation Finder',
  'Community Access',
  'Priority Support',
];

export default function PremiumModal({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[1000] flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-8 relative animate-scaleIn"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-amber-500/20">
            <Crown className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-black text-white mb-1">Go Professional</h2>
          <p className="text-sm text-slate-400">Unlock the tools serious bettors use</p>
        </div>

        {/* Social proof */}
        <div className="flex items-center justify-center gap-2 mb-5 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
          <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold text-emerald-400">2,400+ bettors tracking their edge</span>
        </div>

        <div className="space-y-3 mb-6">
          {FEATURES.map(f => (
            <div key={f} className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span className="text-sm text-slate-300">{f}</span>
            </div>
          ))}
        </div>

        {/* Pro member stat */}
        <div className="flex items-center gap-2 justify-center mb-5 text-xs text-slate-500">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Pro members average <strong className="text-amber-400">+18% ROI</strong> improvement</span>
        </div>

        <div className="text-center mb-4">
          <div className="text-3xl font-black text-white mb-1">
            $19.99<span className="text-base font-bold text-slate-500">/mo</span>
          </div>
        </div>

        <button className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-black rounded-xl text-sm transition-all shadow-lg shadow-amber-500/20">
          Start 7-Day Free Trial
        </button>
        <p className="text-center text-[10px] text-slate-600 mt-3">No credit card required &middot; Cancel anytime</p>
      </div>
    </div>
  );
}
