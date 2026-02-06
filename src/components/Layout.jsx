import { containerStyle, COLORS } from '../lib/styles';

const TABS = ['dashboard', 'bets', 'gut calls', 'insights', 'share'];

export default function Layout({ activeTab, setActiveTab, streakInfo, onLogout, children }) {
  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        borderBottom: '1px solid rgba(0, 255, 136, 0.2)',
        paddingBottom: '20px',
      }}>
        <div>
          <h1 style={{
            margin: 0,
            fontSize: '2rem',
            background: 'linear-gradient(90deg, #00ff88, #00d4ff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '3px',
          }}>
            BETTRACKR
          </h1>
          <p style={{ margin: '5px 0 0 0', color: COLORS.textDimmer, fontSize: '0.75rem', letterSpacing: '2px' }}>
            YOUR EDGE. QUANTIFIED.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {streakInfo.streak > 0 && (
            <div style={{
              background: streakInfo.type === 'win' ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255, 68, 68, 0.1)',
              border: `1px solid ${streakInfo.type === 'win' ? COLORS.green : COLORS.red}`,
              padding: '10px 20px',
              borderRadius: '4px',
            }}>
              <span style={{ color: COLORS.textDim, fontSize: '0.7rem' }}>STREAK </span>
              <span style={{
                color: streakInfo.type === 'win' ? COLORS.green : COLORS.red,
                fontSize: '1.2rem',
                fontWeight: 'bold',
              }}>
                {streakInfo.streak} {streakInfo.type === 'win' ? '\u{1F525}' : '\u{2744}\u{FE0F}'}
              </span>
            </div>
          )}
          <button onClick={onLogout} style={{
            background: 'transparent',
            border: '1px solid #444',
            color: COLORS.textDimmer,
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontSize: '0.75rem',
          }}>
            LOGOUT
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', flexWrap: 'wrap' }}>
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              background: activeTab === tab ? 'rgba(0, 255, 136, 0.15)' : 'transparent',
              border: `1px solid ${activeTab === tab ? COLORS.green : COLORS.border}`,
              color: activeTab === tab ? COLORS.green : COLORS.textDimmer,
              padding: '12px 24px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: '0.8rem',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              transition: 'all 0.2s',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {children}
    </div>
  );
}
