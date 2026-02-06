import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { calculatePayout } from '../lib/odds';
import { COLORS } from '../lib/styles';
import GutCallForm from './GutCallForm';

export default function GutCalls({ gutCalls, setGutCalls, userId, showToast }) {
  const [showForm, setShowForm] = useState(false);
  const [newGutCall, setNewGutCall] = useState({ event: '', pick: '', odds: '', potential_stake: '' });

  const addGutCall = async () => {
    if (!newGutCall.event || !newGutCall.pick || !newGutCall.odds || !newGutCall.potential_stake) return;

    const { data, error } = await supabase
      .from('gut_calls')
      .insert({
        user_id: userId,
        event: newGutCall.event,
        pick: newGutCall.pick,
        odds: parseFloat(newGutCall.odds),
        potential_stake: parseFloat(newGutCall.potential_stake),
        date: new Date().toISOString().split('T')[0],
      })
      .select();

    if (error) {
      showToast(error.message, 'error');
      return;
    }
    if (data) {
      setGutCalls([data[0], ...gutCalls]);
      setNewGutCall({ event: '', pick: '', odds: '', potential_stake: '' });
      setShowForm(false);
    }
  };

  const resolveGutCall = async (id, won) => {
    const gc = gutCalls.find(g => g.id === id);
    const wouldHaveWon = won ? calculatePayout(gc.odds, gc.potential_stake, 'win') : 0;

    const { error } = await supabase
      .from('gut_calls')
      .update({
        actual_result: won ? 'won' : 'lost',
        would_have_won: wouldHaveWon,
      })
      .eq('id', id);

    if (error) {
      showToast(error.message, 'error');
      return;
    }
    setGutCalls(gutCalls.map(g => g.id === id
      ? { ...g, actual_result: won ? 'won' : 'lost', would_have_won: wouldHaveWon }
      : g
    ));
  };

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ color: COLORS.blue, margin: '0 0 10px 0' }}>🧠 Track Your Gut Calls</h3>
        <p style={{ color: COLORS.textDim, fontSize: '0.85rem', margin: 0 }}>
          Log bets you're considering but not placing. See if your gut was right.
        </p>
      </div>

      <button
        onClick={() => setShowForm(true)}
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
          marginBottom: '20px',
        }}
      >
        + LOG GUT CALL
      </button>

      {showForm && (
        <GutCallForm
          newGutCall={newGutCall}
          setNewGutCall={setNewGutCall}
          onSubmit={addGutCall}
          onCancel={() => setShowForm(false)}
        />
      )}

      <div style={{ display: 'grid', gap: '15px' }}>
        {gutCalls.length === 0 ? (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            color: COLORS.textDimmer,
            background: COLORS.bgDarker,
            borderRadius: '8px',
          }}>
            No gut calls yet. Start tracking those "almost bet" moments!
          </div>
        ) : (
          gutCalls.map(gc => (
            <div key={gc.id} style={{
              background: COLORS.bgCard,
              border: `1px solid ${gc.actual_result === 'won' ? COLORS.green : gc.actual_result === 'lost' ? COLORS.red : COLORS.border}`,
              borderRadius: '8px',
              padding: '20px',
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'start',
                flexWrap: 'wrap',
                gap: '10px',
              }}>
                <div>
                  <div style={{ color: COLORS.textMuted, fontSize: '0.75rem' }}>{gc.date}</div>
                  <div style={{ color: '#fff', fontSize: '1.1rem', marginTop: '5px' }}>{gc.event}</div>
                  <div style={{ color: COLORS.textDim, marginTop: '5px' }}>
                    {gc.pick} @ {gc.odds > 0 ? `+${gc.odds}` : gc.odds}
                  </div>
                  <div style={{ color: COLORS.textDimmer, fontSize: '0.85rem', marginTop: '5px' }}>
                    Would've bet: ${gc.potential_stake}
                  </div>
                </div>
                <div>
                  {!gc.actual_result ? (
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={() => resolveGutCall(gc.id, true)} style={{
                        background: 'rgba(0, 255, 136, 0.2)',
                        border: `1px solid ${COLORS.green}`,
                        color: COLORS.green,
                        padding: '8px 16px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                      }}>
                        IT HIT ✓
                      </button>
                      <button onClick={() => resolveGutCall(gc.id, false)} style={{
                        background: 'rgba(255, 68, 68, 0.2)',
                        border: `1px solid ${COLORS.red}`,
                        color: COLORS.red,
                        padding: '8px 16px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                      }}>
                        IT MISSED ✗
                      </button>
                    </div>
                  ) : (
                    <div style={{
                      padding: '10px 20px',
                      background: gc.actual_result === 'won' ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255, 68, 68, 0.1)',
                      borderRadius: '4px',
                      textAlign: 'center',
                    }}>
                      {gc.actual_result === 'won' ? (
                        <>
                          <div style={{ color: COLORS.green, fontWeight: 'bold' }}>IT HIT 😤</div>
                          <div style={{ color: COLORS.gold, fontSize: '1.2rem', marginTop: '5px' }}>
                            +${gc.would_have_won?.toFixed(0)} missed
                          </div>
                        </>
                      ) : (
                        <div style={{ color: COLORS.textDim }}>Missed — good fold</div>
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
  );
}
