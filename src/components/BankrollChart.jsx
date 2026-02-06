import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts';
import { COLORS } from '../lib/styles';

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
      background: COLORS.bgCard,
      border: `1px solid ${COLORS.borderLight}`,
      borderRadius: '8px',
      padding: '20px',
    }}>
      <h3 style={{ color: COLORS.gold, margin: '0 0 15px 0', fontSize: '0.85rem', letterSpacing: '1px' }}>
        💰 BANKROLL OVER TIME
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <XAxis
            dataKey="date"
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
            itemStyle={{ color: COLORS.gold }}
            formatter={(value) => [`$${value.toFixed(2)}`, 'Balance']}
          />
          <ReferenceLine
            y={startingBankroll}
            stroke="#555"
            strokeDasharray="5 5"
            label={{ value: 'Start', fill: '#555', fontSize: 10, position: 'left' }}
          />
          <Line
            type="monotone"
            dataKey="balance"
            stroke={COLORS.gold}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: COLORS.gold }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
