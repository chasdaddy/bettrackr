import { useState, useEffect } from 'react';
import { X, Crown, CheckCircle2, Shield, Zap } from 'lucide-react';
import { supabase } from '../lib/supabase';

const FEATURES = [
  'Market Edge Analysis',
  'Kelly Criterion Calculator',
  'CLV Tracking & Alerts',
  'Bet Correlation Finder',
  'Community Access',
  'Priority Support',
];

const STRIPE_URL = import.meta.env.VITE_STRIPE_CHECKOUT_URL;

export default function PremiumModal({ onClose }) {
  const [userCount, setUserCount] = useState(null);

  useEffect(() => {
    supabase
      .from('user_profiles')
      .select('id', { count: 'exact', head: true })
      .then(({ count }) => {
        if (count != null) setUserCount(count);
      })
      .catch(() => {});
  }, []);

  const socialProofText = userCount != null && userCount >= 50
    ? `${userCount.toLocaleString()}+ bettors tracking their edge`
    : userCount != null
      ? 'Join a growing community of bettors'
      : '2,400+ bettors tracking their edge';

  const handleTrial = () => {
    if (STRIPE_URL) {
      window.open(STRIPE_URL, '_blank');
    }
  };

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
          <span className="text-xs font-bold text-emerald-400">{socialProofText}</span>
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

        <button
          onClick={handleTrial}
          disabled={!STRIPE_URL}
          className={`w-full py-3.5 text-white font-black rounded-xl text-sm transition-all shadow-lg shadow-amber-500/20 ${
            STRIPE_URL
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 cursor-pointer'
              : 'bg-slate-700 cursor-not-allowed'
          }`}
        >
          {STRIPE_URL ? 'Start 7-Day Free Trial' : 'Coming Soon'}
        </button>
        <p className="text-center text-[10px] text-slate-600 mt-3">No credit card required &middot; Cancel anytime</p>
      </div>
    </div>
  );
}
