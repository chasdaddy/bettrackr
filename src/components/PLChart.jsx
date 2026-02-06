import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { COLORS, glassCardStyle } from '../lib/styles';

export default function PLChart({ bets }) {
  const data = useMemo(() => {
    // Sort by date ascending for cumulative calc
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
    <div style={{
      ...glassCardStyle,
      padding: '20px',
    }} className="animate-fadeIn">
      <h3 style={{
        color: COLORS.green,
        margin: '0 0 15px 0',
        fontSize: '0.85rem',
        letterSpacing: '1px',
        textShadow: '0 0 10px rgba(0, 255, 136, 0.3)',
      }}>
        📈 CUMULATIVE P/L
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <XAxis
            dataKey="date"
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
            itemStyle={{ color: COLORS.green }}
            formatter={(value) => [`$${value.toFixed(2)}`, 'P/L']}
          />
          <Line
            type="monotone"
            dataKey="pl"
            stroke={COLORS.green}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: COLORS.green, stroke: COLORS.green, strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
