import { glassCardStyle, inputStyle, cancelButtonStyle, COLORS, SPORT_OPTIONS } from '../lib/styles';

export default function BetForm({ newBet, setNewBet, onSubmit, onCancel }) {
  return (
    <div style={{
      ...glassCardStyle,
      padding: '20px',
      marginBottom: '20px',
    }} className="animate-scaleIn">
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '15px',
        marginBottom: '15px',
      }}>
        <select
          value={newBet.sport}
          onChange={e => setNewBet({ ...newBet, sport: e.target.value })}
          style={inputStyle}
        >
          {SPORT_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
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
        <button onClick={onSubmit} style={{
          background: COLORS.green,
          border: 'none',
          color: '#000',
          padding: '12px 24px',
          borderRadius: '6px',
          cursor: 'pointer',
          fontFamily: 'inherit',
          fontWeight: 'bold',
          boxShadow: '0 0 10px rgba(0, 255, 136, 0.2)',
        }}>
          ADD BET
        </button>
        <button onClick={onCancel} style={cancelButtonStyle}>CANCEL</button>
      </div>
    </div>
  );
}
