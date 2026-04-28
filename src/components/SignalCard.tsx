'use client';

import { Badge } from '@/components/ui/badge';

interface SignalData {
  ticker: string;
  signal: string;
  entry: number | null;
  take_profit: number | null;
  stop_loss: number | null;
  risk_reward_ratio: number | null;
  confidence: number;
  reasoning?: {
    technical?: string;
    momentum?: string;
    risk_management?: string;
  };
  summary?: string;
  cached: boolean;
  error?: string;
}

export function SignalCard({ data, loading, onGenerate }: {
  data: SignalData | null;
  loading: boolean;
  onGenerate: () => void;
}) {
  return (
    <div className="border rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold font-mono">{data?.ticker || 'Signal'}</h2>
        {data && data.signal && data.signal !== 'ERROR' && (
          <Badge variant={
            data.signal === 'LONG' ? 'success' :
            data.signal === 'SHORT' ? 'destructive' : 'default'
          }>
            {data.signal}
          </Badge>
        )}
        {data?.signal === 'ERROR' && (
          <Badge variant="destructive">ERROR</Badge>
        )}
      </div>

      {loading ? (
        <div className="text-center py-4">Generating signal...</div>
      ) : data ? (
        <>
          {data.error ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 font-bold">Failed to generate signal</p>
              <p className="text-sm text-red-500 mt-1">{data.error}</p>
              <button
                onClick={onGenerate}
                className="mt-3 text-sm text-blue-600 hover:underline"
              >
                Try again
              </button>
            </div>
          ) : (
            <>
              {data.signal !== 'HOLD' && data.entry !== null ? (
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Entry</div>
                    <div className="text-xl font-bold">${data.entry?.toFixed(2)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground text-green-600">Take Profit</div>
                    <div className="text-xl font-bold text-green-600">${data.take_profit?.toFixed(2)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground text-red-600">Stop Loss</div>
                    <div className="text-xl font-bold text-red-600">${data.stop_loss?.toFixed(2)}</div>
                  </div>
                </div>
              ) : (
                <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="font-semibold text-yellow-800">HOLD Signal</p>
                  <p className="text-sm text-yellow-600 mt-1">No entry/exit points - wait for better setup</p>
                </div>
              )}

              <div className="flex gap-6">
                {data.signal !== 'HOLD' && data.risk_reward_ratio !== null && (
                  <div>
                    <span className="text-sm text-muted-foreground">Risk/Reward: </span>
                    <span className="font-semibold">1:{data.risk_reward_ratio?.toFixed(2)}</span>
                  </div>
                )}
                <div>
                  <span className="text-sm text-muted-foreground">Confidence: </span>
                  <span className="font-semibold">{data.confidence}%</span>
                </div>
                {data.cached && <span className="text-sm text-muted-foreground">(Cached today)</span>}
              </div>

              {data.summary && (
                <div className="pt-4 border-t">
                  <h3 className="font-semibold mb-2">Summary</h3>
                  <p className="text-sm text-muted-foreground">{data.summary}</p>
                </div>
              )}

              {data.reasoning && (
                <div className="space-y-2 pt-4 border-t">
                  {data.reasoning.technical && (
                    <div>
                      <h4 className="text-sm font-semibold">Technical</h4>
                      <p className="text-sm text-muted-foreground">{data.reasoning.technical}</p>
                    </div>
                  )}
                  {data.reasoning.risk_management && (
                    <div>
                      <h4 className="text-sm font-semibold">Risk Management</h4>
                      <p className="text-sm text-muted-foreground">{data.reasoning.risk_management}</p>
                    </div>
                  )}
                </div>
              )}

              <div className="text-xs text-muted-foreground pt-4 border-t">
                AI-based analysis, not financial advice. SL is mandatory for risk management.
              </div>
            </>
          )}
        </>
      ) : (
        <button
          onClick={onGenerate}
          className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Generate Daily Signal
        </button>
      )}
    </div>
  );
}
