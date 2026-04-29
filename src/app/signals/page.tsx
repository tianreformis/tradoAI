'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

interface Signal {
  id: string;
  ticker: string;
  signal: string;
  entry: number | null;
  take_profit: number | null;
  stop_loss: number | null;
  risk_reward_ratio: number | null;
  confidence: number;
  summary: string;
  score?: number;
  createdAt?: string;
}

export default function TopSignalsPage() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [filteredSignals, setFilteredSignals] = useState<Signal[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  const fetchSignals = async (date?: string) => {
    setLoading(true);
    setError(null);
    try {
      const url = date 
        ? `/api/top-signals?date=${date}`
        : '/api/top-signals';
      
      const res = await fetch(url);
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || 'Failed to fetch signals');
        setSignals([]);
      } else if (Array.isArray(data)) {
        setSignals(data);
      } else {
        setError('Invalid response from server');
        setSignals([]);
      }
    } catch (e: any) {
      console.error(e);
      setError('Network error - please try again');
      setSignals([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSignals();
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setFilteredSignals(signals);
      return;
    }
    const query = search.toLowerCase();
    const filtered = signals.filter(s =>
      s.ticker.toLowerCase().includes(query)
    );
    setFilteredSignals(filtered);
  }, [search, signals]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    fetchSignals(newDate);
  };

  const generateAllSignals = async () => {
    if (!confirm('This will generate signals for all 500 S&P stocks. Continue?')) return;
    
    setError(null);
    try {
      const res = await fetch('/api/cron/generate-signals', {
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET || ''}`,
        },
      });
      const data = await res.json();
      
      if (res.ok) {
        alert(`Generated! Success: ${data.success}, Skipped: ${data.skipped}, Failed: ${data.failed}`);
        fetchSignals();
      } else {
        setError(data.error || 'Failed to generate signals');
      }
    } catch (e: any) {
      setError('Failed to trigger signal generation');
    }
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">🔥 Top Signals</h1>
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Search ticker..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-48"
          />
          <Button onClick={() => fetchSignals()} disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button onClick={generateAllSignals} variant="outline">
            Generate All (500)
          </Button>
        </div>
      </div>

      <div className="mb-6 flex items-center gap-4">
        <label className="text-sm font-medium">Select Date:</label>
        <input
          type="date"
          value={selectedDate}
          onChange={handleDateChange}
          className="p-2 border rounded"
        />
        <span className="text-sm text-muted-foreground">
          View signals from any date
        </span>
      </div>

      <div className="text-sm text-muted-foreground mb-6">
        AI-based analysis, not financial advice. SL is mandatory for risk management.
      </div>

      {error && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <p className="text-red-500">{error}</p>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="text-center py-8">Loading signals...</div>
      ) : signals.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">No signals found for {selectedDate}.</p>
            <p className="text-sm text-muted-foreground">
              Signals are generated daily. Try selecting a different date or click "Generate All" to create today's signals.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="mb-4 text-sm text-muted-foreground">
            Showing {filteredSignals.length} signals for {selectedDate}
          </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredSignals.map((signal) => (
              <Link key={signal.id} href={`/stocks/${signal.ticker}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="font-mono">{signal.ticker}</CardTitle>
                      <Badge variant={
                        signal.signal === 'LONG' ? 'success' :
                        signal.signal === 'SHORT' ? 'destructive' : 'default'
                      }>
                        {signal.signal}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {signal.signal !== 'HOLD' && signal.entry !== null ? (
                      <div className="grid grid-cols-3 gap-2 mb-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">Entry</div>
                          <div className="font-semibold">${signal.entry!.toFixed(2)}</div>
                        </div>
                        <div>
                          <div className="text-green-600">TP</div>
                          <div className="font-semibold text-green-600">${signal.take_profit?.toFixed(2)}</div>
                        </div>
                        <div>
                          <div className="text-red-600">SL</div>
                          <div className="font-semibold text-red-600">${signal.stop_loss?.toFixed(2)}</div>
                        </div>
                      </div>
                    ) : (
                      <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                        HOLD - No entry/exit points
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      {signal.signal !== 'HOLD' && signal.risk_reward_ratio !== null && (
                        <span>R:R 1:{signal.risk_reward_ratio!.toFixed(2)}</span>
                      )}
                      <span>Confidence: {signal.confidence}%</span>
                    </div>
                    {signal.score && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        Score: {signal.score.toFixed(0)}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
