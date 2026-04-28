import { NextRequest, NextResponse } from 'next/server';
import { yahooFinance } from '@/lib/yahoo';
import { prisma } from '@/lib/prisma';
import { calculateIndicators } from '@/lib/indicators';
import { getDailySignal, DailySignal } from '@/lib/mistral';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const ticker = body.ticker;
    if (!ticker) return NextResponse.json({ error: 'Ticker required' }, { status: 400 });

    const upperTicker = ticker.toUpperCase();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    console.log(`[DailySignal] Request for ${upperTicker}`);

    // Check if signal already exists for today
    const cached = await prisma.dailySignal.findFirst({
      where: {
        ticker: upperTicker,
        createdAt: { gte: today },
      },
    });

    if (cached) {
      console.log(`[DailySignal] Returning cached signal for ${upperTicker}`);
      return NextResponse.json({
        ticker: cached.ticker,
        signal: cached.signal,
        entry: cached.entry,
        take_profit: cached.takeProfit,
        stop_loss: cached.stopLoss,
        risk_reward_ratio: cached.riskReward,
        confidence: cached.confidence,
        reasoning: {
          technical: cached.technical,
          momentum: cached.momentum,
          risk_management: cached.risk,
        },
        summary: cached.summary,
        cached: true,
      });
    }

    console.log(`[DailySignal] Checking MISTRAL_API_KEY...`);
    if (!process.env.MISTRAL_API_KEY) {
      console.error('[DailySignal] MISTRAL_API_KEY not set');
      return NextResponse.json(
        { error: 'MISTRAL_API_KEY is not set in environment variables. Please add it to your .env file.' },
        { status: 500 }
      );
    }

    console.log(`[DailySignal] Fetching Yahoo Finance data for ${upperTicker}...`);
    const [quote, summary, history] = await Promise.all([
      yahooFinance.quote(upperTicker),
      yahooFinance.quoteSummary(upperTicker, {
        modules: ['price', 'summaryDetail', 'financialData', 'defaultKeyStatistics'],
      } as any),
      yahooFinance.historical(upperTicker, {
        period1: '2024-01-01',
        period2: new Date().toISOString().split('T')[0],
        interval: '1d',
      }),
    ]);

    console.log(`[DailySignal] Data fetched for ${upperTicker}, history length: ${history.length}`);

    const indicators = calculateIndicators(
      (history as any[]).map((h: any) => ({
        close: h.close,
        high: h.high,
        low: h.low,
        volume: h.volume,
      }))
    );
    
    const quoteData = quote as any;
    const summaryData = summary as any;
    const price = quoteData?.regularMarketPrice || summaryData?.price?.regularMarketPrice;

    if (!price) {
      console.error(`[DailySignal] Unable to fetch current price for ${upperTicker}`);
      throw new Error('Unable to fetch current price for this ticker');
    }

    console.log(`[DailySignal] Price for ${upperTicker}: ${price}, calling Mistral AI...`);

    const volumeAnalysis = `Volume trend: ${indicators.volumeTrend}${indicators.volumeSpike ? ' (SPIKE detected)' : ''}`;

    const aiResult = await getDailySignal({
      ticker: upperTicker,
      price,
      rsi: indicators.rsi,
      ema20: indicators.ema20,
      ema50: indicators.ema50,
      ema200: indicators.ema200,
      macd: indicators.macd,
      atr: indicators.atr,
      support: indicators.support,
      resistance: indicators.resistance,
      volume_analysis: volumeAnalysis,
    });

    console.log(`[DailySignal] Mistral AI result for ${upperTicker}:`, aiResult.signal);

    const saved = await prisma.dailySignal.create({
      data: {
        ticker: upperTicker,
        signal: aiResult.signal,
        entry: aiResult.entry || null,
        takeProfit: aiResult.take_profit || null,
        stopLoss: aiResult.stop_loss || null,
        riskReward: aiResult.risk_reward_ratio || null,
        confidence: aiResult.confidence,
        technical: aiResult.reasoning.technical,
        momentum: aiResult.reasoning.momentum,
        risk: aiResult.reasoning.risk_management,
        summary: aiResult.summary,
      },
    });

    console.log(`[DailySignal] Signal saved for ${upperTicker}`);

    return NextResponse.json({
      ticker: saved.ticker,
      signal: saved.signal,
      entry: saved.entry,
      take_profit: saved.takeProfit,
      stop_loss: saved.stopLoss,
      risk_reward_ratio: saved.riskReward,
      confidence: saved.confidence,
      reasoning: {
        technical: saved.technical,
        momentum: saved.momentum,
        risk_management: saved.risk,
      },
      summary: saved.summary,
      cached: false,
    });
  } catch (error: any) {
    console.error('[DailySignal] Error:', error.message);
    return NextResponse.json(
      { error: error.message || 'Failed to generate signal. Please try again.' },
      { status: 500 }
    );
  }
}
