const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';
const MISTRAL_MODEL = 'mistral-small-latest';

export interface AIRecommendation {
  recommendation: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  technical_analysis: string;
  fundamental_analysis: string;
  sentiment_analysis: string;
  summary: string;
}

export interface DailySignal {
  signal: 'LONG' | 'SHORT' | 'HOLD';
  entry: number;
  take_profit: number;
  stop_loss: number;
  risk_reward_ratio: number;
  confidence: number;
  reasoning: {
    technical: string;
    momentum: string;
    risk_management: string;
  };
  summary: string;
}

export async function getAIRecommendation(data: {
  ticker: string;
  rsi: number | null;
  ema20: number | null;
  ema50: number | null;
  ema200: number | null;
  macd: { macd: number; signal: number; histogram: number } | null;
  pe: number | null;
  eps: number | null;
  revenue_growth: number | null;
  market_cap: number | null;
  news: string;
}): Promise<AIRecommendation> {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) throw new Error('MISTRAL_API_KEY not set');

  const prompt = `You are a professional Wall Street quantitative analyst.

Analyze this stock:

Ticker: ${data.ticker}

Technical:
RSI: ${data.rsi ?? 'N/A'}
EMA20: ${data.ema20 ?? 'N/A'}
EMA50: ${data.ema50 ?? 'N/A'}
EMA200: ${data.ema200 ?? 'N/A'}
MACD: ${data.macd ? JSON.stringify(data.macd) : 'N/A'}

Fundamental:
P/E: ${data.pe ?? 'N/A'}
EPS: ${data.eps ?? 'N/A'}
Revenue Growth: ${data.revenue_growth ?? 'N/A'}
Market Cap: ${data.market_cap ?? 'N/A'}

Recent News:
${data.news}

Return JSON:
{
  "recommendation": "BUY | SELL | HOLD",
  "confidence": number,
  "technical_analysis": "...",
  "fundamental_analysis": "...",
  "sentiment_analysis": "...",
  "summary": "..."
}

Be data-driven and concise.`;

  const response = await fetch(MISTRAL_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MISTRAL_MODEL,
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) throw new Error(`Mistral API error: ${response.statusText}`);
  const result = await response.json();
  return JSON.parse(result.choices[0].message.content);
}

export async function getDailySignal(data: {
  ticker: string;
  price: number;
  rsi: number | null;
  ema20: number | null;
  ema50: number | null;
  ema200: number | null;
  macd: { macd: number; signal: number; histogram: number } | null;
  atr: number | null;
  support: number | null;
  resistance: number | null;
  volume_analysis: string;
}): Promise<DailySignal> {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) throw new Error('MISTRAL_API_KEY not set');

  const trend = data.ema20 && data.ema50 && data.ema200
    ? (data.ema20 > data.ema50 && data.ema50 > data.ema200
        ? 'BULLISH (EMA20 > EMA50 > EMA200)'
        : data.ema20 < data.ema50 && data.ema50 < data.ema200
        ? 'BEARISH (EMA20 < EMA50 < EMA200)'
        : 'NEUTRAL (mixed EMAs)')
    : 'N/A';

  const prompt = `You are a professional quantitative trader with 15+ years of experience.

Analyze this stock and generate a HIGH-PROBABILITY trade setup.

Ticker: ${data.ticker}
Current Price: ${data.price}

Technical Indicators:
- RSI(14): ${data.rsi ?? 'N/A'} ${data.rsi ? (data.rsi > 70 ? '(OVERBOUGHT)' : data.rsi < 30 ? '(OVERSOLD)' : '') : ''}
- EMA20: ${data.ema20 ?? 'N/A'}
- EMA50: ${data.ema50 ?? 'N/A'}
- EMA200: ${data.ema200 ?? 'N/A'}
- MACD: ${data.macd ? `Line=${data.macd.macd.toFixed(2)}, Signal=${data.macd.signal.toFixed(2)}, Hist=${data.macd.histogram.toFixed(2)}` : 'N/A'}
- ATR(14): ${data.atr ?? 'N/A'}

Support/Resistance Levels:
- Support: ${data.support ?? 'N/A'}
- Resistance: ${data.resistance ?? 'N/A'}

Trend Analysis:
${trend}

Volume Analysis:
${data.volume_analysis}

STRICT RULES:
1. Entry price MUST be within 0.5% of current price (${data.price})
2. For LONG: SL must be below support OR entry - (1.5 * ATR), whichever is LOWER
3. For SHORT: SL must be above resistance OR entry + (1.5 * ATR), whichever is HIGHER
4. TP must be at nearest resistance (LONG) or support (SHORT) but NO CLOSER than 2x the SL distance
5. CRITICAL: Risk/Reward ratio MUST be >= 2.0 (enforce strictly)
6. If trend is BULLISH, only take LONG; if BEARISH, only take SHORT; if NEUTRAL, either but with higher confidence
7. RSI must confirm: LONG when RSI < 50 or recovering from oversold; SHORT when RSI > 50 or declining from overbought
8. MACD must confirm: LONG when MACD > Signal; SHORT when MACD < Signal
9. If any confirmation fails, return HOLD with reasoning
10. Be extremely conservative - only generate signal if setup is A+ quality

Return VALID JSON only:
{
  "signal": "LONG" | "SHORT" | "HOLD",
  "entry": number (must be close to ${data.price}),
  "take_profit": number,
  "stop_loss": number,
  "risk_reward_ratio": number (must be >= 2.0),
  "confidence": number (0-100, be strict),
  "reasoning": {
    "technical": "explain EMA trend, RSI, MACD confirmation",
    "momentum": "volume analysis and price action",
    "risk_management": "why SL/TP levels were chosen, R:R calc"
  },
  "summary": "one-line explanation of the trade"
}

Remember: Only generate HIGH CONFIDENCE setups. When in doubt, HOLD.`;

  const response = await fetch(MISTRAL_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MISTRAL_MODEL,
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) throw new Error(`Mistral API error: ${response.statusText}`);
  const result = await response.json();
  const parsed = JSON.parse(result.choices[0].message.content);

  // Validate and recalculate risk/reward ratio
  if (parsed.signal !== 'HOLD' && parsed.entry && parsed.take_profit && parsed.stop_loss) {
    let riskReward: number;

    if (parsed.signal === 'LONG') {
      const risk = Math.abs(parsed.entry - parsed.stop_loss);
      const reward = Math.abs(parsed.take_profit - parsed.entry);
      riskReward = risk > 0 ? reward / risk : 0;
    } else if (parsed.signal === 'SHORT') {
      const risk = Math.abs(parsed.stop_loss - parsed.entry);
      const reward = Math.abs(parsed.entry - parsed.take_profit);
      riskReward = risk > 0 ? reward / risk : 0;
    } else {
      riskReward = 0;
    }

    // Enforce minimum 1:2 risk/reward ratio
    if (riskReward < 2) {
      parsed.signal = 'HOLD';
      parsed.risk_reward_ratio = 0;
      parsed.reasoning = {
        technical: parsed.reasoning?.technical || '',
        momentum: parsed.reasoning?.momentum || '',
        risk_management: `Risk/Reward ratio of ${riskReward.toFixed(2)} does not meet minimum 1:2 requirement. Signal changed to HOLD.`
      };
    } else {
      parsed.risk_reward_ratio = Math.round(riskReward * 100) / 100;
    }
  }

  return parsed;
}
