'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const POPULAR_TICKERS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'BRK.B'];

interface HomeSignal {
  ticker: string;
  signal?: string;
  confidence?: number;
}

export default function Home() {
  const [signals, setSignals] = useState<Record<string, HomeSignal>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSignals();
  }, []);

  async function fetchSignals() {
    try {
      const results = await Promise.allSettled(
        POPULAR_TICKERS.map(async (ticker) => {
          const res = await fetch(`/api/latest-signal?ticker=${ticker}`);
          const data = await res.json();
          if (data.exists) {
            return { ticker, signal: data.signal, confidence: data.confidence };
          }
          return { ticker };
        })
      );
      
      const signalMap: Record<string, HomeSignal> = {};
      results.forEach(result => {
        if (result.status === 'fulfilled') {
          signalMap[result.value.ticker] = result.value;
        }
      });
      
      setSignals(signalMap);
    } catch (e) {
      console.error('Failed to fetch signals:', e);
    }
    setLoading(false);
  }

  return (
    <main className="container mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold tracking-tight mb-4">US Stock Market Screener</h1>
        <p className="text-xl text-muted-foreground mb-8">
          AI-powered stock analysis with technical indicators and real-time data
        </p>
        <Link href="/screener">
          <Button size="lg">Start Screening</Button>
        </Link>
      </div>

      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Popular Stocks</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {POPULAR_TICKERS.map(ticker => {
            const signal = signals[ticker];
            return (
              <Link key={ticker} href={`/stocks/${ticker}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="font-mono text-lg">{ticker}</CardTitle>
                      {!loading && signal?.signal && (
                        <Badge variant={
                          signal.signal === 'LONG' ? 'success' :
                          signal.signal === 'SHORT' ? 'destructive' : 'default'
                        }>
                          {signal.signal}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="text-sm text-muted-foreground">Loading...</div>
                    ) : signal?.signal ? (
                      <div className="text-sm text-muted-foreground">
                        Confidence: {signal.confidence}%
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">No signal yet</div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="max-w-3xl mx-auto mt-8">
        <div className="text-center">
          <Link href="/signals">
            <Button variant="outline" size="lg">View All Daily Signals 🔥</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
