import { NextRequest, NextResponse } from 'next/server';
import { yahooFinance } from '@/lib/yahoo';
import { calculateIndicators } from '@/lib/indicators';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ ticker: string }> }
) {
  try {
    const { ticker: rawTicker } = await context.params;
    const ticker = rawTicker.toUpperCase();
    const { searchParams } = new URL(req.url);
    const period1 = searchParams.get('period1') || '2024-01-01';
    const period2 = searchParams.get('period2') || new Date().toISOString().split('T')[0];

    const [quote, summary, history] = await Promise.all([
      yahooFinance.quote(ticker),
      yahooFinance.quoteSummary(ticker, {
        modules: ['price', 'summaryDetail', 'financialData', 'defaultKeyStatistics'],
      } as any),
      yahooFinance.historical(ticker, { period1, period2, interval: '1d' }),
    ]);

    const historyData = history as any[];
    const quoteData = quote as any;
    const summaryData = summary as any;

    const indicators = calculateIndicators(
      historyData.map((h: any) => ({
        close: h.close,
        high: h.high,
        low: h.low,
        volume: h.volume,
      }))
    );

    const pe = 
      summaryData?.defaultKeyStatistics?.trailingPE ??
      summaryData?.price?.trailingPE ??
      quoteData?.trailingPE ??
      null;

    const marketCap = 
      summaryData?.price?.marketCap ??
      (quoteData?.regularMarketPrice && quoteData?.sharesOutstanding 
        ? quoteData.regularMarketPrice * quoteData.sharesOutstanding 
        : 0);

    return NextResponse.json({
      ticker,
      quote: {
        regularMarketPrice: quoteData?.regularMarketPrice || 0,
        shortName: quoteData?.shortName || summaryData?.price?.shortName || ticker,
        trailingPE: pe,
      },
      summary: {
        price: {
          marketCap,
          shortName: summaryData?.price?.shortName,
        },
        defaultKeyStatistics: {
          trailingPE: pe,
        },
        financialData: {
          revenueGrowth: summaryData?.financialData?.revenueGrowth,
        },
      },
      history: historyData.slice(-252).map((h: any) => ({
        date: h.date,
        close: h.close,
        volume: h.volume,
        high: h.high,
        low: h.low,
      })),
      indicators,
    });
  } catch (error: any) {
    console.error('[API] Error:', error);
    return NextResponse.json(
      { error: error.message, stack: error.stack },
      { status: 500 }
    );
  }
}
