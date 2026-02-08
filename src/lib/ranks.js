// Rank tiers — ordered lowest to highest
export const RANK_TIERS = [
  {
    id: 'rookie',
    name: 'Rookie',
    minBets: 0,
    minWinRate: 0,
    requiresProfit: false,
    color: '#aa88ff',
    glowColor: 'rgba(170, 136, 255, 0.3)',
    icon: '\u{1F3B2}',
    features: ['Basic stats', 'P/L tracking'],
  },
  {
    id: 'sharp',
    name: 'Sharp',
    minBets: 50,
    minWinRate: 52,
    requiresProfit: false,
    color: '#00d4ff',
    glowColor: 'rgba(0, 212, 255, 0.3)',
    icon: '\u{1F3AF}',
    features: ['Archetype unlocked', 'Sport breakdown'],
  },
  {
    id: 'pro',
    name: 'Pro',
    minBets: 150,
    minWinRate: 54,
    requiresProfit: false,
    color: '#00ff88',
    glowColor: 'rgba(0, 255, 136, 0.3)',
    icon: '\u26A1',
    features: ['Advanced insights', 'Day-of-week analysis'],
  },
  {
    id: 'elite',
    name: 'Elite',
    minBets: 300,
    minWinRate: 55,
    requiresProfit: true,
    color: '#ffd700',
    glowColor: 'rgba(255, 215, 0, 0.3)',
    icon: '\u{1F451}',
    features: ['Elite badge', 'Premium share card'],
  },
  {
    id: 'legend',
    name: 'Legend',
    minBets: 500,
    minWinRate: 56,
    requiresProfit: true,
    color: '#ff88ff',
    glowColor: 'rgba(255, 136, 255, 0.3)',
    icon: '\u{1F3C6}',
    features: ['Legend status', 'Full analytics'],
  },
];

export function calculateRank(totalBets, winRate, profit) {
  let currentRank = RANK_TIERS[0];

  for (let i = RANK_TIERS.length - 1; i >= 0; i--) {
    const tier = RANK_TIERS[i];
    if (
      totalBets >= tier.minBets &&
      winRate >= tier.minWinRate &&
      (!tier.requiresProfit || profit > 0)
    ) {
      currentRank = tier;
      break;
    }
  }

  const currentIndex = RANK_TIERS.indexOf(currentRank);
  const nextRank = currentIndex < RANK_TIERS.length - 1 ? RANK_TIERS[currentIndex + 1] : null;

  let progress = { percentage: 100, betsNeeded: 0, winRateNeeded: 0 };

  if (nextRank) {
    const betsProgress = Math.min(totalBets / nextRank.minBets, 1);
    const winRateProgress = nextRank.minWinRate > 0
      ? Math.min(winRate / nextRank.minWinRate, 1)
      : 1;
    const percentage = Math.round(((betsProgress + winRateProgress) / 2) * 100);
    const betsNeeded = Math.max(nextRank.minBets - totalBets, 0);
    const winRateNeeded = Math.max(nextRank.minWinRate - winRate, 0);

    progress = { percentage: Math.min(percentage, 99), betsNeeded, winRateNeeded };
  }

  return { ...currentRank, nextRank, progress };
}

const ARCHETYPES = [
  {
    id: 'sniper',
    name: 'The Sniper',
    description: 'Few bets, deadly accuracy',
    color: '#ff88ff',
    icon: '\u{1F3AF}',
    badge: 'SNIPER',
    check: (betsPerWeek, winRate) => betsPerWeek < 5 && winRate > 58,
  },
  {
    id: 'sharp',
    name: 'The Sharp',
    description: 'Profitable on underdogs',
    color: '#00ff88',
    icon: '\u{1F9E0}',
    badge: 'SHARP',
    check: (_bpw, _wr, _p, underdogProfit) => underdogProfit > 0,
  },
  {
    id: 'grinder',
    name: 'The Grinder',
    description: 'High volume, consistent profit',
    color: '#00d4ff',
    icon: '\u{1F4AA}',
    badge: 'GRINDER',
    check: (betsPerWeek, _wr, profit) => betsPerWeek > 8 && profit > 0,
  },
  {
    id: 'degen',
    name: 'The Degen',
    description: 'High volume, chasing losses',
    color: '#ff4444',
    icon: '\u{1F525}',
    badge: 'DEGEN',
    check: (betsPerWeek, _wr, profit) => betsPerWeek > 8 && profit <= 0,
  },
  {
    id: 'rookie',
    name: 'The Rookie',
    description: 'Just getting started',
    color: '#aa88ff',
    icon: '\u{1F331}',
    badge: 'ROOKIE',
    check: (_bpw, _wr, _p, _up, totalBets) => totalBets < 20,
  },
  {
    id: 'player',
    name: 'The Player',
    description: 'Balanced bettor',
    color: '#00c896',
    icon: '\u{1F0CF}',
    badge: 'PLAYER',
    check: () => true,
  },
];

export function detectArchetype(completedBets, winRate, profit) {
  const totalBets = completedBets.length;
  if (totalBets === 0) return ARCHETYPES.find(a => a.id === 'rookie');

  const dates = completedBets.map(b => new Date(b.date)).sort((a, b) => a - b);
  const dayRange = Math.max((dates[dates.length - 1] - dates[0]) / (1000 * 60 * 60 * 24), 7);
  const weeks = dayRange / 7;
  const betsPerWeek = totalBets / weeks;

  const underdogs = completedBets.filter(b => Number(b.odds) > 0);
  const underdogProfit = underdogs.reduce(
    (s, b) => s + Number(b.payout) - Number(b.stake),
    0
  );

  for (const archetype of ARCHETYPES) {
    if (archetype.check(betsPerWeek, winRate, profit, underdogProfit, totalBets)) {
      const { check, ...rest } = archetype;
      return rest;
    }
  }

  return ARCHETYPES[ARCHETYPES.length - 1];
}

export function generatePsychHooks(completedBets, stats, rankInfo) {
  const hooks = [];
  const { detailedStreaks } = stats;

  // Regret hook — what if you doubled stake during best win streak
  if (detailedStreaks && detailedStreaks.longestWin >= 3) {
    const sorted = [...completedBets].sort((a, b) => new Date(a.date) - new Date(b.date));
    let bestStreakProfit = 0;
    let tempProfit = 0;
    let streakLen = 0;
    for (const bet of sorted) {
      if (bet.result === 'win') {
        tempProfit += Number(bet.payout) - Number(bet.stake);
        streakLen++;
      } else {
        if (streakLen >= 3) bestStreakProfit = Math.max(bestStreakProfit, tempProfit);
        tempProfit = 0;
        streakLen = 0;
      }
    }
    if (streakLen >= 3) bestStreakProfit = Math.max(bestStreakProfit, tempProfit);

    if (bestStreakProfit > 0) {
      hooks.push({
        type: 'regret',
        title: 'WHAT IF YOU DOUBLED DOWN?',
        value: `+$${(bestStreakProfit * 2).toFixed(0)}`,
        message: `If you doubled your stake during your ${detailedStreaks.longestWin}-bet win streak`,
        color: '#ffd700',
        icon: '\u{1F4B0}',
        show: true,
      });
    }
  }

  // Near rank hook
  if (rankInfo.nextRank) {
    const parts = [];
    if (rankInfo.progress.betsNeeded > 0) parts.push(`${rankInfo.progress.betsNeeded} more bets`);
    if (rankInfo.progress.winRateNeeded > 0) parts.push(`+${rankInfo.progress.winRateNeeded.toFixed(1)}% win rate`);

    hooks.push({
      type: 'nearRank',
      title: `RANK UP: ${rankInfo.nextRank.name.toUpperCase()}`,
      value: `${rankInfo.nextRank.icon} ${rankInfo.progress.percentage}%`,
      message: parts.join(' & ') + ' needed',
      color: rankInfo.nextRank.color,
      icon: '\u{1F4C8}',
      show: true,
    });
  }

  // Validation — underdog win rate
  const underdogs = completedBets.filter(b => Number(b.odds) > 0);
  const underdogWins = underdogs.filter(b => b.result === 'win').length;
  const underdogWinRate = underdogs.length > 0 ? (underdogWins / underdogs.length) * 100 : 0;
  if (underdogWinRate > 55 && underdogs.length >= 5) {
    hooks.push({
      type: 'validation',
      title: 'BOOKS WOULD LIMIT YOU',
      value: `${underdogWinRate.toFixed(0)}%`,
      message: `Your underdog picks hit at ${underdogWinRate.toFixed(0)}% — that's elite`,
      color: '#00ff88',
      icon: '\u{1F6A8}',
      show: true,
    });
  }

  // Loss sport vs best sport gap
  const sportPL = {};
  completedBets.forEach(b => {
    if (!sportPL[b.sport]) sportPL[b.sport] = 0;
    sportPL[b.sport] += Number(b.payout) - Number(b.stake);
  });
  const sportEntries = Object.entries(sportPL);
  if (sportEntries.length >= 2) {
    sportEntries.sort((a, b) => a[1] - b[1]);
    const worst = sportEntries[0];
    const best = sportEntries[sportEntries.length - 1];
    if (worst[1] < 0) {
      hooks.push({
        type: 'lossSport',
        title: 'YOUR LEAK',
        value: `$${Math.abs(worst[1]).toFixed(0)}`,
        message: `${worst[0]} is costing you — ${best[0]} carries the profit`,
        color: '#ff4444',
        icon: '\u{1F6B0}',
        show: true,
      });
    }
  }

  // Streak pride
  if (detailedStreaks && detailedStreaks.longestWin >= 2) {
    const currentMsg = detailedStreaks.currentStreak > 1
      ? `Currently on a ${detailedStreaks.currentStreak} ${detailedStreaks.currentType} streak`
      : '';
    hooks.push({
      type: 'streakPride',
      title: 'LONGEST WIN STREAK',
      value: `${detailedStreaks.longestWin} \u{1F525}`,
      message: currentMsg || 'Keep the momentum going',
      color: '#ff8800',
      icon: '\u26A1',
      show: true,
    });
  }

  // Sunk cost
  if (completedBets.length >= 5) {
    hooks.push({
      type: 'sunkCost',
      title: 'YOUR BETTING DATABASE',
      value: `${completedBets.length} bets`,
      message: "You've logged more data than any sportsbook has on you",
      color: '#00d4ff',
      icon: '\u{1F4CA}',
      show: true,
    });
  }

  // Profile optimization
  const bankrollSet = !!localStorage.getItem('bettrackr_bankroll');
  const hasGutCalls = (stats.totalMissedMoney || 0) > 0;
  const has50Bets = completedBets.length >= 50;
  const checks = [bankrollSet, hasGutCalls, has50Bets, completedBets.length > 0];
  const optimized = Math.round((checks.filter(Boolean).length / checks.length) * 100);
  if (optimized < 100) {
    hooks.push({
      type: 'profileOptimized',
      title: 'PROFILE OPTIMIZATION',
      value: `${optimized}%`,
      message: optimized < 50 ? 'Set bankroll & log gut calls to unlock full power' : 'Almost there — keep logging',
      color: '#aa88ff',
      icon: '\u{2699}\u{FE0F}',
      show: true,
    });
  }

  return hooks;
}

export function getDetailedStreaks(completedBets) {
  if (completedBets.length === 0) {
    return { longestWin: 0, longestLoss: 0, currentStreak: 0, currentType: null };
  }

  const sorted = [...completedBets].sort((a, b) => new Date(b.date) - new Date(a.date));
  let longestWin = 0;
  let longestLoss = 0;
  let currentStreak = 0;
  let currentType = null;
  let tempStreak = 0;
  let tempType = null;

  // Walk chronologically for longest streaks
  const chrono = [...sorted].reverse();
  for (const bet of chrono) {
    if (bet.result === tempType) {
      tempStreak++;
    } else {
      if (tempType === 'win') longestWin = Math.max(longestWin, tempStreak);
      if (tempType === 'loss') longestLoss = Math.max(longestLoss, tempStreak);
      tempType = bet.result;
      tempStreak = 1;
    }
  }
  if (tempType === 'win') longestWin = Math.max(longestWin, tempStreak);
  if (tempType === 'loss') longestLoss = Math.max(longestLoss, tempStreak);

  // Current streak — most recent first
  for (const bet of sorted) {
    if (currentType === null) {
      currentType = bet.result;
      currentStreak = 1;
    } else if (bet.result === currentType) {
      currentStreak++;
    } else {
      break;
    }
  }

  return { longestWin, longestLoss, currentStreak, currentType };
}

export function getDayOfWeekStats(completedBets) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const stats = {};
  days.forEach(d => {
    stats[d] = { wins: 0, losses: 0, total: 0, profit: 0, winRate: 0 };
  });

  completedBets.forEach(bet => {
    const day = days[new Date(bet.date).getDay()];
    stats[day].total++;
    if (bet.result === 'win') stats[day].wins++;
    if (bet.result === 'loss') stats[day].losses++;
    stats[day].profit += Number(bet.payout) - Number(bet.stake);
  });

  days.forEach(d => {
    if (stats[d].total > 0) {
      stats[d].winRate = ((stats[d].wins / stats[d].total) * 100).toFixed(1);
    }
  });

  return stats;
}
