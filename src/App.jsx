import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from './lib/supabase';
import { FullPageSpinner } from './components/LoadingSpinner';
import Toast from './components/Toast';
import Auth from './components/Auth';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import BetsList from './components/BetsList';
import BetEditModal from './components/BetEditModal';
import GutCalls from './components/GutCalls';
import Insights from './components/Insights';
import ShareCard from './components/ShareCard';
import PLChart from './components/PLChart';
import SportBreakdownChart from './components/SportBreakdownChart';
import BankrollChart from './components/BankrollChart';
import PremiumModal from './components/PremiumModal';
import Leaderboard from './components/Leaderboard';
import { calculateRank, detectArchetype, generatePsychHooks, getDetailedStreaks, getDayOfWeekStats } from './lib/ranks';
import { fetchOdds, findEdges, formatMovements } from './lib/oddsApi';
import { upsertProfile, fetchOwnProfile } from './lib/leaderboard';

export default function BetTrackr() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [bets, setBets] = useState([]);
  const [gutCalls, setGutCalls] = useState([]);
  const [toast, setToast] = useState(null);
  const [editingBet, setEditingBet] = useState(null);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [startingBankroll, setStartingBankroll] = useState(() => {
    const saved = localStorage.getItem('bettrackr_bankroll');
    return saved ? parseFloat(saved) : 0;
  });

  // Odds API state
  const [oddsData, setOddsData] = useState(null);
  const [opportunities, setOpportunities] = useState(null);
  const [liveMessages, setLiveMessages] = useState(null);

  // Leaderboard state
  const [userProfile, setUserProfile] = useState(null);
  const profileSyncRef = useRef(null);

  const showToast = useCallback((message, type = 'error') => {
    setToast({ message, type });
  }, []);

  const persistBankroll = (val) => {
    setStartingBankroll(val);
    localStorage.setItem('bettrackr_bankroll', String(val));
  };

  // Auth state
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load data
  useEffect(() => {
    if (!user) return;

    const loadBets = async () => {
      const { data, error } = await supabase
        .from('bets')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });
      if (error) showToast(error.message);
      else if (data) setBets(data);
    };

    const loadGutCalls = async () => {
      const { data, error } = await supabase
        .from('gut_calls')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });
      if (error) showToast(error.message);
      else if (data) setGutCalls(data);
    };

    loadBets();
    loadGutCalls();
  }, [user, showToast]);

  // Fetch odds data on mount (if API key exists)
  useEffect(() => {
    const apiKey = import.meta.env.VITE_ODDS_API_KEY;
    if (!apiKey) return;

    fetchOdds(apiKey).then(data => {
      if (data && data.length > 0) {
        setOddsData(data);
        setOpportunities(findEdges(data));
        setLiveMessages(formatMovements(data));
      }
    }).catch(() => {});
  }, []);

  // Load user profile
  const loadProfile = useCallback(async () => {
    if (!user) return;
    const { data } = await fetchOwnProfile(user.id);
    setUserProfile(data);
  }, [user]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // Auto-sync profile when bets change
  useEffect(() => {
    if (!user || bets.length === 0) return;

    // Debounce profile sync
    if (profileSyncRef.current) clearTimeout(profileSyncRef.current);
    profileSyncRef.current = setTimeout(async () => {
      const completed = bets.filter(b => b.result !== 'pending');
      const total = completed.length;
      if (total === 0) return;

      const w = completed.filter(b => b.result === 'win').length;
      const staked = completed.reduce((s, b) => s + Number(b.stake), 0);
      const payout = completed.reduce((s, b) => s + Number(b.payout), 0);
      const p = payout - staked;
      const r = staked > 0 ? ((p / staked) * 100) : 0;
      const wr = total > 0 ? ((w / total) * 100) : 0;

      const rank = calculateRank(total, wr, p);
      const arch = detectArchetype(completed, wr, p);
      const streaks = getDetailedStreaks(completed);

      await upsertProfile(user.id, {
        totalBets: total,
        winRate: parseFloat(wr.toFixed(1)),
        roi: parseFloat(r.toFixed(1)),
        profit: parseFloat(p.toFixed(2)),
        rankTier: rank?.tier || 'rookie',
        archetype: arch || 'rookie',
        bestStreak: streaks?.longestWin || 0,
      });
      loadProfile();
    }, 2000);

    return () => {
      if (profileSyncRef.current) clearTimeout(profileSyncRef.current);
    };
  }, [user, bets, loadProfile]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setBets([]);
    setGutCalls([]);
    setUserProfile(null);
  };

  // Computed stats
  const completedBets = bets.filter(b => b.result !== 'pending');
  const pendingBets = bets.filter(b => b.result === 'pending');
  const totalBets = completedBets.length;
  const wins = completedBets.filter(b => b.result === 'win').length;
  const losses = completedBets.filter(b => b.result === 'loss').length;
  const winRate = totalBets > 0 ? ((wins / totalBets) * 100).toFixed(1) : 0;
  const totalStaked = completedBets.reduce((sum, b) => sum + Number(b.stake), 0);
  const totalPayout = completedBets.reduce((sum, b) => sum + Number(b.payout), 0);
  const profit = totalPayout - totalStaked;
  const roi = totalStaked > 0 ? ((profit / totalStaked) * 100).toFixed(1) : 0;

  const getStreak = () => {
    let streak = 0;
    let streakType = null;
    for (const bet of completedBets) {
      if (streakType === null) { streakType = bet.result; streak = 1; }
      else if (bet.result === streakType) { streak++; }
      else { break; }
    }
    return { streak, type: streakType };
  };
  const streakInfo = getStreak();

  const getBestSport = () => {
    const sportStats = {};
    completedBets.forEach(bet => {
      if (!sportStats[bet.sport]) sportStats[bet.sport] = { staked: 0, payout: 0 };
      sportStats[bet.sport].staked += Number(bet.stake);
      sportStats[bet.sport].payout += Number(bet.payout);
    });
    let bestSport = null;
    let bestProfit = -Infinity;
    Object.entries(sportStats).forEach(([sport, s]) => {
      const p = s.payout - s.staked;
      if (p > bestProfit) { bestProfit = p; bestSport = sport; }
    });
    return { sport: bestSport, profit: bestProfit };
  };
  const bestSport = getBestSport();

  const rankInfo = calculateRank(totalBets, parseFloat(winRate), profit);
  const archetype = detectArchetype(completedBets, parseFloat(winRate), profit);
  const detailedStreaks = getDetailedStreaks(completedBets);
  const dayOfWeekStats = getDayOfWeekStats(completedBets);

  const whatIfBestSportOnly = () => {
    const sportBets = completedBets.filter(b => b.sport === bestSport.sport);
    const staked = sportBets.reduce((sum, b) => sum + Number(b.stake), 0);
    const payout = sportBets.reduce((sum, b) => sum + Number(b.payout), 0);
    return payout - staked;
  };

  const missedWins = gutCalls.filter(g => g.actual_result === 'won');
  const totalMissedMoney = missedWins.reduce((sum, g) => sum + Number(g.would_have_won || 0), 0);

  const psychHooks = generatePsychHooks(completedBets, { totalMissedMoney, detailedStreaks }, rankInfo);

  const currentBankroll = startingBankroll + profit;

  const stats = {
    profit, roi, winRate, wins, losses,
    totalBets, totalStaked, bestSport, streakInfo,
    whatIfBestSportOnly: whatIfBestSportOnly(),
    totalMissedMoney,
    rankInfo, archetype, detailedStreaks, dayOfWeekStats, psychHooks,
  };

  const handleEditSave = (updatedBet) => {
    setBets(bets.map(b => b.id === updatedBet.id ? updatedBet : b));
  };

  const openPremium = () => setShowPremiumModal(true);

  if (loading) return <FullPageSpinner />;
  if (!user) return <Auth />;

  return (
    <Layout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      streakInfo={streakInfo}
      onLogout={handleLogout}
      rankInfo={rankInfo}
      archetype={archetype}
      user={user}
      pendingBets={pendingBets}
      completedBets={completedBets}
      bankroll={currentBankroll > 0 ? currentBankroll : startingBankroll}
      onOpenPremium={openPremium}
      liveMessages={liveMessages}
    >
      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
      {showPremiumModal && <PremiumModal onClose={() => setShowPremiumModal(false)} />}
      {editingBet && (
        <BetEditModal
          bet={editingBet}
          onClose={() => setEditingBet(null)}
          onSave={handleEditSave}
          showToast={showToast}
        />
      )}

      {activeTab === 'dashboard' && (
        <Dashboard
          stats={stats}
          bets={bets}
          completedBets={completedBets}
          gutCalls={gutCalls}
          startingBankroll={startingBankroll}
          setStartingBankroll={persistBankroll}
          onNavigateToBets={() => setActiveTab('bets')}
          onOpenPremium={openPremium}
          pendingBets={pendingBets}
          plChart={PLChart}
          bankrollChart={BankrollChart}
          opportunities={opportunities}
        />
      )}

      {activeTab === 'bets' && (
        <BetsList
          bets={bets}
          setBets={setBets}
          userId={user.id}
          showToast={showToast}
          onEditBet={setEditingBet}
        />
      )}

      {activeTab === 'gut calls' && (
        <GutCalls
          gutCalls={gutCalls}
          setGutCalls={setGutCalls}
          userId={user.id}
          showToast={showToast}
        />
      )}

      {activeTab === 'insights' && (
        <Insights
          completedBets={completedBets}
          totalBets={totalBets}
          sportBreakdownChart={SportBreakdownChart}
          dayOfWeekStats={dayOfWeekStats}
          onOpenPremium={openPremium}
          bankroll={currentBankroll > 0 ? currentBankroll : startingBankroll}
        />
      )}

      {activeTab === 'share' && <ShareCard stats={stats} />}

      {activeTab === 'community' && (
        <Leaderboard
          user={user}
          stats={stats}
          profile={userProfile}
          onProfileUpdate={loadProfile}
        />
      )}
    </Layout>
  );
}
