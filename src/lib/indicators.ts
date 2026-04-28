export interface IndicatorResult {
  rsi: number | null;
  ema20: number | null;
  ema50: number | null;
  ema200: number | null;
  macd: { macd: number; signal: number; histogram: number } | null;
  atr: number | null;
  support: number | null;
  resistance: number | null;
  volumeSpike: boolean;
  volumeTrend: string;
}

function calculateEMA(prices: number[], period: number): number | null {
  if (prices.length < period) return null;
  const k = 2 / (period + 1);
  let ema = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;
  for (let i = period; i < prices.length; i++) {
    ema = prices[i] * k + ema * (1 - k);
  }
  return ema;
}

function calculateRSI(prices: number[], period = 14): number | null {
  if (prices.length < period + 1) return null;
  let gains = 0, losses = 0;
  for (let i = 1; i <= period; i++) {
    const diff = prices[i] - prices[i - 1];
    if (diff > 0) gains += diff; else losses += Math.abs(diff);
  }
  let avgGain = gains / period, avgLoss = losses / period;
  for (let i = period + 1; i < prices.length; i++) {
    const diff = prices[i] - prices[i - 1];
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? Math.abs(diff) : 0;
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
  }
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

function calculateMACD(prices: number[]): { macd: number; signal: number; histogram: number } | null {
  if (prices.length < 26) return null;
  const ema12 = calculateEMA(prices, 12);
  const ema26 = calculateEMA(prices, 26);
  if (ema12 === null || ema26 === null) return null;
  const macdLine = ema12 - ema26;
  const signalLine = macdLine * 0.3 + macdLine * 0.7 * 0.3;
  return {
    macd: macdLine,
    signal: signalLine,
    histogram: macdLine - signalLine
  };
}

function calculateATR(history: { high: number | null; low: number | null; close: number | null }[], period = 14): number | null {
  if (history.length < period + 1) return null;
  let trSum = 0;
  for (let i = 1; i <= period; i++) {
    const h = history[i].high ?? 0;
    const l = history[i].low ?? 0;
    const prevClose = history[i - 1].close ?? 0;
    const tr = Math.max(h - l, Math.abs(h - prevClose), Math.abs(l - prevClose));
    trSum += tr;
  }
  return trSum / period;
}

function findSupportResistance(history: { close: number | null }[], period = 20): { support: number | null; resistance: number | null } {
  const recent = history.slice(-period).map(h => h.close).filter((c): c is number => c !== null);
  if (recent.length === 0) return { support: null, resistance: null };
  return {
    support: Math.min(...recent),
    resistance: Math.max(...recent)
  };
}

function analyzeVolume(history: { volume?: number }[]): { isSpike: boolean; trend: string } {
  if (history.length < 20) return { isSpike: false, trend: 'normal' };
  const recent = history.slice(-20);
  const avgVol = recent.reduce((sum, h) => sum + (h.volume || 0), 0) / recent.length;
  const lastVol = recent[recent.length - 1]?.volume || 0;
  const isSpike = lastVol > avgVol * 1.5;
  const prevAvg = history.slice(-40, -20).reduce((sum, h) => sum + (h.volume || 0), 0) / 20;
  const trend = avgVol > prevAvg * 1.1 ? 'increasing' : avgVol < prevAvg * 0.9 ? 'decreasing' : 'stable';
  return { isSpike, trend };
}

export function calculateIndicators(history: { close: number | null; high?: number | null; low?: number | null; volume?: number }[]): IndicatorResult {
  const closes = history.map(h => h.close).filter((c): c is number => c !== null);
  const { support, resistance } = findSupportResistance(history);
  const { isSpike, trend } = analyzeVolume(history);
  return {
    rsi: calculateRSI(closes),
    ema20: calculateEMA(closes, 20),
    ema50: calculateEMA(closes, 50),
    ema200: calculateEMA(closes, 200),
    macd: calculateMACD(closes),
    atr: calculateATR(history as { high: number | null; low: number | null; close: number | null }[]),
    support,
    resistance,
    volumeSpike: isSpike,
    volumeTrend: trend,
  };
}
