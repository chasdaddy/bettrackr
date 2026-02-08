import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { COLORS } from '../lib/styles';

export default function PLChart({ bets }) {
  const data = useMemo(() => {
    const sorted = [...bets]
      .filter(b => b.result !== 'pending')
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    let cumulative = 0;
    return sorted.map(bet => {
      const pl = Number(bet.payout) - Number(bet.stake);
      cumulative += pl;
      return {
        date: bet.date,
        pl: parseFloat(cumulative.toFixed(2)),
      };
    });
  }, [bets]);

  if (data.length < 2) return null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
      <div className="px-5 pt-5 pb-2">
        <h3 className="text-sm font-bold text-white">Cumulative P/L</h3>
      </div>
      <div className="px-4 pb-4">
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data}>
            <XAxis
              dataKey="date"
              stroke="#334155"
              tick={{ fill: '#64748b', fontSize: 11 }}
              tickLine={false}
            />
            <YAxis
              stroke="#334155"
              tick={{ fill: '#64748b', fontSize: 11 }}
              tickLine={false}
              tickFormatter={v => `$${v}`}
            />
            <Tooltip
              contentStyle={{
                background: '#0f172a',
                border: '1px solid #1e293b',
                borderRadius: '12px',
                fontSize: '0.8rem',
              }}
              labelStyle={{ color: '#64748b' }}
              itemStyle={{ color: '#6366f1' }}
              formatter={(value) => [`$${value.toFixed(2)}`, 'P/L']}
            />
            <Line
              type="monotone"
              dataKey="pl"
              stroke={COLORS.primary}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: COLORS.primary, stroke: '#fff', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
