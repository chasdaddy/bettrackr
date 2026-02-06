import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Supabase client
const supabase = createClient(
  'https://eevijbewaeijygnmfigf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVldmlqYmV3YWVpanlnbm1maWdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzNjQxNzUsImV4cCI6MjA4NTk0MDE3NX0.-pNb10lgCQOZEJPDKEo6tQ_oQzByEM3vDMQR4xMgqOE'
);

export default function BetTrackr() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [bets, setBets] = useState([]);
  const [showAddBet, setShowAddBet] = useState(false);
  const [showGutCall, setShowGutCall] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [newBet, setNewBet] = useState({ sport: 'NBA', event: '', pick: '', odds: '', stake: '', result: 'pending' });
  const [newGutCall, setNewGutCall] = useState({ event: '', pick: '', odds: '', potential_stake: '' });
  const [gutCalls, setGutCalls] = useState([]);

  // Check auth state on load
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

  // Load bets when user logs in
  useEffect(() => {
    if (user) {
      loadBets();
      loadGutCalls();
    }
  }, [user]);

  const loadBets = async () => {
    const { data, error } = await supabase
      .from('bets')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });
    
    if (data) setBets(data);
  };

  const loadGutCalls = async () => {
    const { data, error } = await supabase
      .from('gut_calls')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });
    
    if (data) setGutCalls(data);
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    
    if (authMode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password: authPassword
      });
      if (error) setAuthError(error.message);
    } else {
      const { error } = await supabase.auth.signUp({
        email: authEmail,
        password: authPassword
      });
      if (error) setAuthError(error.message);
      else setAuthError('Check your email to confirm signup!');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setBets([]);
    setGutCalls([]);
  };

  const addBet = async () => {
    if (!newBet.event || !newBet.pick || !newBet.odds || !newBet.stake) return;
    
    const odds = parseFloat(newBet.odds);
    const stake = parseFloat(newBet.stake);
    let payout = 0;
    
    if (newBet.result === 'win') {
      if (odds > 0) {
        payout = stake + (stake * odds / 100);
      } else {
        payout = stake + (stake * 100 / Math.abs(odds));
      }
    }

    const { data, error } = await supabase
      .from('bets')
      .insert({
        user_id: user.id,
        sport: newBet.sport,
        event: newBet.event,
        pick: newBet.pick,
        odds,
        stake,
        result: newBet.result,
        payout,
        date: new Date().toISOString().split('T')[0]
      })
      .select();

    if (data) {
      setBets([data[0], ...bets]);
      setNewBet({ sport: 'NBA', event: '', pick: '', odds: '', stake: '', result: 'pending' });
      setShowAddBet(false);
    }
  };

  const updateBetResult = async (betId, result) => {
    const bet = bets.find(b => b.id === betId);
    let payout = 0;
    
    if (result === 'win') {
      if (bet.odds > 0) {
        payout = bet.stake + (bet.stake * bet.odds / 100);
      } else {
        payout = bet.stake + (bet.stake * 100 / Math.abs(bet.odds));
      }
    }

    const { error } = await supabase
      .from('bets')
      .update({ result, payout })
      .eq('id', betId);

    if (!error) {
      setBets(bets.map(b => b.id === betId ? { ...b, result, payout } : b));
    }
  };

  const addGutCall = async () => {
    if (!newGutCall.event || !newGutCall.pick || !newGutCall.odds || !newGutCall.potential_stake) return;

    const { data, error } = await supabase
      .from('gut_calls')
      .insert({
        user_id: user.id,
        event: newGutCall.event,
        pick: newGutCall.pick,
        odds: parseFloat(newGutCall.odds),
        potential_stake: parseFloat(newGutCall.potential_stake),
        date: new Date().toISOString().split('T')[0]
      })
      .select();

    if (data) {
      setGutCalls([data[0], ...gutCalls]);
      setNewGutCall({ event: '', pick: '', odds: '', potential_stake: '' });
      setShowGutCall(false);
    }
  };

  const resolveGutCall = async (id, won) => {
    const gc = gutCalls.find(g => g.id === id);
    let wouldHaveWon = 0;
    
    if (won) {
      if (gc.odds > 0) {
        wouldHaveWon = gc.potential_stake + (gc.potential_stake * gc.odds / 100);
      } else {
        wouldHaveWon = gc.potential_stake + (gc.potential_stake * 100 / Math.abs(gc.odds));
      }
    }

    const { error } = await supabase
      .from('gut_calls')
      .update({ 
        actual_result: won ? 'won' : 'lost',
        would_have_won: wouldHaveWon
      })
      .eq('id', id);

    if (!error) {
      setGutCalls(gutCalls.map(g => g.id === id ? { ...g, actual_result: won ? 'won' : 'lost', would_have_won: wouldHaveWon } : g));
    }
  };

  // Calculate stats
  const completedBets = bets.filter(b => b.result !== 'pending');
  const totalBets = completedBets.length;
  const wins = completedBets.filter(b => b.result === 'win').length;
  const losses = completedBets.filter(b => b.result === 'loss').length;
  const winRate = totalBets > 0 ? ((wins / totalBets) * 100).toFixed(1) : 0;
  const totalStaked = completedBets.reduce((sum, b) => sum + Number(b.stake), 0);
  const totalPayout = completedBets.reduce((sum, b) => sum + Number(b.payout), 0);
  const profit = totalPayout - totalStaked;
  const roi = totalStaked > 0 ? ((profit / totalStaked) * 100).toFixed(1) : 0;

  // Calculate current streak
  const getStreak = () => {
    let streak = 0;
    let streakType = null;
    for (const bet of completedBets) {
      if (streakType === null) {
        streakType = bet.result;
        streak = 1;
      } else if (bet.result === streakType) {
        streak++;
      } else {
        break;
      }
    }
    return { streak, type: streakType };
  };

  const streakInfo = getStreak();

  // Best sport calculation
  const getBestSport = () => {
    const sportStats = {};
    completedBets.forEach(bet => {
      if (!sportStats[bet.sport]) {
        sportStats[bet.sport] = { staked: 0, payout: 0 };
      }
      sportStats[bet.sport].staked += Number(bet.stake);
      sportStats[bet.sport].payout += Number(bet.payout);
    });
    
    let bestSport = null;
    let bestProfit = -Infinity;
    Object.entries(sportStats).forEach(([sport, stats]) => {
      const profit = stats.payout - stats.staked;
      if (profit > bestProfit) {
        bestProfit = profit;
        bestSport = sport;
      }
    });
    return { sport: bestSport, profit: bestProfit };
  };

  const bestSport = getBestSport();

  // What if best sport only
  const whatIfBestSportOnly = () => {
    const sportBets = completedBets.filter(b => b.sport === bestSport.sport);
    const staked = sportBets.reduce((sum, b) => sum + Number(b.stake), 0);
    const payout = sportBets.reduce((sum, b) => sum + Number(b.payout), 0);
    return payout - staked;
  };

  // Gut calls that would have won
  const missedWins = gutCalls.filter(g => g.actual_result === 'won');
  const totalMissedMoney = missedWins.reduce((sum, g) => sum + Number(g.would_have_won || 0), 0);

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={{ textAlign: 'center', paddingTop: '100px' }}>
          <div style={{ color: '#00ff88', fontSize: '1.5rem' }}>Loading...</div>
        </div>
      </div>
    );
  }

  // Auth screen
  if (!user) {
    return (
      <div style={containerStyle}>
        <div style={{
          maxWidth: '400px',
          margin: '80px auto',
          padding: '40px',
          background: 'rgba(0, 0, 0, 0.4)',
          borderRadius: '12px',
          border: '1px solid #333'
        }}>
          <h1 style={{
            margin: '0 0 10px 0',
            fontSize: '2rem',
            background: 'linear-gradient(90deg, #00ff88, #00d4ff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '3px',
            textAlign: 'center'
          }}>
            BETTRACKR
          </h1>
          <p style={{ color: '#666', textAlign: 'center', marginBottom: '30px', fontSize: '0.8rem' }}>
            Track your edge. Beat the books.
          </p>

          <div style={{ display: 'flex', marginBottom: '20px' }}>
            <button
              onClick={() => setAuthMode('login')}
              style={{
                flex: 1,
                padding: '12px',
                background: authMode === 'login' ? 'rgba(0, 255, 136, 0.15)' : 'transparent',
                border: 'none',
                borderBottom: authMode === 'login' ? '2px solid #00ff88' : '2px solid transparent',
                color: authMode === 'login' ? '#00ff88' : '#666',
                cursor: 'pointer',
                fontFamily: 'inherit'
              }}
            >
              LOGIN
            </button>
            <button
              onClick={() => setAuthMode('signup')}
              style={{
                flex: 1,
                padding: '12px',
                background: authMode === 'signup' ? 'rgba(0, 255, 136, 0.15)' : 'transparent',
                border: 'none',
                borderBottom: authMode === 'signup' ? '2px solid #00ff88' : '2px solid transparent',
                color: authMode === 'signup' ? '#00ff88' : '#666',
                cursor: 'pointer',
                fontFamily: 'inherit'
              }}
            >
              SIGN UP
            </button>
          </div>

          <form onSubmit={handleAuth}>
            <input
              type="email"
              placeholder="Email"
              value={authEmail}
              onChange={e => setAuthEmail(e.target.value)}
              style={{ ...inputStyle, width: '100%', marginBottom: '15px', boxSizing: 'border-box' }}
            />
            <input
              type="password"
              placeholder="Password"
              value={authPassword}
              onChange={e => setAuthPassword(e.target.value)}
              style={{ ...inputStyle, width: '100%', marginBottom: '20px', boxSizing: 'border-box' }}
            />
            {authError && (
              <div style={{ color: authError.includes('Check') ? '#00ff88' : '#ff4444', marginBottom: '15px', fontSize: '0.85rem' }}>
                {authError}
              </div>
            )}
            <button type="submit" style={{
              width: '100%',
              padding: '15px',
              background: 'linear-gradient(90deg, #00ff88, #00d4ff)',
              border: 'none',
              borderRadius: '4px',
              color: '#000',
              fontFamily: 'inherit',
              fontWeight: 'bold',
              fontSize: '1rem',
              cursor: 'pointer'
            }}>
              {authMode === 'login' ? 'LOGIN' : 'CREATE ACCOUNT'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        borderBottom: '1px solid rgba(0, 255, 136, 0.2)',
        paddingBottom: '20px'
      }}>
        <div>
          <h1 style={{
            margin: 0,
            fontSize: '2rem',
            background: 'linear-gradient(90deg, #00ff88, #00d4ff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '3px'
          }}>
            BETTRACKR
          </h1>
          <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '0.75rem', letterSpacing: '2px' }}>
            YOUR EDGE. QUANTIFIED.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {streakInfo.streak > 0 && (
            <div style={{
              background: streakInfo.type === 'win' ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255, 68, 68, 0.1)',
              border: `1px solid ${streakInfo.type === 'win' ? '#00ff88' : '#ff4444'}`,
              padding: '10px 20px',
              borderRadius: '4px'
            }}>
              <span style={{ color: '#888', fontSize: '0.7rem' }}>STREAK </span>
              <span style={{
                color: streakInfo.type === 'win' ? '#00ff88' : '#ff4444',
                fontSize: '1.2rem',
                fontWeight: 'bold'
              }}>
                {streakInfo.streak} {streakInfo.type === 'win' ? '🔥' : '❄️'}
              </span>
            </div>
          )}
          <button onClick={handleLogout} style={{
            background: 'transparent',
            border: '1px solid #444',
            color: '#666',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontSize: '0.75rem'
          }}>
            LOGOUT
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div style={{
        display: 'flex',
        gap: '10px',
        marginBottom: '30px',
        flexWrap: 'wrap'
      }}>
        {['dashboard', 'bets', 'gut calls', 'insights', 'share'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              background: activeTab === tab ? 'rgba(0, 255, 136, 0.15)' : 'transparent',
              border: `1px solid ${activeTab === tab ? '#00ff88' : '#333'}`,
              color: activeTab === tab ? '#00ff88' : '#666',
              padding: '12px 24px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: '0.8rem',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              transition: 'all 0.2s'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div>
          {/* Main Stats Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '20px',
            marginBottom: '30px'
          }}>
            <StatCard 
              label="TOTAL P/L" 
              value={`${profit >= 0 ? '+' : ''}$${profit.toFixed(2)}`}
              color={profit >= 0 ? '#00ff88' : '#ff4444'}
              subtext={`${roi}% ROI`}
            />
            <StatCard 
              label="WIN RATE" 
              value={`${winRate}%`}
              color="#00d4ff"
              subtext={`${wins}W - ${losses}L`}
            />
            <StatCard 
              label="TOTAL WAGERED" 
              value={`$${totalStaked.toFixed(0)}`}
              color="#ffd700"
              subtext={`${totalBets} bets`}
            />
            <StatCard 
              label="BEST SPORT" 
              value={bestSport.sport || 'N/A'}
              color="#ff88ff"
              subtext={bestSport.profit ? `${bestSport.profit >= 0 ? '+' : ''}$${bestSport.profit.toFixed(0)}` : '-'}
            />
          </div>

          {/* Psychological Hooks */}
          {totalBets > 0 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '20px',
              marginBottom: '30px'
            }}>
              {/* You're Leaving Money */}
              {bestSport.sport && whatIfBestSportOnly() > profit && (
                <div style={{
                  background: 'rgba(255, 215, 0, 0.05)',
                  border: '1px solid rgba(255, 215, 0, 0.3)',
                  borderRadius: '8px',
                  padding: '20px'
                }}>
                  <h3 style={{ color: '#ffd700', margin: '0 0 15px 0', fontSize: '0.85rem', letterSpacing: '1px' }}>
                    💰 YOU'RE LEAVING MONEY ON THE TABLE
                  </h3>
                  <p style={{ color: '#ccc', fontSize: '0.9rem', margin: '0 0 10px 0' }}>
                    If you <span style={{ color: '#00ff88' }}>only bet {bestSport.sport}</span>:
                  </p>
                  <div style={{ fontSize: '1.8rem', color: '#00ff88', fontWeight: 'bold' }}>
                    +${whatIfBestSportOnly().toFixed(0)}
                  </div>
                  <p style={{ color: '#888', fontSize: '0.75rem', margin: '10px 0 0 0' }}>
                    Instead: {profit >= 0 ? '+' : ''}${profit.toFixed(0)}
                  </p>
                </div>
              )}

              {/* Gut Calls - Missed Money */}
              {totalMissedMoney > 0 && (
                <div style={{
                  background: 'rgba(0, 212, 255, 0.05)',
                  border: '1px solid rgba(0, 212, 255, 0.3)',
                  borderRadius: '8px',
                  padding: '20px'
                }}>
                  <h3 style={{ color: '#00d4ff', margin: '0 0 15px 0', fontSize: '0.85rem', letterSpacing: '1px' }}>
                    🧠 YOUR GUT WAS RIGHT
                  </h3>
                  <p style={{ color: '#ccc', fontSize: '0.9rem', margin: '0 0 10px 0' }}>
                    Bets you considered but didn't place:
                  </p>
                  <div style={{ fontSize: '1.8rem', color: '#ffd700', fontWeight: 'bold' }}>
                    ${totalMissedMoney.toFixed(0)} left on the table
                  </div>
                  <p style={{ color: '#888', fontSize: '0.75rem', margin: '10px 0 0 0' }}>
                    Trust yourself next time.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Empty state */}
          {totalBets === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '8px',
              border: '1px dashed #333'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '20px' }}>📊</div>
              <h3 style={{ color: '#888', margin: '0 0 10px 0' }}>No bets logged yet</h3>
              <p style={{ color: '#555', margin: '0 0 20px 0' }}>Start tracking to see your edge</p>
              <button
                onClick={() => { setActiveTab('bets'); setShowAddBet(true); }}
                style={{
                  background: 'linear-gradient(90deg, #00ff88, #00d4ff)',
                  border: 'none',
                  color: '#000',
                  padding: '15px 30px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontWeight: 'bold'
                }}
              >
                LOG YOUR FIRST BET
              </button>
            </div>
          )}
        </div>
      )}

      {/* Bets Tab */}
      {activeTab === 'bets' && (
        <div>
          <button
            onClick={() => setShowAddBet(true)}
            style={{
              background: 'linear-gradient(90deg, #00ff88, #00d4ff)',
              border: 'none',
              color: '#000',
              padding: '15px 30px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: '0.9rem',
              fontWeight: 'bold',
              letterSpacing: '1px',
              marginBottom: '20px'
            }}
          >
            + LOG NEW BET
          </button>

          {showAddBet && (
            <div style={{
              background: 'rgba(0, 0, 0, 0.5)',
              border: '1px solid #333',
              borderRadius: '8px',
              padding: '20px',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '15px' }}>
                <select
                  value={newBet.sport}
                  onChange={e => setNewBet({ ...newBet, sport: e.target.value })}
                  style={inputStyle}
                >
                  <option value="NBA">NBA</option>
                  <option value="NFL">NFL</option>
                  <option value="MLB">MLB</option>
                  <option value="NHL">NHL</option>
                  <option value="UFC">UFC</option>
                  <option value="Soccer">Soccer</option>
                  <option value="Tennis">Tennis</option>
                  <option value="NCAAB">NCAAB</option>
                  <option value="NCAAF">NCAAF</option>
                  <option value="Other">Other</option>
                </select>
                <input
                  placeholder="Event"
                  value={newBet.event}
                  onChange={e => setNewBet({ ...newBet, event: e.target.value })}
                  style={inputStyle}
                />
                <input
                  placeholder="Your Pick"
                  value={newBet.pick}
                  onChange={e => setNewBet({ ...newBet, pick: e.target.value })}
                  style={inputStyle}
                />
                <input
                  placeholder="Odds (-110)"
                  value={newBet.odds}
                  onChange={e => setNewBet({ ...newBet, odds: e.target.value })}
                  style={inputStyle}
                />
                <input
                  placeholder="Stake ($)"
                  value={newBet.stake}
                  onChange={e => setNewBet({ ...newBet, stake: e.target.value })}
                  style={inputStyle}
                />
                <select
                  value={newBet.result}
                  onChange={e => setNewBet({ ...newBet, result: e.target.value })}
                  style={inputStyle}
                >
                  <option value="pending">Pending</option>
                  <option value="win">Win</option>
                  <option value="loss">Loss</option>
                  <option value="push">Push</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={addBet} style={{
                  background: '#00ff88',
                  border: 'none',
                  color: '#000',
                  padding: '12px 24px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontWeight: 'bold'
                }}>
                  ADD BET
                </button>
                <button onClick={() => setShowAddBet(false)} style={{
                  background: 'transparent',
                  border: '1px solid #444',
                  color: '#888',
                  padding: '12px 24px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontFamily: 'inherit'
                }}>
                  CANCEL
                </button>
              </div>
            </div>
          )}

          {/* Bet History */}
          <div style={{
            background: 'rgba(0, 0, 0, 0.3)',
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            {bets.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                No bets yet. Start tracking!
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                      <th style={thStyle}>DATE</th>
                      <th style={thStyle}>SPORT</th>
                      <th style={thStyle}>EVENT</th>
                      <th style={thStyle}>PICK</th>
                      <th style={thStyle}>ODDS</th>
                      <th style={thStyle}>STAKE</th>
                      <th style={thStyle}>RESULT</th>
                      <th style={thStyle}>P/L</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bets.map(bet => (
                      <tr key={bet.id} style={{ borderBottom: '1px solid #222' }}>
                        <td style={tdStyle}>{bet.date}</td>
                        <td style={tdStyle}>{bet.sport}</td>
                        <td style={tdStyle}>{bet.event}</td>
                        <td style={tdStyle}>{bet.pick}</td>
                        <td style={tdStyle}>{bet.odds > 0 ? `+${bet.odds}` : bet.odds}</td>
                        <td style={tdStyle}>${bet.stake}</td>
                        <td style={tdStyle}>
                          {bet.result === 'pending' ? (
                            <div style={{ display: 'flex', gap: '5px' }}>
                              <button onClick={() => updateBetResult(bet.id, 'win')} style={miniBtn('#00ff88')}>W</button>
                              <button onClick={() => updateBetResult(bet.id, 'loss')} style={miniBtn('#ff4444')}>L</button>
                              <button onClick={() => updateBetResult(bet.id, 'push')} style={miniBtn('#ffd700')}>P</button>
                            </div>
                          ) : (
                            <span style={{
                              color: bet.result === 'win' ? '#00ff88' : bet.result === 'loss' ? '#ff4444' : '#ffd700'
                            }}>
                              {bet.result.toUpperCase()}
                            </span>
                          )}
                        </td>
                        <td style={{
                          ...tdStyle,
                          color: bet.result === 'win' ? '#00ff88' : bet.result === 'loss' ? '#ff4444' : '#888'
                        }}>
                          {bet.result === 'win' ? `+$${(bet.payout - bet.stake).toFixed(0)}` : 
                           bet.result === 'loss' ? `-$${bet.stake}` : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Gut Calls Tab */}
      {activeTab === 'gut calls' && (
        <div>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ color: '#00d4ff', margin: '0 0 10px 0' }}>🧠 Track Your Gut Calls</h3>
            <p style={{ color: '#888', fontSize: '0.85rem', margin: 0 }}>
              Log bets you're considering but not placing. See if your gut was right.
            </p>
          </div>

          <button
            onClick={() => setShowGutCall(true)}
            style={{
              background: 'linear-gradient(90deg, #00d4ff, #aa88ff)',
              border: 'none',
              color: '#000',
              padding: '15px 30px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: '0.9rem',
              fontWeight: 'bold',
              letterSpacing: '1px',
              marginBottom: '20px'
            }}
          >
            + LOG GUT CALL
          </button>

          {showGutCall && (
            <div style={{
              background: 'rgba(0, 0, 0, 0.5)',
              border: '1px solid #333',
              borderRadius: '8px',
              padding: '20px',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '15px' }}>
                <input
                  placeholder="Event"
                  value={newGutCall.event}
                  onChange={e => setNewGutCall({ ...newGutCall, event: e.target.value })}
                  style={inputStyle}
                />
                <input
                  placeholder="Pick you're considering"
                  value={newGutCall.pick}
                  onChange={e => setNewGutCall({ ...newGutCall, pick: e.target.value })}
                  style={inputStyle}
                />
                <input
                  placeholder="Odds"
                  value={newGutCall.odds}
                  onChange={e => setNewGutCall({ ...newGutCall, odds: e.target.value })}
                  style={inputStyle}
                />
                <input
                  placeholder="Would bet ($)"
                  value={newGutCall.potential_stake}
                  onChange={e => setNewGutCall({ ...newGutCall, potential_stake: e.target.value })}
                  style={inputStyle}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={addGutCall} style={{
                  background: '#00d4ff',
                  border: 'none',
                  color: '#000',
                  padding: '12px 24px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontWeight: 'bold'
                }}>
                  SAVE GUT CALL
                </button>
                <button onClick={() => setShowGutCall(false)} style={{
                  background: 'transparent',
                  border: '1px solid #444',
                  color: '#888',
                  padding: '12px 24px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontFamily: 'inherit'
                }}>
                  CANCEL
                </button>
              </div>
            </div>
          )}

          {/* Gut Calls List */}
          <div style={{ display: 'grid', gap: '15px' }}>
            {gutCalls.length === 0 ? (
              <div style={{
                padding: '40px',
                textAlign: 'center',
                color: '#666',
                background: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '8px'
              }}>
                No gut calls yet. Start tracking those "almost bet" moments!
              </div>
            ) : (
              gutCalls.map(gc => (
                <div key={gc.id} style={{
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: `1px solid ${gc.actual_result === 'won' ? '#00ff88' : gc.actual_result === 'lost' ? '#ff4444' : '#333'}`,
                  borderRadius: '8px',
                  padding: '20px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <div style={{ color: '#aaa', fontSize: '0.75rem' }}>{gc.date}</div>
                      <div style={{ color: '#fff', fontSize: '1.1rem', marginTop: '5px' }}>{gc.event}</div>
                      <div style={{ color: '#888', marginTop: '5px' }}>{gc.pick} @ {gc.odds > 0 ? `+${gc.odds}` : gc.odds}</div>
                      <div style={{ color: '#666', fontSize: '0.85rem', marginTop: '5px' }}>Would've bet: ${gc.potential_stake}</div>
                    </div>
                    <div>
                      {!gc.actual_result ? (
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button onClick={() => resolveGutCall(gc.id, true)} style={{
                            background: 'rgba(0, 255, 136, 0.2)',
                            border: '1px solid #00ff88',
                            color: '#00ff88',
                            padding: '8px 16px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontFamily: 'inherit'
                          }}>
                            IT HIT ✓
                          </button>
                          <button onClick={() => resolveGutCall(gc.id, false)} style={{
                            background: 'rgba(255, 68, 68, 0.2)',
                            border: '1px solid #ff4444',
                            color: '#ff4444',
                            padding: '8px 16px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontFamily: 'inherit'
                          }}>
                            IT MISSED ✗
                          </button>
                        </div>
                      ) : (
                        <div style={{
                          padding: '10px 20px',
                          background: gc.actual_result === 'won' ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255, 68, 68, 0.1)',
                          borderRadius: '4px',
                          textAlign: 'center'
                        }}>
                          {gc.actual_result === 'won' ? (
                            <>
                              <div style={{ color: '#00ff88', fontWeight: 'bold' }}>IT HIT 😤</div>
                              <div style={{ color: '#ffd700', fontSize: '1.2rem', marginTop: '5px' }}>
                                +${gc.would_have_won?.toFixed(0)} missed
                              </div>
                            </>
                          ) : (
                            <div style={{ color: '#888' }}>Missed — good fold</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Insights Tab */}
      {activeTab === 'insights' && (
        <div>
          {totalBets < 5 ? (
            <div style={{
              padding: '60px 20px',
              textAlign: 'center',
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '8px'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '20px' }}>📈</div>
              <h3 style={{ color: '#888', margin: '0 0 10px 0' }}>Need more data</h3>
              <p style={{ color: '#555', margin: 0 }}>Log at least 5 bets to unlock insights</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '20px'
            }}>
              {/* Sport breakdown */}
              <div style={{
                background: 'rgba(0, 200, 150, 0.05)',
                border: '1px solid rgba(0, 200, 150, 0.3)',
                borderRadius: '8px',
                padding: '20px'
              }}>
                <h3 style={{ color: '#00c896', margin: '0 0 15px 0', fontSize: '0.85rem' }}>
                  📊 BY SPORT
                </h3>
                {Object.entries(
                  completedBets.reduce((acc, bet) => {
                    if (!acc[bet.sport]) acc[bet.sport] = { wins: 0, losses: 0, profit: 0 };
                    if (bet.result === 'win') acc[bet.sport].wins++;
                    if (bet.result === 'loss') acc[bet.sport].losses++;
                    acc[bet.sport].profit += Number(bet.payout) - Number(bet.stake);
                    return acc;
                  }, {})
                ).map(([sport, stats]) => (
                  <div key={sport} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '8px 0',
                    borderBottom: '1px solid #222'
                  }}>
                    <span style={{ color: '#aaa' }}>{sport}</span>
                    <span style={{ color: stats.profit >= 0 ? '#00ff88' : '#ff4444' }}>
                      {stats.wins}-{stats.losses} ({stats.profit >= 0 ? '+' : ''}${stats.profit.toFixed(0)})
                    </span>
                  </div>
                ))}
              </div>

              {/* Odds breakdown */}
              <div style={{
                background: 'rgba(255, 215, 0, 0.05)',
                border: '1px solid rgba(255, 215, 0, 0.3)',
                borderRadius: '8px',
                padding: '20px'
              }}>
                <h3 style={{ color: '#ffd700', margin: '0 0 15px 0', fontSize: '0.85rem' }}>
                  🎯 FAVORITES VS UNDERDOGS
                </h3>
                {(() => {
                  const favs = completedBets.filter(b => b.odds < 0);
                  const dogs = completedBets.filter(b => b.odds > 0);
                  const favWins = favs.filter(b => b.result === 'win').length;
                  const dogWins = dogs.filter(b => b.result === 'win').length;
                  const favProfit = favs.reduce((s, b) => s + Number(b.payout) - Number(b.stake), 0);
                  const dogProfit = dogs.reduce((s, b) => s + Number(b.payout) - Number(b.stake), 0);
                  return (
                    <>
                      <div style={{ marginBottom: '15px' }}>
                        <div style={{ color: '#aaa', fontSize: '0.8rem' }}>Favorites:</div>
                        <div style={{ color: favProfit >= 0 ? '#00ff88' : '#ff4444', fontSize: '1.1rem' }}>
                          {favWins}/{favs.length} wins • {favProfit >= 0 ? '+' : ''}${favProfit.toFixed(0)}
                        </div>
                      </div>
                      <div>
                        <div style={{ color: '#aaa', fontSize: '0.8rem' }}>Underdogs:</div>
                        <div style={{ color: dogProfit >= 0 ? '#00ff88' : '#ff4444', fontSize: '1.1rem' }}>
                          {dogWins}/{dogs.length} wins • {dogProfit >= 0 ? '+' : ''}${dogProfit.toFixed(0)}
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Share Tab */}
      {activeTab === 'share' && (
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ color: '#00ff88', marginBottom: '30px', letterSpacing: '2px' }}>
            SHARE YOUR STATS
          </h2>
          
          <div style={{
            background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)',
            border: '2px solid #00ff88',
            borderRadius: '12px',
            padding: '30px',
            maxWidth: '400px',
            margin: '0 auto 30px',
            boxShadow: '0 0 30px rgba(0, 255, 136, 0.2)'
          }}>
            <div style={{
              fontSize: '1.2rem',
              color: '#00ff88',
              letterSpacing: '3px',
              marginBottom: '20px'
            }}>
              BETTRACKR
            </div>
            <div style={{
              fontSize: '2.5rem',
              fontWeight: 'bold',
              color: profit >= 0 ? '#00ff88' : '#ff4444',
              marginBottom: '10px'
            }}>
              {profit >= 0 ? '+' : ''}${profit.toFixed(0)}
            </div>
            <div style={{ color: '#888', marginBottom: '20px' }}>
              This Year
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '15px',
              marginBottom: '20px'
            }}>
              <div>
                <div style={{ color: '#666', fontSize: '0.7rem' }}>WIN RATE</div>
                <div style={{ color: '#00d4ff', fontSize: '1.2rem' }}>{winRate}%</div>
              </div>
              <div>
                <div style={{ color: '#666', fontSize: '0.7rem' }}>RECORD</div>
                <div style={{ color: '#fff', fontSize: '1.2rem' }}>{wins}-{losses}</div>
              </div>
              <div>
                <div style={{ color: '#666', fontSize: '0.7rem' }}>ROI</div>
                <div style={{ color: '#ffd700', fontSize: '1.2rem' }}>{roi}%</div>
              </div>
            </div>
            {streakInfo.streak > 0 && (
              <div style={{
                background: 'rgba(0, 255, 136, 0.1)',
                padding: '10px',
                borderRadius: '4px',
                marginBottom: '15px'
              }}>
                <span style={{ color: streakInfo.type === 'win' ? '#00ff88' : '#ff4444' }}>
                  {streakInfo.streak} {streakInfo.type === 'win' ? 'Win' : 'Loss'} Streak {streakInfo.type === 'win' ? '🔥' : '❄️'}
                </span>
              </div>
            )}
            <div style={{ color: '#444', fontSize: '0.7rem' }}>
              bettrackr.io
            </div>
          </div>

          <p style={{ color: '#666', fontSize: '0.85rem' }}>
            Screenshot and share to Twitter, Discord, or Reddit
          </p>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color, subtext }) {
  return (
    <div style={{
      background: 'rgba(0, 0, 0, 0.4)',
      border: '1px solid #222',
      borderRadius: '8px',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '2px',
        background: color
      }} />
      <div style={{ color: '#666', fontSize: '0.7rem', letterSpacing: '1px', marginBottom: '8px' }}>
        {label}
      </div>
      <div style={{ color, fontSize: '1.8rem', fontWeight: 'bold' }}>
        {value}
      </div>
      <div style={{ color: '#555', fontSize: '0.75rem', marginTop: '5px' }}>
        {subtext}
      </div>
    </div>
  );
}

const containerStyle = {
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #0f0f1a 100%)',
  color: '#e0e0e0',
  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
  padding: '20px',
};

const inputStyle = {
  background: 'rgba(0, 0, 0, 0.5)',
  border: '1px solid #333',
  color: '#e0e0e0',
  padding: '12px',
  borderRadius: '4px',
  fontFamily: 'inherit',
  fontSize: '0.85rem'
};

const thStyle = {
  textAlign: 'left',
  padding: '15px',
  color: '#666',
  fontSize: '0.7rem',
  letterSpacing: '1px',
  fontWeight: 'normal'
};

const tdStyle = {
  padding: '15px',
  fontSize: '0.85rem',
  color: '#aaa'
};

const miniBtn = (color) => ({
  background: 'transparent',
  border: `1px solid ${color}`,
  color: color,
  padding: '4px 8px',
  borderRadius: '3px',
  cursor: 'pointer',
  fontFamily: 'inherit',
  fontSize: '0.75rem'
});
