import { glassCardStyle, inputStyle, cancelButtonStyle, COLORS } from '../lib/styles';

export default function GutCallForm({ newGutCall, setNewGutCall, onSubmit, onCancel }) {
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
        <button onClick={onSubmit} style={{
          background: COLORS.blue,
          border: 'none',
          color: '#000',
          padding: '12px 24px',
          borderRadius: '6px',
          cursor: 'pointer',
          fontFamily: 'inherit',
          fontWeight: 'bold',
          boxShadow: '0 0 10px rgba(0, 212, 255, 0.2)',
        }}>
          SAVE GUT CALL
        </button>
        <button onClick={onCancel} style={cancelButtonStyle}>CANCEL</button>
      </div>
    </div>
  );
}
