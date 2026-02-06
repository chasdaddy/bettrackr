import { useState } from 'react';
import { COLORS, glassCardStyle, colorGlow, inputStyle } from '../lib/styles';
import StatCard from './StatCard';

export default function Dashboard({
  stats,
  bets,
  completedBets,
  gutCalls,
  startingBankroll,
  setStartingBankroll,
  onNavigateToBets,
  plChart: PLChart,
  bankrollChart: BankrollChart,
}) {
  const {
    profit, roi, winRate, wins, losses,
    totalBets, totalStaked, bestSport,
    whatIfBestSportOnly, totalMissedMoney,
    streakInfo,
  } = stats;

  const [editingBankroll, setEditingBankroll] = useState(false);
  const [bankrollInput, setBankrollInput] = useState(String(startingBankroll || ''));
  const [bankrollHovered, setBankrollHovered] = useState(false);

  const saveBankroll = () => {
    const val = parseFloat(bankrollInput);
    if (!isNaN(val) && val >= 0) {
      setStartingBankroll(val);
    }
    setEditingBankroll(false);
  };

  return (
    <div>
      {/* Main Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '20px',
        marginBottom: '30px',
      }}>
        <StatCard
          index={0}
          label="TOTAL P/L"
          value={`${profit >= 0 ? '+' : ''}$${profit.toFixed(2)}`}
          color={profit >= 0 ? COLORS.green : COLORS.red}
          subtext={`${roi}% ROI`}
        />
        <StatCard
          index={1}
          label="WIN RATE"
          value={`${winRate}%`}
          color={COLORS.blue}
          subtext={`${wins}W - ${losses}L`}
        />
        <StatCard
          index={2}
          label="TOTAL WAGERED"
          value={`$${totalStaked.toFixed(0)}`}
          color={COLORS.gold}
          subtext={`${totalBets} bets`}
        />
        <StatCard
          index={3}
          label="BEST SPORT"
          value={bestSport.sport || 'N/A'}
          color={COLORS.pink}
          subtext={bestSport.profit ? `${bestSport.profit >= 0 ? '+' : ''}$${bestSport.profit.toFixed(0)}` : '-'}
        />

        {/* Bankroll card */}
        <div
          style={{
            ...glassCardStyle,
            padding: '20px',
            position: 'relative',
            overflow: 'hidden',
            ...(bankrollHovered ? {
              background: COLORS.glassBgHover,
              border: `1px solid ${COLORS.glassBorderHover}`,
              transform: 'translateY(-2px)',
              boxShadow: colorGlow(COLORS.gold),
            } : {}),
          }}
          onMouseEnter={() => setBankrollHovered(true)}
          onMouseLeave={() => setBankrollHovered(false)}
          className="animate-slideUp stagger-5"
        >
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0,
            height: '2px', background: COLORS.gold,
            boxShadow: bankrollHovered ? `0 0 10px ${COLORS.gold}, 0 0 20px ${COLORS.gold}` : 'none',
            transition: 'box-shadow 0.3s ease',
          }} />
          <div style={{ color: COLORS.textDimmer, fontSize: '0.7rem', letterSpacing: '1px', marginBottom: '8px' }}>
            BANKROLL
          </div>
          {startingBankroll > 0 && !editingBankroll ? (
            <>
              <div style={{
                color: COLORS.gold, fontSize: '1.8rem', fontWeight: 'bold',
                textShadow: bankrollHovered ? `0 0 15px ${COLORS.gold}` : 'none',
                transition: 'text-shadow 0.3s ease',
              }}>
                ${(startingBankroll + profit).toFixed(0)}
              </div>
              <div style={{ color: COLORS.textDimmest, fontSize: '0.75rem', marginTop: '5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Started: ${startingBankroll.toFixed(0)}
                <button onClick={() => { setEditingBankroll(true); setBankrollInput(String(startingBankroll)); }} style={{
                  background: 'transparent', border: 'none', color: COLORS.textDimmer,
                  cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.7rem', textDecoration: 'underline',
                }}>
                  edit
                </button>
              </div>
              <div style={{ color: COLORS.textDimmest, fontSize: '0.65rem', marginTop: '3px' }}>
                Stored on this device
              </div>
            </>
          ) : (
            <div>
              <input
                type="number"
                placeholder="Starting bankroll ($)"
                value={bankrollInput}
                onChange={e => setBankrollInput(e.target.value)}
                style={{ ...inputStyle, width: '100%', marginBottom: '8px', boxSizing: 'border-box', fontSize: '0.8rem', padding: '8px' }}
              />
              <div style={{ display: 'flex', gap: '5px' }}>
                <button onClick={saveBankroll} style={{
                  background: COLORS.gold, border: 'none', color: '#000', padding: '6px 12px',
                  borderRadius: '4px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.7rem', fontWeight: 'bold',
                  boxShadow: '0 0 8px rgba(255, 215, 0, 0.2)',
                }}>
                  SET
                </button>
                {startingBankroll > 0 && (
                  <button onClick={() => setEditingBankroll(false)} style={{
                    background: 'transparent', border: `1px solid ${COLORS.glassBorder}`, color: COLORS.textDim,
                    padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.7rem',
                  }}>
                    CANCEL
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* P/L Chart */}
      {PLChart && completedBets.length >= 2 && (
        <div style={{ marginBottom: '30px' }} className="animate-fadeIn">
          <PLChart bets={bets} />
        </div>
      )}

      {/* Bankroll Chart */}
      {BankrollChart && startingBankroll > 0 && completedBets.length >= 2 && (
        <div style={{ marginBottom: '30px' }} className="animate-fadeIn">
          <BankrollChart bets={bets} startingBankroll={startingBankroll} />
        </div>
      )}

      {/* Psychological Hooks */}
      {totalBets > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
          marginBottom: '30px',
        }}>
          {bestSport.sport && whatIfBestSportOnly > profit && (
            <div style={{
              ...glassCardStyle,
              background: 'rgba(255, 215, 0, 0.03)',
              border: '1px solid rgba(255, 215, 0, 0.2)',
              padding: '20px',
            }} className="animate-slideUp">
              <h3 style={{ color: COLORS.gold, margin: '0 0 15px 0', fontSize: '0.85rem', letterSpacing: '1px' }}>
                💰 YOU'RE LEAVING MONEY ON THE TABLE
              </h3>
              <p style={{ color: '#ccc', fontSize: '0.9rem', margin: '0 0 10px 0' }}>
                If you <span style={{ color: COLORS.green }}>only bet {bestSport.sport}</span>:
              </p>
              <div style={{ fontSize: '1.8rem', color: COLORS.green, fontWeight: 'bold', textShadow: '0 0 15px rgba(0, 255, 136, 0.3)' }}>
                +${whatIfBestSportOnly.toFixed(0)}
              </div>
              <p style={{ color: COLORS.textDim, fontSize: '0.75rem', margin: '10px 0 0 0' }}>
                Instead: {profit >= 0 ? '+' : ''}${profit.toFixed(0)}
              </p>
            </div>
          )}

          {totalMissedMoney > 0 && (
            <div style={{
              ...glassCardStyle,
              background: 'rgba(0, 212, 255, 0.03)',
              border: '1px solid rgba(0, 212, 255, 0.2)',
              padding: '20px',
            }} className="animate-slideUp stagger-2">
              <h3 style={{ color: COLORS.blue, margin: '0 0 15px 0', fontSize: '0.85rem', letterSpacing: '1px' }}>
                🧠 YOUR GUT WAS RIGHT
              </h3>
              <p style={{ color: '#ccc', fontSize: '0.9rem', margin: '0 0 10px 0' }}>
                Bets you considered but didn't place:
              </p>
              <div style={{ fontSize: '1.8rem', color: COLORS.gold, fontWeight: 'bold', textShadow: '0 0 15px rgba(255, 215, 0, 0.3)' }}>
                ${totalMissedMoney.toFixed(0)} left on the table
              </div>
              <p style={{ color: COLORS.textDim, fontSize: '0.75rem', margin: '10px 0 0 0' }}>
                Trust yourself next time.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {totalBets === 0 && (
        <div style={{
          ...glassCardStyle,
          textAlign: 'center',
          padding: '60px 20px',
          border: '1px dashed rgba(255, 255, 255, 0.1)',
        }} className="animate-fadeInScale">
          <div style={{ fontSize: '3rem', marginBottom: '20px' }} className="animate-float">📊</div>
          <h3 style={{ color: COLORS.textDim, margin: '0 0 10px 0' }}>No bets logged yet</h3>
          <p style={{ color: COLORS.textDimmest, margin: '0 0 20px 0' }}>Start tracking to see your edge</p>
          <button
            onClick={onNavigateToBets}
            style={{
              background: 'linear-gradient(90deg, #00ff88, #00d4ff)',
              border: 'none',
              color: '#000',
              padding: '15px 30px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontWeight: 'bold',
              boxShadow: '0 4px 15px rgba(0, 255, 136, 0.3)',
            }}
          >
            LOG YOUR FIRST BET
          </button>
        </div>
      )}
    </div>
  );
}
