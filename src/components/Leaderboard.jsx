import { useState, useEffect, useCallback } from 'react';
import { Trophy, Eye, EyeOff, Save, Medal } from 'lucide-react';
import { fetchLeaderboard, updateDisplayName, togglePublic, fetchOwnProfile } from '../lib/leaderboard';

const SORT_TABS = [
  { key: 'roi', label: 'By ROI' },
  { key: 'profit', label: 'By Profit' },
  { key: 'win_rate', label: 'By Win Rate' },
  { key: 'best_streak', label: 'By Streak' },
];

const MEDAL_COLORS = ['text-amber-400', 'text-slate-300', 'text-amber-700'];

const RANK_ICONS = {
  rookie: '🌱',
  starter: '⚡',
  contender: '🔥',
  sharp: '🎯',
  pro: '💎',
  legend: '👑',
};

export default function Leaderboard({ user, stats, profile, onProfileUpdate }) {
  const [board, setBoard] = useState([]);
  const [sortBy, setSortBy] = useState('roi');
  const [loading, setLoading] = useState(true);
  const [nameInput, setNameInput] = useState('');
  const [saving, setSaving] = useState(false);

  const loadBoard = useCallback(async () => {
    setLoading(true);
    const { data } = await fetchLeaderboard(sortBy);
    setBoard(data);
    setLoading(false);
  }, [sortBy]);

  useEffect(() => {
    loadBoard();
  }, [loadBoard]);

  useEffect(() => {
    if (profile) setNameInput(profile.display_name || '');
  }, [profile]);

  const handleSaveName = async () => {
    if (!nameInput.trim() || !user) return;
    setSaving(true);
    const { error } = await updateDisplayName(user.id, nameInput.trim());
    if (!error && onProfileUpdate) onProfileUpdate();
    setSaving(false);
  };

  const handleTogglePublic = async () => {
    if (!user || !profile) return;
    const { error } = await togglePublic(user.id, !profile.is_public);
    if (!error && onProfileUpdate) onProfileUpdate();
  };

  const formatValue = (entry, key) => {
    switch (key) {
      case 'roi': return `${Number(entry.roi).toFixed(1)}%`;
      case 'profit': return `${Number(entry.profit) >= 0 ? '+' : ''}$${Number(entry.profit).toFixed(0)}`;
      case 'win_rate': return `${Number(entry.win_rate).toFixed(1)}%`;
      case 'best_streak': return `${entry.best_streak}W`;
      default: return '—';
    }
  };

  return (
    <div>
      {/* Profile Setup Banner */}
      {profile && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-5 animate-slideUp">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">Your Profile</h3>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Display Name</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  placeholder="Anonymous"
                  maxLength={30}
                  className="flex-1 bg-slate-950/60 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-600"
                />
                <button
                  onClick={handleSaveName}
                  disabled={saving}
                  className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                >
                  <Save className="w-3 h-3" />
                  Save
                </button>
              </div>
            </div>
            <div className="flex items-end">
              <button
                onClick={handleTogglePublic}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold border transition-all ${
                  profile.is_public
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                {profile.is_public ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                {profile.is_public ? 'Public' : 'Private'}
              </button>
            </div>
          </div>
          {!profile.is_public && (
            <p className="text-[10px] text-slate-500 mt-2">Go public to appear on the leaderboard</p>
          )}
        </div>
      )}

      {/* Sort Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
        {SORT_TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setSortBy(tab.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
              sortBy === tab.key
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-900 border border-slate-800 text-slate-500 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Leaderboard Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden animate-slideUp">
        {/* Header */}
        <div className="grid grid-cols-[3rem_1fr_4.5rem_4.5rem_5rem_3rem_3rem] gap-2 px-4 py-3 border-b border-slate-800 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          <span>#</span>
          <span>Name</span>
          <span className="text-right">Win %</span>
          <span className="text-right">ROI</span>
          <span className="text-right">Profit</span>
          <span className="text-center">Tier</span>
          <span className="text-center">Str</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm text-slate-500">Loading...</div>
        ) : board.length === 0 ? (
          <div className="p-8 text-center">
            <Trophy className="w-6 h-6 text-slate-700 mx-auto mb-2" />
            <span className="text-sm text-slate-500">No public profiles yet. Be the first!</span>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/50">
            {board.map((entry, i) => {
              const isMe = user && entry.user_id === user.id;
              return (
                <div
                  key={entry.id}
                  className={`grid grid-cols-[3rem_1fr_4.5rem_4.5rem_5rem_3rem_3rem] gap-2 px-4 py-3 items-center hover:bg-slate-800/30 transition-colors ${
                    isMe ? 'border-l-2 border-indigo-500 bg-indigo-500/5' : ''
                  }`}
                >
                  <span className="text-sm font-bold text-slate-400 flex items-center">
                    {i < 3 ? (
                      <Medal className={`w-4 h-4 ${MEDAL_COLORS[i]}`} />
                    ) : (
                      <span>{i + 1}</span>
                    )}
                  </span>
                  <span className="text-sm font-bold text-white truncate">
                    {entry.display_name || 'Anonymous'}
                    {isMe && <span className="text-[10px] text-indigo-400 ml-1">(you)</span>}
                  </span>
                  <span className="text-sm font-mono text-right text-slate-300">{Number(entry.win_rate).toFixed(1)}%</span>
                  <span className={`text-sm font-mono font-bold text-right ${Number(entry.roi) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {Number(entry.roi).toFixed(1)}%
                  </span>
                  <span className={`text-sm font-mono font-bold text-right ${Number(entry.profit) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {Number(entry.profit) >= 0 ? '+' : ''}${Number(entry.profit).toFixed(0)}
                  </span>
                  <span className="text-center text-sm" title={entry.rank_tier}>
                    {RANK_ICONS[entry.rank_tier] || '🌱'}
                  </span>
                  <span className="text-center text-sm font-bold text-slate-400">{entry.best_streak}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
