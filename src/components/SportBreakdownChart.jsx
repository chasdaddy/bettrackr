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
    <div style={{
      background: COLORS.bgCard,
      border: `1px solid ${COLORS.borderLight}`,
      borderRadius: '8px',
      padding: '20px',
      marginBottom: '20px',
    }}>
      <h3 style={{ color: COLORS.teal, margin: '0 0 15px 0', fontSize: '0.85rem', letterSpacing: '1px' }}>
        📊 P/L BY SPORT
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data}>
          <XAxis
            dataKey="sport"
            stroke="#333"
            tick={{ fill: '#666', fontSize: 11 }}
            tickLine={false}
          />
          <YAxis
            stroke="#333"
            tick={{ fill: '#666', fontSize: 11 }}
            tickLine={false}
            tickFormatter={v => `$${v}`}
          />
          <Tooltip
            contentStyle={{
              background: '#1a1a2e',
              border: `1px solid ${COLORS.border}`,
              borderRadius: '6px',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.8rem',
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
