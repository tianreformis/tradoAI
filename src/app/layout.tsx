import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'US Stock Market Screener',
  description: 'AI-powered US stock screening and analysis tool with daily trade signals',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        <nav className="border-b bg-white dark:bg-gray-950">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <a href="/" className="text-xl font-bold font-mono text-blue-600">
              StockScreener
            </a>
            <div className="flex gap-6">
              <a href="/screener" className="hover:text-blue-600 transition-colors text-gray-700 dark:text-gray-300">
                Screener
              </a>
              <a href="/signals" className="hover:text-blue-600 transition-colors text-gray-700 dark:text-gray-300">
                🔥 Signals
              </a>
            </div>
          </div>
        </nav>
        {children}
        <footer className="border-t mt-auto bg-white dark:bg-gray-950">
          <div className="container mx-auto px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
            AI-based analysis, not financial advice. Always do your own research.
          </div>
        </footer>
      </body>
    </html>
  );
}
