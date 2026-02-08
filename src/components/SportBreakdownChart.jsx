import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { COLORS } from '../lib/styles';

export default function SportBreakdownChart({ completedBets }) {
  const data = useMemo(() => {
    const sportMap = {};
    completedBets.forEach(bet => {
      if (!sportMap[bet.sport]) sportMap[bet.sport] = 0;
      sportMap[bet.sport] += Number(bet.payout) - Number(bet.stake);
    });
    return Object.entries(sportMap)
      .map(([sport, profit]) => ({
        sport,
        profit: parseFloat(profit.toFixed(2)),
      }))
      .sort((a, b) => b.profit - a.profit);
  }, [completedBets]);

  if (data.length === 0) return null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden mb-5">
      <div className="px-5 pt-5 pb-2">
        <h3 className="text-sm font-bold text-white">P/L by Sport</h3>
      </div>
      <div className="px-4 pb-4">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data}>
            <XAxis
              dataKey="sport"
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
              formatter={(value) => [`$${value.toFixed(2)}`, 'Profit']}
            />
            <Bar dataKey="profit" radius={[6, 6, 0, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={index}
                  fill={entry.profit >= 0 ? COLORS.green : COLORS.red}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
