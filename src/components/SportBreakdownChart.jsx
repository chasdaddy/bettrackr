import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { COLORS, glassCardStyle } from '../lib/styles';

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
    <div style={{
      ...glassCardStyle,
      padding: '20px',
      marginBottom: '20px',
    }} className="animate-fadeIn">
      <h3 style={{
        color: COLORS.teal,
        margin: '0 0 15px 0',
        fontSize: '0.85rem',
        letterSpacing: '1px',
        textShadow: '0 0 10px rgba(0, 200, 150, 0.3)',
      }}>
        📊 P/L BY SPORT
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data}>
          <XAxis
            dataKey="sport"
            stroke="rgba(255,255,255,0.08)"
            tick={{ fill: '#666', fontSize: 11 }}
            tickLine={false}
          />
          <YAxis
            stroke="rgba(255,255,255,0.08)"
            tick={{ fill: '#666', fontSize: 11 }}
            tickLine={false}
            tickFormatter={v => `$${v}`}
          />
          <Tooltip
            contentStyle={{
              background: 'rgba(26, 26, 46, 0.95)',
              border: `1px solid ${COLORS.glassBorder}`,
              borderRadius: '8px',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.8rem',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
            }}
            labelStyle={{ color: COLORS.textDim }}
            formatter={(value) => [`$${value.toFixed(2)}`, 'Profit']}
          />
          <Bar dataKey="profit" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.profit >= 0 ? COLORS.green : COLORS.red} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
