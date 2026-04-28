import { NextRequest, NextResponse } from 'next/server';
import { yahooFinance } from '@/lib/yahoo';
import { prisma } from '@/lib/prisma';
import { calculateIndicators } from '@/lib/indicators';
import { getDailySignal } from '@/lib/mistral';
import { SP500_TICKERS } from '@/lib/sp500';

export const dynamic = 'force-dynamic';

// This endpoint should be called by a cron job (e.g., Vercel Cron, GitHub Actions)
// It generates signals for all S&P 500 stocks
export async function GET(req: NextRequest) {
  try {
    // Optional: Check for a secret to secure the endpoint
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    console.log('[Cron] Starting daily signal generation for S&P 500...');
    
    const results = { success: 0, skipped: 0, failed: 0, errors: [] as string[] };
    
    // Process in batches to avoid rate limits
    const BATCH_SIZE = 10;
    
    for (let i = 0; i < SP500_TICKERS.length; i += BATCH_SIZE) {
      const batch = SP500_TICKERS.slice(i, i + BATCH_SIZE);
      
      const batchResults = await Promise.allSettled(
        batch.map(async (ticker) => {
          try {
            // Check if signal already exists for today
            const existing = await prisma.dailySignal.findFirst({
              where: {
                ticker,
                createdAt: { gte: today },
              },
            });
            
            if (existing) {
              return { ticker, status: 'skipped', reason: 'Already exists' };
            }
            
            // Fetch data
            const [quote, summary, history] = await Promise.all([
              yahooFinance.quote(ticker),
              yahooFinance.quoteSummary(ticker, {
                modules: ['price', 'summaryDetail', 'financialData', 'defaultKeyStatistics'],
              } as any),
              yahooFinance.historical(ticker, {
                period1: '2024-01-01',
                period2: new Date().toISOString().split('T')[0],
                interval: '1d',
              }),
            ]);
            
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
            
            if (!price) throw new Error('Unable to fetch price');
            
            const volumeAnalysis = `Volume trend: ${indicators.volumeTrend}${indicators.volumeSpike ? ' (SPIKE detected)' : ''}`;
            
            const aiResult = await getDailySignal({
              ticker,
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
            
            await prisma.dailySignal.create({
              data: {
                ticker,
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
            
            return { ticker, status: 'success' };
          } catch (error: any) {
            return { ticker, status: 'failed', error: error.message };
          }
        })
      );
      
      // Count results
      for (const result of batchResults) {
        if (result.status === 'fulfilled') {
          const value = result.value as any;
          if (value.status === 'success') results.success++;
          else if (value.status === 'skipped') results.skipped++;
        } else {
          results.failed++;
          results.errors.push((result as PromiseRejectedResult).reason);
        }
      }
      
      // Small delay between batches to avoid rate limits
      if (i + BATCH_SIZE < SP500_TICKERS.length) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    console.log(`[Cron] Completed: ${JSON.stringify(results)}`);
    
    return NextResponse.json({
      message: 'Signal generation completed',
      ...results,
    });
  } catch (error: any) {
    console.error('[Cron] Error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
