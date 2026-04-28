'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { StockChart } from '@/components/StockChart';
import { SignalCard } from '@/components/SignalCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface StockData {
  ticker: string;
  quote: {
    regularMarketPrice: number;
    regularMarketChange: number;
    regularMarketChangePercent: number;
    shortName?: string;
    marketState?: string;
    preMarketPrice?: number;
    preMarketChange?: number;
    preMarketChangePercent?: number;
    postMarketPrice?: number;
    postMarketChange?: number;
    postMarketChangePercent?: number;
  };
  summary: { price?: { marketCap?: number }; defaultKeyStatistics?: { trailingPE?: number }; financialData?: { epsCurrentYear?: number; revenueGrowth?: number } };
  history: { date: string; close: number; open?: number; high?: number; low?: number; volume?: number }[];
  indicators: { rsi: number | null; ema20: number | null; ema50: number | null; ema200: number | null; macd: { macd: number; signal: number; histogram: number } | null; atr?: number | null };
}

function isMarketOpen(): boolean {
  const now = new Date();
  // Convert to ET (UTC-4 or UTC-5 depending on DST)
  const etTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
  const day = etTime.getDay();
  const hour = etTime.getHours();
  const minute = etTime.getMinutes();
  const time = hour * 100 + minute;

  // Market open: Monday-Friday, 9:30 AM - 4:00 PM ET
  if (day === 0 || day === 6) return false;
  return time >= 930 && time < 1600;
}

function getPreviousCloseChange(history: { close: number }[]): { change: number; changePercent: number } | null {
  if (history.length < 2) return null;
  const current = history[history.length - 1].close;
  const previous = history[history.length - 2].close;
  const change = current - previous;
  const changePercent = (change / previous) * 100;
  return { change, changePercent };
}

interface SignalData {
  ticker: string;
  signal: string;
  entry: number | null;
  take_profit: number | null;
  stop_loss: number | null;
  risk_reward_ratio: number | null;
  confidence: number;
  reasoning?: { technical?: string; momentum?: string; risk_management?: string };
  summary?: string;
  cached: boolean;
  error?: string;
  createdAt?: string;
}

export default function StockDetailPage() {
  const params = useParams();
  const ticker = params.ticker as string;
  const [data, setData] = useState<StockData | null>(null);
  const [signal, setSignal] = useState<SignalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [signalLoading, setSignalLoading] = useState(false);
  const [signalChecked, setSignalChecked] = useState(false);

  useEffect(() => {
    fetchData();
    checkSignal();
  }, [ticker]);

  async function fetchData() {
    setLoading(true);
    try {
      const res = await fetch(`/api/stocks/${ticker}?period1=2024-01-01`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load');
      setData(json);
    } catch (e: any) {
      console.error(e);
    }
    setLoading(false);
  }

  async function checkSignal() {
    setSignalLoading(true);
    setSignalChecked(false);
    try {
      const res = await fetch(`/api/latest-signal?ticker=${ticker}`);
      const json = await res.json();
      if (json.exists) {
        setSignal(json);
      }
    } catch (e: any) {
      console.error('Signal check failed:', e);
    }
    setSignalLoading(false);
    setSignalChecked(true);
  }

  async function getSignal() {
    setSignalLoading(true);
    setSignal(null);
    try {
      const res = await fetch('/api/daily-signal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker }),
      });
      const json = await res.json();
      if (!res.ok) {
        setSignal({ ticker, signal: 'ERROR', entry: 0, take_profit: 0, stop_loss: 0, risk_reward_ratio: 0, confidence: 0, cached: false, error: json.error || 'Failed to generate signal' });
      } else {
        setSignal(json);
      }
    } catch (e: any) {
      setSignal({ ticker, signal: 'ERROR', entry: 0, take_profit: 0, stop_loss: 0, risk_reward_ratio: 0, confidence: 0, cached: false, error: e.message });
    }
    setSignalLoading(false);
  }

  if (loading) return <div className="container mx-auto px-4 py-8">Loading...</div>;
  if (!data) return <div className="container mx-auto px-4 py-8">Failed to load</div>;

  const { quote, summary, history, indicators } = data;
  const mc = summary.price?.marketCap;
  const pe = summary.defaultKeyStatistics?.trailingPE;
  const eps = summary.financialData?.epsCurrentYear;
  const rg = summary.financialData?.revenueGrowth;

  const marketOpen = isMarketOpen();
  const prevChange = getPreviousCloseChange(history);

  // Determine what price/change to show
  let displayPrice = quote.regularMarketPrice;
  let displayChange = quote.regularMarketChange;
  let displayChangePercent = quote.regularMarketChangePercent;
  let changeLabel = marketOpen ? 'Live' : 'Prev Close';

  // Show pre/post market if available and market is closed
  if (!marketOpen && quote.preMarketPrice && quote.preMarketChange !== undefined) {
    displayPrice = quote.preMarketPrice;
    displayChange = quote.preMarketChange;
    displayChangePercent = quote.preMarketChangePercent || 0;
    changeLabel = 'Pre-Market';
  } else if (!marketOpen && quote.postMarketPrice && quote.postMarketChange !== undefined) {
    displayPrice = quote.postMarketPrice;
    displayChange = quote.postMarketChange;
    displayChangePercent = quote.postMarketChangePercent || 0;
    changeLabel = 'After Hours';
  } else if (!marketOpen && prevChange) {
    displayChange = prevChange.change;
    displayChangePercent = prevChange.changePercent;
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-4xl font-bold font-mono">{ticker}</h1>
        <p className="text-muted-foreground">{quote.shortName}</p>
        <div className="flex items-center gap-4 mt-2">
          <span className="text-3xl font-bold">${displayPrice?.toFixed(2)}</span>
          <div className="flex items-center gap-2">
            <span className={displayChange >= 0 ? 'text-green-500' : 'text-red-500'}>
              {displayChange?.toFixed(2)} ({displayChangePercent?.toFixed(2)}%)
            </span>
            <Badge variant={marketOpen ? 'default' : 'secondary'} className="text-xs">
              {changeLabel}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader><CardTitle>Fundamentals</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between"><span>Market Cap</span><span>${mc ? (mc / 1e9).toFixed(1) : 'N/A'}B</span></div>
            <div className="flex justify-between"><span>P/E</span><span>{pe?.toFixed(1) ?? 'N/A'}</span></div>
            <div className="flex justify-between"><span>EPS</span><span>{eps?.toFixed(2) ?? 'N/A'}</span></div>
            <div className="flex justify-between"><span>Rev Growth</span><span>{rg ? (rg * 100).toFixed(1) : 'N/A'}%</span></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Technical Indicators</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between"><span>RSI (14)</span><span className={indicators.rsi && indicators.rsi > 70 ? 'text-red-500' : indicators.rsi && indicators.rsi < 30 ? 'text-green-500' : ''}>{indicators.rsi?.toFixed(1) ?? 'N/A'}</span></div>
            <div className="flex justify-between"><span>EMA 20</span><span>${indicators.ema20?.toFixed(2) ?? 'N/A'}</span></div>
            <div className="flex justify-between"><span>EMA 50</span><span>${indicators.ema50?.toFixed(2) ?? 'N/A'}</span></div>
            <div className="flex justify-between"><span>EMA 200</span><span>${indicators.ema200?.toFixed(2) ?? 'N/A'}</span></div>
            {indicators.macd && (
              <div className="flex justify-between"><span>MACD</span><span>{indicators.macd.macd.toFixed(3)}</span></div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Daily Signal</CardTitle>
              {signal?.createdAt && (
                <span className="text-xs text-muted-foreground">
                  {new Date(signal.createdAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!signalChecked ? (
              <div className="text-center py-4 text-sm text-muted-foreground">Checking for signal...</div>
            ) : signal?.error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
                {signal.error}
              </div>
            )}
            <SignalCard
              data={signal}
              loading={signalLoading}
              onGenerate={getSignal}
            />
            {!signal && signalChecked && (
              <div className="mt-4 text-center">
                <Button onClick={getSignal} disabled={signalLoading}>
                  {signalLoading ? 'Generating...' : 'Generate Daily Signal'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Price Chart</CardTitle></CardHeader>
        <CardContent>
          <StockChart data={history.map(h => ({ date: h.date, close: h.close }))} />
        </CardContent>
      </Card>
    </main>
  );
}
