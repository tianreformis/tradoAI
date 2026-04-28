import { NextResponse } from 'next/server';
import { preloadStockCache } from '@/lib/screener-cache';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Run in background
    preloadStockCache().catch(err => console.error('[Warm Cache] Failed:', err));
    
    return NextResponse.json({ message: 'Cache warm-up started' });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
