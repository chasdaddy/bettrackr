import { containerStyle, glassCardStyle, COLORS } from '../lib/styles';

const TABS = ['dashboard', 'bets', 'gut calls', 'insights', 'share'];

export default function Layout({ activeTab, setActiveTab, streakInfo, onLogout, children }) {
  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={{
        ...glassCardStyle,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        padding: '20px 25px',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.3), 0 0 15px rgba(0, 255, 136, 0.05)',
      }} className="animate-slideUp">
        <div>
          <h1 style={{
            margin: 0,
            fontSize: '2rem',
            background: 'linear-gradient(90deg, #00ff88, #00d4ff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '3px',
            filter: 'drop-shadow(0 0 10px rgba(0, 255, 136, 0.3))',
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
              borderRadius: '8px',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}>
              <span style={{ color: COLORS.textDim, fontSize: '0.7rem' }}>STREAK </span>
              <span style={{
                color: streakInfo.type === 'win' ? COLORS.green : COLORS.red,
                fontSize: '1.2rem',
                fontWeight: 'bold',
                textShadow: `0 0 10px ${streakInfo.type === 'win' ? 'rgba(0,255,136,0.4)' : 'rgba(255,68,68,0.4)'}`,
              }}>
                {streakInfo.streak} {streakInfo.type === 'win' ? '\u{1F525}' : '\u{2744}\u{FE0F}'}
              </span>
            </div>
          )}
          <button onClick={onLogout} style={{
            background: 'transparent',
            border: `1px solid ${COLORS.glassBorder}`,
            color: COLORS.textDimmer,
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontSize: '0.75rem',
          }}>
            LOGOUT
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div style={{
        ...glassCardStyle,
        display: 'flex',
        gap: '8px',
        marginBottom: '30px',
        padding: '8px',
        flexWrap: 'wrap',
      }} className="animate-slideUp stagger-2">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              background: activeTab === tab ? 'rgba(0, 255, 136, 0.1)' : 'transparent',
              border: `1px solid ${activeTab === tab ? 'rgba(0, 255, 136, 0.3)' : 'rgba(255, 255, 255, 0.05)'}`,
              color: activeTab === tab ? COLORS.green : COLORS.textDimmer,
              padding: '12px 24px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: '0.8rem',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              transition: 'all 0.3s ease',
              boxShadow: activeTab === tab ? '0 0 15px rgba(0, 255, 136, 0.15)' : 'none',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="tab-content" key={activeTab}>
        {children}
      </div>
    </div>
  );
}
