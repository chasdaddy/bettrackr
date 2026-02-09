/**
 * The Odds API integration for live odds data.
 * Free tier: 500 requests/month.
 * Docs: https://the-odds-api.com/liveapi/guides/v4/
 */

const API_BASE = 'https://api.the-odds-api.com/v4';
const CACHE_KEY = 'bettrackr_odds_cache';
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

// In-season sports to query (covers major US sports year-round)
const SPORT_KEYS = [
  'americanfootball_nfl',
  'basketball_nba',
  'baseball_mlb',
  'icehockey_nhl',
  'mma_mixed_martial_arts',
  'soccer_epl',
];

function getCached() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cached = JSON.parse(raw);
    if (Date.now() - cached.timestamp > CACHE_TTL) {
      sessionStorage.removeItem(CACHE_KEY);
      return null;
    }
    return cached.data;
  } catch {
    return null;
  }
}

function setCache(data) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
  } catch {
    // sessionStorage full or unavailable
  }
}

/**
 * Fetch odds from The Odds API for in-season sports.
 * @param {string} apiKey
 * @returns {Promise<Array>} Array of event objects with bookmaker odds
 */
export async function fetchOdds(apiKey) {
  const cached = getCached();
  if (cached) return cached;

  const allEvents = [];

  for (const sport of SPORT_KEYS) {
    try {
      const url = new URL(`${API_BASE}/sports/${sport}/odds`);
      url.searchParams.set('apiKey', apiKey);
      url.searchParams.set('regions', 'us');
      url.searchParams.set('markets', 'h2h,spreads');
      url.searchParams.set('oddsFormat', 'american');

      const res = await fetch(url.toString());
      if (!res.ok) continue;
      const data = await res.json();
      if (Array.isArray(data)) {
        allEvents.push(...data.map(e => ({ ...e, sportKey: sport })));
      }
    } catch {
      // Skip failed sports silently
    }
  }

  if (allEvents.length > 0) {
    setCache(allEvents);
  }

  return allEvents;
}

/**
 * Find +EV edges by comparing odds across bookmakers.
 * @param {Array} oddsData - Raw events from fetchOdds
 * @returns {Array} Top opportunities sorted by edge %
 */
export function findEdges(oddsData) {
  const opportunities = [];

  for (const event of oddsData) {
    if (!event.bookmakers || event.bookmakers.length < 2) continue;

    const h2hMarkets = event.bookmakers
      .map(bk => {
        const market = bk.markets?.find(m => m.key === 'h2h');
        return market ? { bookmaker: bk.title, outcomes: market.outcomes } : null;
      })
      .filter(Boolean);

    if (h2hMarkets.length < 2) continue;

    // For each outcome (team), find best line and average
    const outcomeNames = h2hMarkets[0].outcomes.map(o => o.name);

    for (const name of outcomeNames) {
      const lines = h2hMarkets
        .map(bk => {
          const outcome = bk.outcomes.find(o => o.name === name);
          return outcome ? { book: bk.bookmaker, price: outcome.price } : null;
        })
        .filter(Boolean);

      if (lines.length < 2) continue;

      const best = lines.reduce((a, b) => a.price > b.price ? a : b);
      const avgPrice = lines.reduce((s, l) => s + l.price, 0) / lines.length;

      // Convert to implied probabilities for edge calculation
      const bestImplied = americanToImplied(best.price);
      const avgImplied = americanToImplied(avgPrice);
      const edge = avgImplied - bestImplied;

      if (edge > 0.01) { // At least 1% edge
        const eventName = `${event.home_team} vs ${event.away_team}`;
        const oddsStr = best.price > 0 ? `+${best.price}` : `${best.price}`;
        opportunities.push({
          event: eventName,
          pick: `${name} ML`,
          edge: `+${(edge * 100).toFixed(1)}%`,
          edgeNum: edge,
          book: best.book,
          odds: oddsStr,
          visible: true,
        });
      }
    }
  }

  // Sort by edge descending, take top results
  opportunities.sort((a, b) => b.edgeNum - a.edgeNum);

  // First 2 visible, rest locked
  return opportunities.slice(0, 8).map((opp, i) => ({
    ...opp,
    visible: i < 2,
  }));
}

function americanToImplied(odds) {
  if (odds > 0) return 100 / (odds + 100);
  return Math.abs(odds) / (Math.abs(odds) + 100);
}

/**
 * Format odds data into LiveWire-style rotating messages.
 * @param {Array} oddsData - Raw events from fetchOdds
 * @returns {Array<{ text: string, tag: string }>}
 */
export function formatMovements(oddsData) {
  const messages = [];

  const sportLabels = {
    americanfootball_nfl: 'NFL',
    basketball_nba: 'NBA',
    baseball_mlb: 'MLB',
    icehockey_nhl: 'NHL',
    mma_mixed_martial_arts: 'UFC',
    soccer_epl: 'EPL',
  };

  for (const event of oddsData.slice(0, 20)) {
    if (!event.bookmakers || event.bookmakers.length === 0) continue;

    const tag = sportLabels[event.sportKey] || event.sport_title || 'Sports';

    // Find best ML line across books
    for (const bk of event.bookmakers) {
      const h2h = bk.markets?.find(m => m.key === 'h2h');
      if (!h2h) continue;

      for (const outcome of h2h.outcomes) {
        const oddsStr = outcome.price > 0 ? `+${outcome.price}` : `${outcome.price}`;
        messages.push({
          text: `${outcome.name} ML at ${oddsStr} on ${bk.title} (${event.home_team} vs ${event.away_team})`,
          tag,
        });
      }
    }
  }

  // Shuffle and limit to avoid predictability
  return shuffleArray(messages).slice(0, 15);
}

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
