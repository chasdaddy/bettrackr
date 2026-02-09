import { useState } from 'react';
import { LayoutGrid, Ticket, Brain, BarChart3, Share2, LogOut, TrendingUp, Crown, Users, Plus } from 'lucide-react';
import LiveWire from './LiveWire';
import BetSlip from './BetSlip';
import PremiumCTA from './PremiumCTA';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
  { id: 'bets', label: 'My Bets', icon: Ticket },
  { id: 'gut calls', label: 'Gut Calls', icon: Brain },
  { id: 'insights', label: 'Insights', icon: BarChart3 },
  { id: 'share', label: 'Share', icon: Share2 },
  { id: 'community', label: 'Community', icon: Users },
];

const PAGE_TITLES = {
  dashboard: { title: 'Dashboard', subtitle: 'Your daily betting snapshot' },
  bets: { title: 'My Bets', subtitle: 'Track and manage your wagers' },
  'gut calls': { title: 'Gut Calls', subtitle: 'The bets you almost placed' },
  insights: { title: 'Insights', subtitle: 'Deep dive into your patterns' },
  share: { title: 'Share Card', subtitle: 'Show off your stats' },
  community: { title: 'Community', subtitle: 'Connect with other bettors' },
};

// Mobile bottom nav: 4 main items + floating center button
const MOBILE_NAV = [
  { id: 'dashboard', icon: LayoutGrid, label: 'Home' },
  { id: 'gut calls', icon: Brain, label: 'Gut Calls' },
  // center "+" button goes here
  { id: 'insights', icon: BarChart3, label: 'Insights' },
  { id: 'share', icon: Share2, label: 'Share' },
];

export default function Layout({ activeTab, setActiveTab, streakInfo, onLogout, rankInfo, archetype, user, pendingBets = [], completedBets = [], bankroll = 0, onOpenPremium, liveMessages, children }) {
  const page = PAGE_TITLES[activeTab] || PAGE_TITLES.dashboard;
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-sans flex flex-col md:flex-row overflow-hidden">

      {/* Desktop Sidebar — hover to expand */}
      <nav
        onMouseEnter={() => setSidebarOpen(true)}
        onMouseLeave={() => setSidebarOpen(false)}
        className={`hidden md:flex flex-col ${sidebarOpen ? 'w-56' : 'w-16'} bg-slate-950 border-r border-slate-900 py-5 shrink-0 transition-all duration-300 overflow-hidden`}
      >
        <div className="flex items-center gap-3 px-3.5 mb-8">
          <div className="w-9 h-9 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
            <TrendingUp className="text-white w-5 h-5" />
          </div>
          <span className={`font-black text-white text-base whitespace-nowrap transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`}>BetTrackr</span>
        </div>

        <div className="space-y-1 flex-1 px-3">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                title={!sidebarOpen ? item.label : undefined}
                className={`w-full h-10 flex items-center gap-3 px-2.5 rounded-xl transition-all duration-200 ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/30' : 'text-slate-600 hover:bg-slate-900 hover:text-slate-300'}`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className={`text-sm font-bold whitespace-nowrap overflow-hidden transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`}>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Bottom section */}
        <div className="mt-auto pt-4 border-t border-slate-900 space-y-2 px-3">
          {rankInfo && (
            <div className="flex items-center gap-3 px-0.5">
              <div className="w-9 h-9 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-sm shrink-0" title={rankInfo.name}>
                {rankInfo.icon}
              </div>
              <div className={`whitespace-nowrap overflow-hidden transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`}>
                <div className="text-xs font-bold text-white">{rankInfo.name}</div>
                {archetype && <div className="text-[10px] text-slate-500">{archetype}</div>}
              </div>
            </div>
          )}
          <button
            onClick={onLogout}
            title={!sidebarOpen ? 'Logout' : undefined}
            className="w-full h-10 flex items-center gap-3 px-2.5 text-slate-600 hover:text-rose-400 transition-colors rounded-xl hover:bg-slate-900"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span className={`text-sm font-bold whitespace-nowrap overflow-hidden transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`}>Logout</span>
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
          {/* Page title */}
          <div className="mb-6 animate-slideUp">
            <h1 className="text-2xl font-black text-white">{page.title}</h1>
            <p className="text-sm text-slate-500 mt-0.5">{page.subtitle}</p>
          </div>

          <div className="animate-slideUp">
            {children}
          </div>
        </div>
      </main>

      {/* Desktop Right Rail */}
      <aside className="hidden xl:flex flex-col w-80 border-l border-slate-900 p-5 shrink-0 overflow-y-auto no-scrollbar">
        <LiveWire messages={liveMessages} />
        <BetSlip pendingBets={pendingBets} completedBets={completedBets} bankroll={bankroll} />
        <PremiumCTA onOpenPremium={onOpenPremium} />

        {/* Trust badge */}
        <div className="mt-4 flex items-center justify-center gap-2 px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-[10px] text-slate-500">Stats verified &middot; 100% transparent tracking</span>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-950/95 backdrop-blur-md border-t border-slate-900 flex justify-around items-end py-2 pb-safe z-40 px-2">
        {MOBILE_NAV.slice(0, 2).map(item => {
          const Icon = item.icon;
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center p-2 rounded-lg transition-colors ${active ? 'text-indigo-400' : 'text-slate-600'}`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[9px] font-bold mt-0.5">{item.label}</span>
            </button>
          );
        })}

        {/* Floating "+" center button */}
        <button
          onClick={() => setActiveTab('bets')}
          className="w-12 h-12 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-full -mt-5 shadow-lg shadow-indigo-500/30 flex items-center justify-center text-white hover:from-indigo-500 hover:to-violet-500 transition-all"
        >
          <Plus className="w-6 h-6" />
        </button>

        {MOBILE_NAV.slice(2).map(item => {
          const Icon = item.icon;
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center p-2 rounded-lg transition-colors ${active ? 'text-indigo-400' : 'text-slate-600'}`}
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
