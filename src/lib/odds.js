/**
 * Calculate payout for American odds.
 * @param {number} odds - American odds (e.g. -110, +150)
 * @param {number} stake - Amount wagered
 * @param {string} result - 'win', 'loss', 'push', or 'pending'
 * @returns {number} Total payout (stake + profit) for wins, 0 otherwise
 */
export function calculatePayout(odds, stake, result) {
  if (result !== 'win') return 0;
  if (odds > 0) {
    return stake + (stake * odds / 100);
  }
  return stake + (stake * 100 / Math.abs(odds));
}
