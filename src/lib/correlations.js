/**
 * Analyze betting patterns and correlations from completed bets.
 */

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function getOddsType(odds) {
  return Number(odds) < 0 ? 'Favorite' : 'Underdog';
}

function getDayOfWeek(dateStr) {
  const d = new Date(dateStr);
  return DAYS[d.getDay()];
}

function getStakeRange(stake) {
  const s = Number(stake);
  if (s <= 25) return '$1-25';
  if (s <= 50) return '$26-50';
  if (s <= 100) return '$51-100';
  return '$100+';
}

/**
 * Analyze correlations in completed bets.
 * Groups by: sport+oddsType, sport+dayOfWeek, stakeRange+outcome
 * Returns top best and worst patterns.
 * @param {Array} completedBets
 * @returns {{ best: Array, worst: Array }}
 */
export function analyzeCorrelations(completedBets) {
  if (completedBets.length < 3) return { best: [], worst: [] };

  const groups = {};

  const addToGroup = (key, bet) => {
    if (!groups[key]) groups[key] = { wins: 0, losses: 0, profit: 0, bets: 0 };
    groups[key].bets++;
    if (bet.result === 'win') {
      groups[key].wins++;
      groups[key].profit += Number(bet.payout) - Number(bet.stake);
    } else {
      groups[key].losses++;
      groups[key].profit -= Number(bet.stake);
    }
  };

  for (const bet of completedBets) {
    // Sport + odds type
    addToGroup(`${bet.sport} + ${getOddsType(bet.odds)}`, bet);

    // Sport + day of week
    if (bet.date) {
      addToGroup(`${bet.sport} + ${getDayOfWeek(bet.date)}`, bet);
    }

    // Stake range
    addToGroup(`${getStakeRange(bet.stake)} stake`, bet);
  }

  // Filter combos with ≥3 bets, compute win rate
  const patterns = Object.entries(groups)
    .filter(([, g]) => g.bets >= 3)
    .map(([label, g]) => ({
      label,
      winRate: Math.round((g.wins / g.bets) * 100),
      profit: Math.round(g.profit),
      bets: g.bets,
    }));

  // Sort by win rate for best, ascending for worst
  const sorted = [...patterns].sort((a, b) => b.winRate - a.winRate);
  const best = sorted.filter(p => p.winRate >= 50).slice(0, 5);
  const worst = sorted.filter(p => p.winRate < 50).reverse().slice(0, 5);

  return { best, worst };
}
