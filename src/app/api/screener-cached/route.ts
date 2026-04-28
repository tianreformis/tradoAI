import { NextResponse } from 'next/server';
import { SP500_TICKERS } from '@/lib/sp500';
import { getCachedStocks, setCachedStocks, CachedStock } from '@/lib/screener-cache';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Return cached data if available
    const cached = getCachedStocks();
    if (cached) {
      return NextResponse.json({
        stocks: cached,
        fresh: false,
        timestamp: new Date().toISOString(),
      });
    }

    // If no cache, return empty and trigger background load
    // The warm-cache endpoint should have been called already
    return NextResponse.json({
      stocks: [],
      fresh: false,
      message: 'Cache not ready yet. Please call /api/warm-cache first.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// This gets called by warm-cache to populate the cache
export async function POST() {
  try {
    const results = await Promise.allSettled(
      SP500_TICKERS.map(async (ticker) => {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/stocks/${ticker}?period1=2024-01-01`
          );
          if (!res.ok) return null;
          const data = await res.json();
          
          const quote = data.quote as any;
          const summary = data.summary as any;
          const indicators = data.indicators as any;
          
          const pe = 
            summary?.defaultKeyStatistics?.trailingPE ??
            summary?.price?.trailingPE ??
            quote?.trailingPE ??
            null;
          
          const marketCap = 
            summary?.price?.marketCap ??
            (quote?.regularMarketPrice && quote?.sharesOutstanding 
              ? quote.regularMarketPrice * quote.sharesOutstanding 
              : 0);
          
          return {
            ticker,
            name: quote?.shortName || summary?.price?.shortName || ticker,
            price: quote?.regularMarketPrice || 0,
            marketCap,
            pe,
            revenueGrowth: summary?.financialData?.revenueGrowth ? summary.financialData.revenueGrowth * 100 : null,
            rsi: indicators?.rsi ?? null,
            volumeSpike: indicators?.volumeSpike ?? false,
            volumeTrend: indicators?.volumeTrend ?? 'unknown',
          } as CachedStock;
        } catch {
          return null;
        }
      })
    );

    const stocks = results
      .filter(r => r.status === 'fulfilled' && r.value)
      .map(r => (r as PromiseFulfilledResult<CachedStock | null>).value)
      .filter(Boolean) as CachedStock[];

    setCachedStocks(stocks);
    
    return NextResponse.json({
      success: true,
      count: stocks.length,
      message: `Cached ${stocks.length} stocks`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
