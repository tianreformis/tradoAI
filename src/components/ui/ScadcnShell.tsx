"use client";
import React from 'react';

type Props = { children: React.ReactNode };

// Lightweight AppShell with mobile-first header and responsive drawer.
const ScadcnShell: React.FC<Props> = ({ children }) => {
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  // Close drawer on content click (for small screens)
  const onContentClick = () => {
    if (drawerOpen) setDrawerOpen(false);
  };

  return (
    <div className="scadcn-shell" onClick={onContentClick}>
      <header className="scadcn-shell-header" aria-label="Main navigation">
        <div className="scadcn-shell-container">
          <button
            className="scadcn-shell-menu-btn"
            aria-label="Open navigation"
            onClick={() => setDrawerOpen((s) => !s)}
          >
            ≡
          </button>
          <div className="scadcn-shell-brand">
            <a href="/" className="scadcn-shell-brand-link" aria-label="Home">
              StockScreener
            </a>
          </div>
          <nav className="scadcn-shell-nav" aria-label="Top navigation">
            <a href="/screener" className="scadcn-shell-nav-link">Screener</a>
            <a href="/signals" className="scadcn-shell-nav-link">🔥 Signals</a>
          </nav>
        </div>
      </header>

      <aside className={`scadcn-shell-drawer ${drawerOpen ? 'open' : ''}`} aria-label="Navigation drawer">
        <div className="scadcn-shell-drawer-content">
          <a href="/screener" className="scadcn-shell-drawer-link" onClick={() => setDrawerOpen(false)}>
            Screener
          </a>
          <a href="/signals" className="scadcn-shell-drawer-link" onClick={() => setDrawerOpen(false)}>
            Signals
          </a>
        </div>
      </aside>

      <div
        className={`scadcn-shell-overlay ${drawerOpen ? 'visible' : ''}`}
        onClick={() => setDrawerOpen(false)}
        aria-hidden={!drawerOpen}
      />

      <nav className="scadcn-shell-bottomnav" aria-label="Mobile bottom navigation">
        <a href="/screener" className="scadcn-shell-bottomnav-item">🔎</a>
        <a href="/signals" className="scadcn-shell-bottomnav-item">🔥</a>
        <a href="/" className="scadcn-shell-bottomnav-item">🏠</a>
      </nav>

      <main className="scadcn-shell-content container">{children}</main>

      <style jsx global>{`
        /* Minimal responsive styling for the shell (Tailwind-like shims) */
        .scadcn-shell-header {
          border-bottom: 1px solid var(--color-border);
          background: var(--color-background);
        }
        .scadcn-shell-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .scadcn-shell-menu-btn {
          font-size: 1.25rem;
          background: transparent;
          border: none;
          padding: 0.5rem;
          cursor: pointer;
        }
        .scadcn-shell-brand-link {
          font-weight: 700;
          color: var(--color-primary);
          text-decoration: none;
          font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, "Courier New", monospace;
        }
        .scadcn-shell-nav {
          display: none;
          gap: 1rem;
        }
        .scadcn-shell-nav-link {
          color: var(--color-foreground);
          text-decoration: none;
          font-size: 0.95rem;
        }
        .scadcn-shell-drawer {
          position: fixed;
          top: 64px;
          left: 0;
          bottom: 0;
          width: 260px;
          background: var(--color-background);
          color: var(--color-foreground);
          transform: translateX(-100%);
          transition: transform 0.25s ease;
          z-index: 40;
        }
        .scadcn-shell-drawer.open {
          transform: translateX(0%);
        }
        .scadcn-shell-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.4);
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.25s ease, visibility 0.25s;
          z-index: 55;
        }
        .scadcn-shell-overlay.visible {
          opacity: 1;
          visibility: visible;
        }
        .scadcn-shell-bottomnav {
          display: none;
        }
        @media (max-width: 767px) {
          .scadcn-shell-bottomnav {
            display: flex;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 56px;
            background: var(--color-background);
            color: white;
            align-items: center;
            justify-content: space-around;
            z-index: 60;
          }
          .scadcn-shell-bottomnav-item {
            color: var(--color-foreground);
            text-decoration: none;
            font-size: 1.25rem;
          }
        }
        .scadcn-shell-drawer-content {
          display: flex;
          flex-direction: column;
          padding: 1rem;
          gap: 0.5rem;
        }
        .scadcn-shell-drawer-link {
          color: var(--color-foreground);
          text-decoration: none;
        }
        .scadcn-shell-content {
          padding: 1rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        /* Mobile-first: show top nav on larger screens */
        @media (min-width: 768px) {
          .scadcn-shell-menu-btn { display: none; }
          .scadcn-shell-nav { display: flex; }
          .scadcn-shell-drawer { display: none; }
          .scadcn-shell-header { position: sticky; top: 0; z-index: 50; }
        }
      `}</style>
    </div>
  );
};

export default ScadcnShell;
