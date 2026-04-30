import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import ScadcnShell from '../components/ui/ScadcnShell';

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
        <ScadcnShell>
          {children}
        </ScadcnShell>
      </body>
    </html>
  );
}
