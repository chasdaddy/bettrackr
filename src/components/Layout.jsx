import { LayoutGrid, Ticket, Brain, BarChart3, Share2, LogOut, TrendingUp, Crown } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
  { id: 'bets', label: 'My Bets', icon: Ticket },
  { id: 'gut calls', label: 'Gut Calls', icon: Brain },
  { id: 'insights', label: 'Insights', icon: BarChart3 },
  { id: 'share', label: 'Share', icon: Share2 },
];

export default function Layout({ activeTab, setActiveTab, streakInfo, onLogout, rankInfo, archetype, children }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-sans flex flex-col md:flex-row overflow-hidden">

      {/* Desktop Sidebar */}
      <nav className="hidden md:flex flex-col w-60 bg-slate-950 border-r border-slate-900 p-5 shrink-0">
        <div className="flex items-center gap-3 mb-10 pl-2">
          <div className="w-8 h-8 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <TrendingUp className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-black text-white tracking-tight">BetTrackr</span>
        </div>

        <div className="space-y-1.5 flex-1">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' : 'text-slate-500 hover:bg-slate-900 hover:text-slate-300'}`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-bold text-sm">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* User / Rank section at bottom */}
        <div className="mt-auto pt-5 border-t border-slate-900 space-y-3">
          {rankInfo && (
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-sm">
                {rankInfo.icon}
              </div>
              <div>
                <div className="text-xs font-bold text-white">{rankInfo.name}</div>
                {archetype && archetype.id !== 'rookie' && (
                  <div className="text-[10px] text-slate-500">{archetype.icon} {archetype.badge}</div>
                )}
              </div>
              {streakInfo.streak > 0 && (
                <span className={`ml-auto text-xs font-bold ${streakInfo.type === 'win' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {streakInfo.streak}{streakInfo.type === 'win' ? 'W' : 'L'}
                </span>
              )}
            </div>
          )}
          <button
            onClick={onLogout}
            className="flex items-center gap-3 px-4 py-2.5 text-slate-500 hover:text-rose-400 transition-colors w-full rounded-lg hover:bg-slate-900"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-xs font-bold">Logout</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto no-scrollbar">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 bg-slate-950/90 backdrop-blur-md sticky top-0 z-30 border-b border-slate-900">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-white w-4 h-4" />
            </div>
            <span className="font-black text-white text-base">BetTrackr</span>
          </div>
          {rankInfo && (
            <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-full border border-slate-800">
              <span className="text-sm">{rankInfo.icon}</span>
              <span className="text-xs font-bold text-white">{rankInfo.name}</span>
            </div>
          )}
        </div>

        <div className="p-4 md:p-8 max-w-5xl mx-auto pb-24 md:pb-8" key={activeTab}>
          <div className="animate-slideUp">
            {children}
          </div>
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-950/95 backdrop-blur-md border-t border-slate-900 flex justify-around py-2 pb-safe z-40 px-2">
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center p-2 rounded-lg transition-colors ${active ? 'text-indigo-500' : 'text-slate-600'}`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[9px] font-bold mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
