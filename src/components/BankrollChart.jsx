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
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
      <div className="px-5 pt-5 pb-2">
        <h3 className="text-sm font-bold text-white">Bankroll Over Time</h3>
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
              itemStyle={{ color: COLORS.gold }}
              formatter={(value) => [`$${value.toFixed(2)}`, 'Balance']}
            />
            <ReferenceLine
              y={startingBankroll}
              stroke="#334155"
              strokeDasharray="5 5"
              label={{ value: 'Start', fill: '#64748b', fontSize: 10, position: 'left' }}
            />
            <Line
              type="monotone"
              dataKey="balance"
              stroke={COLORS.gold}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: COLORS.gold, stroke: '#fff', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
