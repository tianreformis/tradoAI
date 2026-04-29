import YahooFinance from 'yahoo-finance2';

export const yahooFinance = new YahooFinance();

const CACHE = new Map<string, { data: unknown; expiry: number }>();
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

function getCached<T>(key: string): T | null {
  const cached = CACHE.get(key);
  if (cached && cached.expiry > Date.now()) return cached.data as T;
  CACHE.delete(key);
  return null;
}

function setCache(key: string, data: unknown) {
  CACHE.set(key, { data, expiry: Date.now() + CACHE_TTL });
}

export async function getQuote(ticker: string) {
  const key = `quote:${ticker}`;
  const cached = getCached(key);
  if (cached) return cached;
  const data = await yahooFinance.quote(ticker, { validateResult: false } as any);
  setCache(key, data);
  return data;
}

export async function getQuoteSummary(ticker: string) {
  const key = `summary:${ticker}`;
  const cached = getCached(key);
  if (cached) return cached;
  const data = await yahooFinance.quoteSummary(ticker, {
    modules: ['price', 'summaryDetail', 'financialData', 'defaultKeyStatistics'],
    validateResult: false,
  } as any);
  setCache(key, data);
  return data;
}

export async function getHistorical(ticker: string, period1: string, period2: string) {
  const key = `hist:${ticker}:${period1}:${period2}`;
  const cached = getCached(key);
  if (cached) return cached;
  const data = await yahooFinance.historical(ticker, { period1, period2, interval: '1d', validateResult: false } as any);
  setCache(key, data);
  return data;
}

export async function searchNews(query: string) {
  const key = `news:${query}`;
  const cached = getCached(key);
  if (cached) return cached;
  const data = await yahooFinance.search(query, { newsCount: 5, validateResult: false } as any);
  setCache(key, data);
  return data;
}
