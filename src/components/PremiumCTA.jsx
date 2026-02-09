import { Crown, ArrowRight } from 'lucide-react';

export default function PremiumCTA({ onOpenPremium }) {
  return (
    <div
      onClick={onOpenPremium}
      className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-5 relative overflow-hidden cursor-pointer hover:from-amber-400 hover:to-orange-500 transition-all group"
    >
      <Crown className="absolute -right-3 -bottom-3 w-20 h-20 text-white/10" />
      <div className="text-[10px] font-black uppercase tracking-wider text-amber-100/80 mb-1">Limited Offer</div>
      <div className="text-lg font-black text-white mb-1">Get Pro Analytics</div>
      <p className="text-xs text-amber-100/70 mb-3">Unlock Market Edge, Kelly Calculator & more</p>
      <div className="flex items-center gap-2 text-xs font-bold text-white bg-black/20 rounded-lg px-3 py-2 w-fit group-hover:bg-black/30 transition-colors">
        Start Free Trial
        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
      </div>
    </div>
  );
}
