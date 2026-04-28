import { NextRequest, NextResponse } from 'next/server';
import { yahooFinance } from '@/lib/yahoo';
import { prisma } from '@/lib/prisma';
import { calculateIndicators } from '@/lib/indicators';
import { getAIRecommendation } from '@/lib/mistral';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const ticker = body.ticker;
    if (!ticker) return NextResponse.json({ error: 'Ticker required' }, { status: 400 });

    const upperTicker = ticker.toUpperCase();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const cached = await prisma.recommendation.findFirst({
      where: {
        ticker: upperTicker,
        createdAt: { gte: today },
      },
    });

    if (cached) {
      return NextResponse.json({
        ticker: cached.ticker,
        recommendation: cached.recommendation,
        confidence: cached.confidence,
        technical_analysis: cached.technical,
        fundamental_analysis: cached.fundamental,
        sentiment_analysis: cached.sentiment,
        summary: cached.summary,
        cached: true,
      });
    }

    const [summary, history] = await Promise.all([
      yahooFinance.quoteSummary(upperTicker, {
        modules: ['price', 'summaryDetail', 'financialData', 'defaultKeyStatistics'],
      } as any),
      yahooFinance.historical(upperTicker, {
        period1: '2024-01-01',
        period2: new Date().toISOString().split('T')[0],
        interval: '1d',
      }),
    ]);

    const indicators = calculateIndicators(history as { close: number | null; high?: number | null; low?: number | null; volume?: number }[]);
    const price = (summary as any).price;
    const financial = (summary as any).financialData;
    const stats = (summary as any).defaultKeyStatistics;
    const newsResult = await yahooFinance.search(upperTicker, { newsCount: 3 } as any);
    const news = (newsResult as any).news?.map((n: { title: string }) => n.title).join('\n') || 'No recent news';

    const aiResult = await getAIRecommendation({
      ticker: upperTicker,
      rsi: indicators.rsi,
      ema20: indicators.ema20,
      ema50: indicators.ema50,
      ema200: indicators.ema200,
      macd: indicators.macd,
      pe: stats?.trailingPE ?? null,
      eps: financial?.epsCurrentYear ?? null,
      revenue_growth: financial?.revenueGrowth ?? null,
      market_cap: price?.marketCap ?? null,
      news,
    });

    const saved = await prisma.recommendation.create({
      data: {
        ticker: upperTicker,
        recommendation: aiResult.recommendation,
        confidence: aiResult.confidence,
        technical: aiResult.technical_analysis,
        fundamental: aiResult.fundamental_analysis,
        sentiment: aiResult.sentiment_analysis,
        summary: aiResult.summary,
      },
    });

    return NextResponse.json({
      ticker: saved.ticker,
      recommendation: saved.recommendation,
      confidence: saved.confidence,
      technical_analysis: saved.technical,
      fundamental_analysis: saved.fundamental,
      sentiment_analysis: saved.sentiment,
      summary: saved.summary,
      cached: false,
    });
  } catch (error: any) {
    console.error('[API] Error:', error);
    return NextResponse.json(
      { error: error.message, stack: error.stack },
      { status: 500 }
    );
  }
}
