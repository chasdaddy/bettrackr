import { useState, useEffect, useCallback } from 'react';
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

export default function BetTrackr() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [bets, setBets] = useState([]);
  const [gutCalls, setGutCalls] = useState([]);
  const [toast, setToast] = useState(null);
  const [editingBet, setEditingBet] = useState(null);
  const [startingBankroll, setStartingBankroll] = useState(() => {
    const saved = localStorage.getItem('bettrackr_bankroll');
    return saved ? parseFloat(saved) : 0;
  });

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setBets([]);
    setGutCalls([]);
  };

  // Computed stats
  const completedBets = bets.filter(b => b.result !== 'pending');
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

  const whatIfBestSportOnly = () => {
    const sportBets = completedBets.filter(b => b.sport === bestSport.sport);
    const staked = sportBets.reduce((sum, b) => sum + Number(b.stake), 0);
    const payout = sportBets.reduce((sum, b) => sum + Number(b.payout), 0);
    return payout - staked;
  };

  const missedWins = gutCalls.filter(g => g.actual_result === 'won');
  const totalMissedMoney = missedWins.reduce((sum, g) => sum + Number(g.would_have_won || 0), 0);

  const stats = {
    profit, roi, winRate, wins, losses,
    totalBets, totalStaked, bestSport, streakInfo,
    whatIfBestSportOnly: whatIfBestSportOnly(),
    totalMissedMoney,
  };

  const handleEditSave = (updatedBet) => {
    setBets(bets.map(b => b.id === updatedBet.id ? updatedBet : b));
  };

  if (loading) return <FullPageSpinner />;
  if (!user) return <Auth />;

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} streakInfo={streakInfo} onLogout={handleLogout}>
      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
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
          plChart={PLChart}
          bankrollChart={BankrollChart}
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
        />
      )}

      {activeTab === 'share' && <ShareCard stats={stats} />}
    </Layout>
  );
}
