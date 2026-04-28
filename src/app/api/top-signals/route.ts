import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get('date'); // Optional: YYYY-MM-DD format
    
    let startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    
    if (dateParam) {
      // If date is provided, get signals for that specific date
      startDate = new Date(dateParam);
      startDate.setHours(0, 0, 0, 0);
    }
    
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);
    
    const signals = await prisma.dailySignal.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lt: endDate,
        },
      },
      orderBy: [
        { confidence: 'desc' },
        { riskReward: 'desc' },
      ],
    });
    
    const withScore = signals.map(s => ({
      id: s.id,
      ticker: s.ticker,
      signal: s.signal,
      entry: s.entry,
      take_profit: s.takeProfit,
      stop_loss: s.stopLoss,
      risk_reward_ratio: s.riskReward,
      confidence: s.confidence,
      summary: s.summary,
      score: (s.confidence * 0.4) + ((s.riskReward ?? 0) * 30 * 0.3) + (0.3 * 100),
      createdAt: s.createdAt,
    })).sort((a, b) => b.score - a.score).slice(0, 20);
    
    return NextResponse.json(withScore);
  } catch (error: any) {
    console.error('[API] Error fetching signals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch signals. Database may not be set up.' },
      { status: 500 }
    );
  }
}
