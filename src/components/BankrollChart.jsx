import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts';
import { COLORS, glassCardStyle } from '../lib/styles';

export default function BankrollChart({ bets, startingBankroll }) {
  const data = useMemo(() => {
    const sorted = [...bets]
      .filter(b => b.result !== 'pending')
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    let balance = startingBankroll;
    return sorted.map(bet => {
      const pl = Number(bet.payout) - Number(bet.stake);
      balance += pl;
      return {
        date: bet.date,
        balance: parseFloat(balance.toFixed(2)),
      };
    });
  }, [bets, startingBankroll]);

  if (data.length < 2) return null;

  return (
    <div style={{
      ...glassCardStyle,
      padding: '20px',
    }} className="animate-fadeIn">
      <h3 style={{
        color: COLORS.gold,
        margin: '0 0 15px 0',
        fontSize: '0.85rem',
        letterSpacing: '1px',
        textShadow: '0 0 10px rgba(255, 215, 0, 0.3)',
      }}>
        💰 BANKROLL OVER TIME
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
            itemStyle={{ color: COLORS.gold }}
            formatter={(value) => [`$${value.toFixed(2)}`, 'Balance']}
          />
          <ReferenceLine
            y={startingBankroll}
            stroke="rgba(255,255,255,0.15)"
            strokeDasharray="5 5"
            label={{ value: 'Start', fill: '#555', fontSize: 10, position: 'left' }}
          />
          <Line
            type="monotone"
            dataKey="balance"
            stroke={COLORS.gold}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: COLORS.gold, stroke: COLORS.gold, strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
