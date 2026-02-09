import { Users, Crown } from 'lucide-react';

export default function ComingSoon({ feature }) {
  return (
    <div className="flex items-center justify-center min-h-[60vh] animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center max-w-sm">
        <div className="w-14 h-14 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/20">
          <Users className="w-7 h-7 text-white" />
        </div>
        <h3 className="text-xl font-black text-white mb-2">{feature}</h3>
        <p className="text-slate-500 text-sm mb-6">Coming Soon</p>
        <div className="flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl">
          <Crown className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold text-amber-400">Pro members get early access</span>
        </div>
      </div>
    </div>
  );
}
