import { COLORS } from '../lib/styles';

export default function Insights({ completedBets, totalBets, sportBreakdownChart: SportBreakdownChart }) {
  if (totalBets < 5) {
    return (
      <div style={{
        padding: '60px 20px',
        textAlign: 'center',
        background: COLORS.bgDarker,
        borderRadius: '8px',
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '20px' }}>📈</div>
        <h3 style={{ color: COLORS.textDim, margin: '0 0 10px 0' }}>Need more data</h3>
        <p style={{ color: COLORS.textDimmest, margin: 0 }}>Log at least 5 bets to unlock insights</p>
      </div>
    );
  }

  const sportBreakdown = completedBets.reduce((acc, bet) => {
    if (!acc[bet.sport]) acc[bet.sport] = { wins: 0, losses: 0, profit: 0 };
    if (bet.result === 'win') acc[bet.sport].wins++;
    if (bet.result === 'loss') acc[bet.sport].losses++;
    acc[bet.sport].profit += Number(bet.payout) - Number(bet.stake);
    return acc;
  }, {});

  const favs = completedBets.filter(b => b.odds < 0);
  const dogs = completedBets.filter(b => b.odds > 0);
  const favWins = favs.filter(b => b.result === 'win').length;
  const dogWins = dogs.filter(b => b.result === 'win').length;
  const favProfit = favs.reduce((s, b) => s + Number(b.payout) - Number(b.stake), 0);
  const dogProfit = dogs.reduce((s, b) => s + Number(b.payout) - Number(b.stake), 0);

  return (
    <div>
      {/* Sport Breakdown Chart */}
      {SportBreakdownChart && <SportBreakdownChart completedBets={completedBets} />}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px',
      }}>
        {/* Sport breakdown */}
        <div style={{
          background: 'rgba(0, 200, 150, 0.05)',
          border: '1px solid rgba(0, 200, 150, 0.3)',
          borderRadius: '8px',
          padding: '20px',
        }}>
          <h3 style={{ color: COLORS.teal, margin: '0 0 15px 0', fontSize: '0.85rem' }}>
            📊 BY SPORT
          </h3>
          {Object.entries(sportBreakdown).map(([sport, stats]) => (
            <div key={sport} style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '8px 0',
              borderBottom: `1px solid ${COLORS.borderLight}`,
            }}>
              <span style={{ color: COLORS.textMuted }}>{sport}</span>
              <span style={{ color: stats.profit >= 0 ? COLORS.green : COLORS.red }}>
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
          padding: '20px',
        }}>
          <h3 style={{ color: COLORS.gold, margin: '0 0 15px 0', fontSize: '0.85rem' }}>
            🎯 FAVORITES VS UNDERDOGS
          </h3>
          <div style={{ marginBottom: '15px' }}>
            <div style={{ color: COLORS.textMuted, fontSize: '0.8rem' }}>Favorites:</div>
            <div style={{ color: favProfit >= 0 ? COLORS.green : COLORS.red, fontSize: '1.1rem' }}>
              {favWins}/{favs.length} wins &bull; {favProfit >= 0 ? '+' : ''}${favProfit.toFixed(0)}
            </div>
          </div>
          <div>
            <div style={{ color: COLORS.textMuted, fontSize: '0.8rem' }}>Underdogs:</div>
            <div style={{ color: dogProfit >= 0 ? COLORS.green : COLORS.red, fontSize: '1.1rem' }}>
              {dogWins}/{dogs.length} wins &bull; {dogProfit >= 0 ? '+' : ''}${dogProfit.toFixed(0)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
