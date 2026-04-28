# US Stock Market Screener

A production-ready stock screening web application with AI-powered recommendations, technical indicators, and real-time market data.

## 🧱 Tech Stack

**Frontend:**
- [Next.js 15](https://nextjs.org/) (App Router)
- [TailwindCSS](https://tailwindcss.com/)
- [Shadcn/UI](https://ui.shadcn.com/) components
- [Recharts](https://recharts.org/) for charts

**Backend:**
- Next.js API Routes
- [Prisma ORM](https://www.prisma.io/) with PostgreSQL

**Data Source:**
- [yahoo-finance2](https://www.npmjs.com/package/yahoo-finance2) - Real-time and historical stock data

**AI:**
- [Mistral AI](https://mistral.ai/) - Direct API integration

---

## 🎯 Features

### Stock Screener
- Filter stocks by:
  - Market Cap
  - P/E Ratio
  - Revenue Growth
  - RSI (Relative Strength Index)
  - Volume Spike detection
- Pagination and sorting
- Pre-loaded with popular tickers (AAPL, MSFT, GOOGL, etc.)

### Stock Detail Page
- **Interactive Chart** with multiple timeframes (1W, 1M, 3M, 6M, 1Y, ALL)
- **Technical Indicators:**
  - RSI (14)
  - EMA (20, 50, 200)
  - MACD
- **Fundamentals:**
  - EPS
  - P/E Ratio
  - Revenue Growth
  - Market Cap
- **News:** Recent news via Yahoo Finance
- **AI Recommendation:** Mistral-powered buy/sell/hold recommendations

### AI Recommendation Engine
- Powered by Mistral AI
- Analyzes technical, fundamental, and sentiment data
- **Daily caching** - 1 recommendation per ticker per day
- Returns structured JSON with:
  - Recommendation (BUY | SELL | HOLD)
  - Confidence score
  - Technical analysis
  - Fundamental analysis
  - Sentiment analysis
  - Summary

---

## 📂 Project Structure

```
us-stock-screener/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Database migrations
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── stocks/[ticker]/
│   │   │   │   └── route.ts   # GET stock data API
│   │   │   └── recommendation/
│   │   │       └── route.ts   # POST AI recommendation API
│   │   ├── stocks/[ticker]/
│   │   │   └── page.tsx       # Stock detail page
│   │   ├── screener/
│   │   │   └── page.tsx       # Stock screener page
│   │   ├── layout.tsx         # Root layout with navigation
│   │   ├── page.tsx           # Home page
│   │   └── globals.css        # Global styles
│   ├── components/
│   │   ├── ui/                # Shadcn/UI components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── table.tsx
│   │   │   └── badge.tsx
│   │   └── StockChart.tsx     # Recharts chart component
│   └── lib/
│       ├── indicators.ts       # Technical indicators (RSI, EMA, MACD)
│       ├── yahoo.ts           # Yahoo Finance API wrapper with caching
│       ├── mistral.ts         # Mistral AI integration
│       ├── prisma.ts          # Prisma client singleton
│       └── utils.ts           # Utility functions
├── .env                       # Environment variables
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Mistral AI API key ([get one here](https://console.mistral.ai/))

### 1. Clone and Install

```bash
cd us-stock-screener
npm install
```

### 2. Environment Setup

Copy `.env` and configure:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/stock_screener?schema=public"
MISTRAL_API_KEY="your_mistral_api_key_here"
```

### 3. Database Setup

```bash
# Push schema to database
npx prisma db push

# (Optional) Generate migrations
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📊 API Documentation

### GET `/api/stocks/[ticker]`

Fetch stock data with calculated indicators.

**Query Parameters:**
- `period1` (optional): Start date (default: `2024-01-01`)
- `period2` (optional): End date (default: today)

**Response:**
```json
{
  "ticker": "AAPL",
  "quote": { ... },
  "summary": { ... },
  "history": [ ... ],
  "indicators": {
    "rsi": 65.42,
    "ema20": 175.30,
    "ema50": 170.15,
    "ema200": 160.80,
    "macd": {
      "macd": 1.234,
      "signal": 0.987,
      "histogram": 0.247
    }
  }
}
```

### POST `/api/recommendation`

Generate AI-powered stock recommendation with daily caching.

**Request Body:**
```json
{
  "ticker": "AAPL"
}
```

**Response:**
```json
{
  "ticker": "AAPL",
  "recommendation": "BUY",
  "confidence": 78,
  "technical_analysis": "...",
  "fundamental_analysis": "...",
  "sentiment_analysis": "...",
  "summary": "...",
  "cached": false
}
```

---

## 🧠 AI Caching Logic

Recommendations are cached daily per ticker:

1. Check database for existing recommendation:
   ```sql
   SELECT * FROM recommendations 
   WHERE ticker = $1 AND DATE(createdAt) = TODAY
   ```

2. **If exists:** Return cached result

3. **If not exists:**
   - Fetch Yahoo Finance data
   - Calculate technical indicators
   - Call Mistral AI API
   - Save to database
   - Return result

---

## 📈 Technical Indicators

### RSI (Relative Strength Index)
- Period: 14 days
- Range: 0-100
- Overbought: > 70
- Oversold: < 30

### EMA (Exponential Moving Average)
- EMA 20: Short-term trend
- EMA 50: Medium-term trend
- EMA 200: Long-term trend

### MACD (Moving Average Convergence Divergence)
- Fast EMA: 12 periods
- Slow EMA: 26 periods
- Signal Line: 9-period EMA of MACD
- Histogram: MACD - Signal

---

## ⚡ Performance Optimizations

- **Yahoo Finance Cache:** 15-minute TTL for API responses
- **AI Result Cache:** Daily cache in PostgreSQL
- **Parallel Requests:** Promise.all for concurrent API calls
- **In-memory Cache:** Map-based cache for Yahoo Finance data

---

## 🗄️ Database Schema

```prisma
model Recommendation {
  id             String   @id @default(uuid())
  ticker         String
  recommendation String
  confidence     Int
  technical      String
  fundamental    String
  sentiment      String
  summary        String
  createdAt      DateTime @default(now())

  @@index([ticker, createdAt])
}
```

---

## 🔌 Optional: Cron Job Setup

Create a daily cron job to pre-generate recommendations for top stocks:

```javascript
// app/api/cron/generate-recommendations/route.ts
// Run daily at market close (4:00 PM ET)

const TOP_TICKERS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', ...];

export async function GET() {
  for (const ticker of TOP_TICKERS) {
    await fetch('/api/recommendation', {
      method: 'POST',
      body: JSON.stringify({ ticker })
    });
  }
}
```

Set up with Vercel Cron or similar:
```json
// vercel.json
{
  "crons": [{
    "path": "/api/cron/generate-recommendations",
    "schedule": "0 16 * * 1-5"
  }]
}
```

---

## 📝 License

MIT License - feel free to use this project for personal or commercial purposes.

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

## ⚠️ Disclaimer

This application is for educational and informational purposes only. Not financial advice. Always consult with a qualified financial advisor before making investment decisions.
