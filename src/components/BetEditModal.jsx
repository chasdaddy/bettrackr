import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { calculatePayout } from '../lib/odds';
import { inputStyle, COLORS, SPORT_OPTIONS } from '../lib/styles';

export default function BetEditModal({ bet, onClose, onSave, showToast }) {
  const [form, setForm] = useState({
    sport: bet.sport,
    event: bet.event,
    pick: bet.pick,
    odds: String(bet.odds),
    stake: String(bet.stake),
  });

  const handleSave = async () => {
    if (!form.event || !form.pick || !form.odds || !form.stake) return;

    const odds = parseFloat(form.odds);
    const stake = parseFloat(form.stake);
    const payout = calculatePayout(odds, stake, bet.result);

    const { error } = await supabase
      .from('bets')
      .update({
        sport: form.sport,
        event: form.event,
        pick: form.pick,
        odds,
        stake,
        payout,
      })
      .eq('id', bet.id);

    if (error) {
      showToast(error.message, 'error');
      return;
    }

    onSave({ ...bet, ...form, odds, stake, payout });
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
    }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#1a1a2e',
          border: `1px solid ${COLORS.border}`,
          borderRadius: '12px',
          padding: '30px',
          maxWidth: '500px',
          width: '100%',
        }}
        onClick={e => e.stopPropagation()}
      >
        <h3 style={{ color: COLORS.blue, margin: '0 0 20px 0', letterSpacing: '1px' }}>EDIT BET</h3>

        <div style={{ display: 'grid', gap: '12px', marginBottom: '20px' }}>
          <select
            value={form.sport}
            onChange={e => setForm({ ...form, sport: e.target.value })}
            style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }}
          >
            {SPORT_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <input
            placeholder="Event"
            value={form.event}
            onChange={e => setForm({ ...form, event: e.target.value })}
            style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }}
          />
          <input
            placeholder="Your Pick"
            value={form.pick}
            onChange={e => setForm({ ...form, pick: e.target.value })}
            style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }}
          />
          <input
            placeholder="Odds (-110)"
            value={form.odds}
            onChange={e => setForm({ ...form, odds: e.target.value })}
            style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }}
          />
          <input
            placeholder="Stake ($)"
            value={form.stake}
            onChange={e => setForm({ ...form, stake: e.target.value })}
            style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleSave} style={{
            background: COLORS.green,
            border: 'none',
            color: '#000',
            padding: '12px 24px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontWeight: 'bold',
          }}>
            SAVE CHANGES
          </button>
          <button onClick={onClose} style={{
            background: 'transparent',
            border: `1px solid ${COLORS.border}`,
            color: COLORS.textDim,
            padding: '12px 24px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}>
            CANCEL
          </button>
        </div>
      </div>
    </div>
  );
}
