/**
 * Kelly Criterion calculator for sports betting.
 */

/**
 * Convert American odds to decimal odds.
 * @param {number} odds - American odds (e.g. -110, +150)
 * @returns {number} Decimal odds (e.g. 1.909, 2.5)
 */
export function americanToDecimal(odds) {
  if (odds > 0) return (odds / 100) + 1;
  return (100 / Math.abs(odds)) + 1;
}

/**
 * Calculate Kelly criterion stake recommendation.
 * @param {number} americanOdds - American odds
 * @param {number} winRate - Win probability as decimal (0-1)
 * @param {number} bankroll - Current bankroll
 * @returns {{ fraction: number, recommendedStake: number, expectedValue: number }}
 */
export function calculateKelly(americanOdds, winRate, bankroll) {
  const decimal = americanToDecimal(americanOdds);
  const b = decimal - 1; // net odds (profit on $1 bet)
  const p = winRate;
  const q = 1 - p;

  // Kelly fraction: (b*p - q) / b
  let fraction = (b * p - q) / b;

  // Clamp to [0, 0.25] (quarter-Kelly for safety)
  fraction = Math.max(0, Math.min(fraction, 0.25));

  const recommendedStake = Math.round(fraction * bankroll * 100) / 100;
  const expectedValue = Math.round((b * p - q) * recommendedStake * 100) / 100;

  return { fraction, recommendedStake, expectedValue };
}

/**
 * Get win rate for a specific sport from completed bets.
 * Falls back to overall win rate if fewer than 10 bets in that sport.
 * @param {Array} completedBets - Array of completed bet objects
 * @param {string} sport - Sport name
 * @returns {number} Win rate as decimal (0-1)
 */
export function getSportWinRate(completedBets, sport) {
  const sportBets = completedBets.filter(b => b.sport === sport);
  if (sportBets.length >= 10) {
    const wins = sportBets.filter(b => b.result === 'win').length;
    return wins / sportBets.length;
  }
  // Fallback to overall
  if (completedBets.length === 0) return 0.5;
  const wins = completedBets.filter(b => b.result === 'win').length;
  return wins / completedBets.length;
}

/**
 * Compute sport-specific win rates for all sports in the bet history.
 * @param {Array} completedBets - Array of completed bet objects
 * @returns {Object} Map of sport -> win rate (decimal)
 */
export function computeSportWinRates(completedBets) {
  const rates = {};
  const sports = [...new Set(completedBets.map(b => b.sport))];
  for (const sport of sports) {
    rates[sport] = getSportWinRate(completedBets, sport);
  }
  return rates;
}
