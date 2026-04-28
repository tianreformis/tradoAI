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

  const prompt = `You are a professional quantitative trader.

Analyze this stock and generate a trade setup.

Ticker: ${data.ticker}
Current Price: ${data.price}

Technical Indicators:
- RSI: ${data.rsi ?? 'N/A'}
- EMA20: ${data.ema20 ?? 'N/A'}
- EMA50: ${data.ema50 ?? 'N/A'}
- EMA200: ${data.ema200 ?? 'N/A'}
- MACD: ${data.macd ? JSON.stringify(data.macd) : 'N/A'}
- ATR: ${data.atr ?? 'N/A'}

Support/Resistance:
- Support: ${data.support ?? 'N/A'}
- Resistance: ${data.resistance ?? 'N/A'}

Volume:
${data.volume_analysis}

Rules:
- Use ATR to determine realistic TP and SL
- SL should be below support (for LONG) or above resistance (for SHORT)
- TP should be near next resistance/support level
- CRITICAL: Risk/Reward ratio MUST be at least 1:2 (risk 1, reward 2)
- For LONG: (take_profit - entry) / (entry - stop_loss) >= 2
- For SHORT: (entry - take_profit) / (stop_loss - entry) >= 2
- If setup cannot achieve 1:2 R:R, return HOLD
- Be conservative and precise

Return JSON:
{
  "signal": "LONG | SHORT | HOLD",
  "entry": number,
  "take_profit": number,
  "stop_loss": number,
  "risk_reward_ratio": number,
  "confidence": number,
  "reasoning": {
    "technical": "...",
    "momentum": "...",
    "risk_management": "..."
  },
  "summary": "short explanation"
}

  Be precise, realistic, and conservative.`;

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
