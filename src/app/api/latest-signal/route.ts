import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const ticker = (searchParams.get('ticker') || '').toUpperCase();
    
    if (!ticker) {
      return NextResponse.json({ error: 'Ticker is required' }, { status: 400 });
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get today's signal if exists
    const signal = await prisma.dailySignal.findFirst({
      where: {
        ticker,
        createdAt: { gte: today },
      },
      orderBy: { createdAt: 'desc' },
    });
    
    if (!signal) {
      return NextResponse.json({ exists: false });
    }
    
    return NextResponse.json({
      exists: true,
      ticker: signal.ticker,
      signal: signal.signal,
      entry: signal.entry,
      take_profit: signal.takeProfit,
      stop_loss: signal.stopLoss,
      risk_reward_ratio: signal.riskReward,
      confidence: signal.confidence,
      reasoning: {
        technical: signal.technical,
        momentum: signal.momentum,
        risk_management: signal.risk,
      },
      summary: signal.summary,
      cached: true,
      createdAt: signal.createdAt,
    });
  } catch (error: any) {
    console.error('[API] Error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
