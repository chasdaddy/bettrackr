import { supabase } from './supabase';

/**
 * Upsert user profile with computed stats.
 */
export async function upsertProfile(userId, stats) {
  const { error } = await supabase
    .from('user_profiles')
    .upsert({
      user_id: userId,
      total_bets: stats.totalBets || 0,
      win_rate: stats.winRate || 0,
      roi: stats.roi || 0,
      profit: stats.profit || 0,
      rank_tier: stats.rankTier || 'rookie',
      archetype: stats.archetype || 'rookie',
      best_streak: stats.bestStreak || 0,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

  return { error };
}

/**
 * Fetch public leaderboard sorted by a metric.
 */
export async function fetchLeaderboard(sortBy = 'roi', limit = 50) {
  const validSorts = ['roi', 'profit', 'win_rate', 'best_streak'];
  const column = validSorts.includes(sortBy) ? sortBy : 'roi';

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('is_public', true)
    .order(column, { ascending: false })
    .limit(limit);

  return { data: data || [], error };
}

/**
 * Update display name.
 */
export async function updateDisplayName(userId, name) {
  const { error } = await supabase
    .from('user_profiles')
    .update({ display_name: name })
    .eq('user_id', userId);

  return { error };
}

/**
 * Toggle public visibility.
 */
export async function togglePublic(userId, isPublic) {
  const { error } = await supabase
    .from('user_profiles')
    .update({ is_public: isPublic })
    .eq('user_id', userId);

  return { error };
}

/**
 * Fetch own profile (even if not public).
 */
export async function fetchOwnProfile(userId) {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  return { data, error };
}
