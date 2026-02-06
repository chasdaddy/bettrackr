import { COLORS } from '../lib/styles';

export default function ShareCard({ stats }) {
  const { profit, winRate, wins, losses, roi, streakInfo } = stats;

  return (
    <div style={{ textAlign: 'center' }}>
      <h2 style={{ color: COLORS.green, marginBottom: '30px', letterSpacing: '2px' }}>
        SHARE YOUR STATS
      </h2>

      <div style={{
        background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)',
        border: `2px solid ${COLORS.green}`,
        borderRadius: '12px',
        padding: '30px',
        maxWidth: '400px',
        margin: '0 auto 30px',
        boxShadow: '0 0 30px rgba(0, 255, 136, 0.2)',
      }}>
        <div style={{ fontSize: '1.2rem', color: COLORS.green, letterSpacing: '3px', marginBottom: '20px' }}>
          BETTRACKR
        </div>
        <div style={{
          fontSize: '2.5rem',
          fontWeight: 'bold',
          color: profit >= 0 ? COLORS.green : COLORS.red,
          marginBottom: '10px',
        }}>
          {profit >= 0 ? '+' : ''}${profit.toFixed(0)}
        </div>
        <div style={{ color: COLORS.textDim, marginBottom: '20px' }}>This Year</div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '15px',
          marginBottom: '20px',
        }}>
          <div>
            <div style={{ color: COLORS.textDimmer, fontSize: '0.7rem' }}>WIN RATE</div>
            <div style={{ color: COLORS.blue, fontSize: '1.2rem' }}>{winRate}%</div>
          </div>
          <div>
            <div style={{ color: COLORS.textDimmer, fontSize: '0.7rem' }}>RECORD</div>
            <div style={{ color: '#fff', fontSize: '1.2rem' }}>{wins}-{losses}</div>
          </div>
          <div>
            <div style={{ color: COLORS.textDimmer, fontSize: '0.7rem' }}>ROI</div>
            <div style={{ color: COLORS.gold, fontSize: '1.2rem' }}>{roi}%</div>
          </div>
        </div>
        {streakInfo.streak > 0 && (
          <div style={{
            background: 'rgba(0, 255, 136, 0.1)',
            padding: '10px',
            borderRadius: '4px',
            marginBottom: '15px',
          }}>
            <span style={{ color: streakInfo.type === 'win' ? COLORS.green : COLORS.red }}>
              {streakInfo.streak} {streakInfo.type === 'win' ? 'Win' : 'Loss'} Streak {streakInfo.type === 'win' ? '\u{1F525}' : '\u{2744}\u{FE0F}'}
            </span>
          </div>
        )}
        <div style={{ color: '#444', fontSize: '0.7rem' }}>bettrackr.io</div>
      </div>

      <p style={{ color: COLORS.textDimmer, fontSize: '0.85rem' }}>
        Screenshot and share to Twitter, Discord, or Reddit
      </p>
    </div>
  );
}
