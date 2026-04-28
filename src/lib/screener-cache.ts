// Server-side cache for screener data
const cache = new Map<string, { data: any; expiry: number }>();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

export interface CachedStock {
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

export function getCachedStocks(): CachedStock[] | null {
  const cached = cache.get('all_stocks');
  if (cached && cached.expiry > Date.now()) {
    return cached.data;
  }
  return null;
}

export function setCachedStocks(stocks: CachedStock[]) {
  cache.set('all_stocks', {
    data: stocks,
    expiry: Date.now() + CACHE_TTL,
  });
}

// Preload cache in background
export async function preloadStockCache() {
  try {
    const { SP500_TICKERS } = await import('./sp500');
    const results = await Promise.allSettled(
      SP500_TICKERS.map(async (ticker) => {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/stocks/${ticker}?period1=2024-01-01`);
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
    console.log(`[Cache] Preloaded ${stocks.length} stocks`);
  } catch (error) {
    console.error('[Cache] Preload failed:', error);
  }
}
