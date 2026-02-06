import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { calculatePayout } from '../lib/odds';
import { thStyle, tdStyle, miniBtn, gradientButtonStyle, COLORS } from '../lib/styles';
import BetForm from './BetForm';

const BETS_PER_PAGE = 20;

export default function BetsList({ bets, setBets, userId, showToast, onEditBet }) {
  const [showForm, setShowForm] = useState(false);
  const [newBet, setNewBet] = useState({ sport: 'NBA', event: '', pick: '', odds: '', stake: '', result: 'pending' });
  const [page, setPage] = useState(0);

  const totalPages = Math.max(1, Math.ceil(bets.length / BETS_PER_PAGE));
  const paginatedBets = bets.slice(page * BETS_PER_PAGE, (page + 1) * BETS_PER_PAGE);

  const addBet = async () => {
    if (!newBet.event || !newBet.pick || !newBet.odds || !newBet.stake) return;

    const odds = parseFloat(newBet.odds);
    const stake = parseFloat(newBet.stake);
    const payout = calculatePayout(odds, stake, newBet.result);

    const { data, error } = await supabase
      .from('bets')
      .insert({
        user_id: userId,
        sport: newBet.sport,
        event: newBet.event,
        pick: newBet.pick,
        odds,
        stake,
        result: newBet.result,
        payout,
        date: new Date().toISOString().split('T')[0],
      })
      .select();

    if (error) {
      showToast(error.message, 'error');
      return;
    }
    if (data) {
      setBets([data[0], ...bets]);
      setNewBet({ sport: 'NBA', event: '', pick: '', odds: '', stake: '', result: 'pending' });
      setShowForm(false);
    }
  };

  const updateBetResult = async (betId, result) => {
    const bet = bets.find(b => b.id === betId);
    const payout = calculatePayout(bet.odds, bet.stake, result);

    const { error } = await supabase
      .from('bets')
      .update({ result, payout })
      .eq('id', betId);

    if (error) {
      showToast(error.message, 'error');
      return;
    }
    setBets(bets.map(b => b.id === betId ? { ...b, result, payout } : b));
  };

  const deleteBet = async (betId) => {
    if (!window.confirm('Delete this bet? This cannot be undone.')) return;

    const { error } = await supabase
      .from('bets')
      .delete()
      .eq('id', betId);

    if (error) {
      showToast(error.message, 'error');
      return;
    }
    setBets(bets.filter(b => b.id !== betId));
  };

  return (
    <div>
      <button
        onClick={() => setShowForm(true)}
        style={{ ...gradientButtonStyle, marginBottom: '20px' }}
      >
        + LOG NEW BET
      </button>

      {showForm && (
        <BetForm
          newBet={newBet}
          setNewBet={setNewBet}
          onSubmit={addBet}
          onCancel={() => setShowForm(false)}
        />
      )}

      <div style={{ background: COLORS.bgDarker, borderRadius: '8px', overflow: 'hidden' }}>
        {bets.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: COLORS.textDimmer }}>
            No bets yet. Start tracking!
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
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
                    <th style={thStyle}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedBets.map(bet => (
                    <tr key={bet.id} style={{ borderBottom: `1px solid ${COLORS.borderLight}` }}>
                      <td style={tdStyle}>{bet.date}</td>
                      <td style={tdStyle}>{bet.sport}</td>
                      <td style={tdStyle}>{bet.event}</td>
                      <td style={tdStyle}>{bet.pick}</td>
                      <td style={tdStyle}>{bet.odds > 0 ? `+${bet.odds}` : bet.odds}</td>
                      <td style={tdStyle}>${bet.stake}</td>
                      <td style={tdStyle}>
                        {bet.result === 'pending' ? (
                          <div style={{ display: 'flex', gap: '5px' }}>
                            <button onClick={() => updateBetResult(bet.id, 'win')} style={miniBtn(COLORS.green)}>W</button>
                            <button onClick={() => updateBetResult(bet.id, 'loss')} style={miniBtn(COLORS.red)}>L</button>
                            <button onClick={() => updateBetResult(bet.id, 'push')} style={miniBtn(COLORS.gold)}>P</button>
                          </div>
                        ) : (
                          <span style={{
                            color: bet.result === 'win' ? COLORS.green : bet.result === 'loss' ? COLORS.red : COLORS.gold,
                          }}>
                            {bet.result.toUpperCase()}
                          </span>
                        )}
                      </td>
                      <td style={{
                        ...tdStyle,
                        color: bet.result === 'win' ? COLORS.green : bet.result === 'loss' ? COLORS.red : COLORS.textDim,
                      }}>
                        {bet.result === 'win' ? `+$${(bet.payout - bet.stake).toFixed(0)}` :
                         bet.result === 'loss' ? `-$${bet.stake}` : '-'}
                      </td>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', gap: '5px' }}>
                          <button onClick={() => onEditBet(bet)} style={miniBtn(COLORS.blue)}>EDIT</button>
                          <button onClick={() => deleteBet(bet.id)} style={miniBtn(COLORS.red)}>DEL</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '15px',
                padding: '15px',
                borderTop: `1px solid ${COLORS.borderLight}`,
              }}>
                <button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  style={{
                    ...miniBtn(COLORS.green),
                    opacity: page === 0 ? 0.3 : 1,
                    padding: '8px 16px',
                  }}
                >
                  PREV
                </button>
                <span style={{ color: COLORS.textDimmer, fontSize: '0.8rem' }}>
                  {page + 1} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  style={{
                    ...miniBtn(COLORS.green),
                    opacity: page >= totalPages - 1 ? 0.3 : 1,
                    padding: '8px 16px',
                  }}
                >
                  NEXT
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
