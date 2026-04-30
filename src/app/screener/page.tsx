 'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScadcnButton, ScadcnInput } from '@/ui/scadcn';
import Link from 'next/link';

interface Stock {
  ticker: string;
  name: string;
  price: number;
  marketCap: number;
  pe: number | null;
  revenueGrowth: number | null;
  rsi: number | null;
  volumeSpike: boolean;
  volumeTrend: string;
}

function formatMarketCap(value: number): string {
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  return `$${value.toFixed(2)}`;
}

function StockTable({ stocks }: { stocks: Stock[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left p-2">Ticker</th>
            <th className="text-left p-2">Name</th>
            <th className="text-right p-2">Price</th>
            <th className="text-right p-2">Market Cap</th>
            <th className="text-right p-2">P/E</th>
            <th className="text-right p-2">Revenue Growth</th>
            <th className="text-right p-2">RSI</th>
            <th className="text-center p-2">Volume</th>
          </tr>
        </thead>
        <tbody>
          {stocks.map((stock) => (
            <tr key={stock.ticker} className="border-b hover:bg-muted/50">
              <td className="p-2">
                <Link href={`/stocks/${stock.ticker}`} className="font-mono font-bold text-blue-600 hover:underline">
                  {stock.ticker}
                </Link>
              </td>
              <td className="p-2 text-muted-foreground">{stock.name}</td>
              <td className="p-2 text-right font-mono">${stock.price.toFixed(2)}</td>
              <td className="p-2 text-right font-mono">{formatMarketCap(stock.marketCap)}</td>
              <td className="p-2 text-right font-mono">{stock.pe?.toFixed(2) ?? 'N/A'}</td>
              <td className="p-2 text-right font-mono">
                {stock.revenueGrowth !== null ? `${stock.revenueGrowth.toFixed(1)}%` : 'N/A'}
              </td>
              <td className="p-2 text-right font-mono">
                {stock.rsi !== null ? (
                  <span className={stock.rsi > 70 ? 'text-red-600' : stock.rsi < 30 ? 'text-green-600' : ''}>
                    {stock.rsi.toFixed(1)}
                  </span>
                ) : 'N/A'}
              </td>
              <td className="p-2 text-center">
                {stock.volumeSpike && <Badge variant="destructive" className="text-xs">Spike</Badge>}
                {stock.volumeTrend === 'increasing' && <Badge variant="default" className="text-xs ml-1">↑</Badge>}
                {stock.volumeTrend === 'decreasing' && <Badge variant="outline" className="text-xs ml-1">↓</Badge>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ScreenerPage() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [filteredStocks, setFilteredStocks] = useState<Stock[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [warmingUp, setWarmingUp] = useState(false);

  async function fetchStocks() {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const res = await fetch(`${baseUrl}/api/screener-cached`, { cache: 'no-store' });
      if (!res.ok) {
        setStocks([]);
        return;
      }
      const data = await res.json();
      setStocks(data.stocks || []);
    } catch (error) {
      console.error('Failed to fetch stocks:', error);
      setStocks([]);
    } finally {
      setLoading(false);
    }
  }

  async function warmCache() {
    setWarmingUp(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      await fetch(`${baseUrl}/api/warm-cache`, { cache: 'no-store' });

      // Poll for data every 5 seconds
      const interval = setInterval(async () => {
        await fetchStocks();
        if (stocks.length > 0) {
          clearInterval(interval);
          setWarmingUp(false);
        }
      }, 5000);
    } catch (error) {
      console.error('Failed to warm cache:', error);
      setWarmingUp(false);
    }
  }

  useEffect(() => {
    fetchStocks();
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setFilteredStocks(stocks);
      return;
    }
    const query = search.toLowerCase();
    const filtered = stocks.filter(s =>
      s.ticker.toLowerCase().includes(query) ||
      s.name.toLowerCase().includes(query)
    );
    setFilteredStocks(filtered);
  }, [search, stocks]);

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Stock Screener</h1>
        <p className="text-muted-foreground">
          Filter and discover stocks from the S&P 500 with real-time indicators
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Stocks ({filteredStocks.length})</CardTitle>
              <div className="flex gap-2">
                <ScadcnInput
                  type="text"
                  placeholder="Search by ticker or name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-64"
                />
               {stocks.length === 0 && !loading && (
                 <ScadcnButton onClick={warmCache} disabled={warmingUp}>
                   {warmingUp ? 'Warming up...' : 'Warm Cache'}
                 </ScadcnButton>
               )}
               <ScadcnButton onClick={() => { setLoading(true); fetchStocks(); }}>Refresh</ScadcnButton>
              </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center">Loading...</div>
          ) : stocks.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-muted-foreground mb-4">No stock data available.</p>
              <p className="text-sm text-muted-foreground">
                The screener cache needs to be populated. This fetches data for 500+ stocks and may take a few minutes.
              </p>
            </div>
          ) : (
            <StockTable stocks={filteredStocks} />
          )}
        </CardContent>
      </Card>
    </main>
  );
}
