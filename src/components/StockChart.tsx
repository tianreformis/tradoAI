'use client';

import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ScadcnButton } from '@/ui/scadcn';

interface DataPoint {
  date: string;
  close: number;
  open?: number;
  high?: number;
  low?: number;
  volume?: number;
}

const periods = [
  { label: '1W', days: 7 },
  { label: '1M', days: 30 },
  { label: '3M', days: 90 },
  { label: '6M', days: 180 },
  { label: '1Y', days: 365 },
  { label: 'ALL', days: 0 },
];

export function StockChart({ data }: { data: DataPoint[] }) {
  const [period, setPeriod] = useState('1M');

  const filtered = (() => {
    const selected = periods.find(p => p.label === period);
    if (!selected || !selected.days) return data;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - selected.days);
    return data.filter(d => new Date(d.date) >= cutoff);
  })();

  return (
    <div>
      <div className="flex gap-2 mb-4">
        {periods.map(p => (
          <ScadcnButton key={p.label} variant={period === p.label ? 'default' : 'outline'} size="sm" onClick={() => setPeriod(p.label)}>
            {p.label}
          </ScadcnButton>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={filtered}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tickFormatter={v => new Date(v).toLocaleDateString()} />
          <YAxis domain={['dataMin', 'dataMax']} />
          <Tooltip labelFormatter={v => new Date(v).toLocaleDateString()} />
          <Line type="monotone" dataKey="close" stroke="#2563eb" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
