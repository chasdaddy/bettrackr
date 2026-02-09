import { supabase } from './supabase';

/**
 * Upsert user profile with computed stats.
 */
export async function upsertProfile(userId, stats) {
  try {
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
  } catch {
    return { error: { message: 'user_profiles table not available' } };
  }
}

/**
 * Fetch public leaderboard sorted by a metric.
 */
export async function fetchLeaderboard(sortBy = 'roi', limit = 50) {
  try {
    const validSorts = ['roi', 'profit', 'win_rate', 'best_streak'];
    const column = validSorts.includes(sortBy) ? sortBy : 'roi';

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('is_public', true)
      .order(column, { ascending: false })
      .limit(limit);

    return { data: data || [], error };
  } catch {
    return { data: [], error: null };
  }
}

/**
 * Update display name.
 */
export async function updateDisplayName(userId, name) {
  try {
    const { error } = await supabase
      .from('user_profiles')
      .update({ display_name: name })
      .eq('user_id', userId);
    return { error };
  } catch {
    return { error: { message: 'user_profiles table not available' } };
  }
}

/**
 * Toggle public visibility.
 */
export async function togglePublic(userId, isPublic) {
  try {
    const { error } = await supabase
      .from('user_profiles')
      .update({ is_public: isPublic })
      .eq('user_id', userId);
    return { error };
  } catch {
    return { error: { message: 'user_profiles table not available' } };
  }
}

/**
 * Fetch own profile (even if not public).
 */
export async function fetchOwnProfile(userId) {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    return { data: data || null, error };
  } catch {
    return { data: null, error: null };
  }
}
