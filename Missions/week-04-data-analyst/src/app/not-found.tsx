import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="bg-surface/80 border-b border-surface-border backdrop-blur-md">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-black italic uppercase tracking-wider text-foreground font-heading">
              TRANSFER HUB V2
            </h1>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-accent">
                🟢 LIVE MARKET UPDATE
              </span>
            </div>
          </div>
        </div>
      </header>
      
      <main className="flex-1 flex items-center justify-center px-6 py-24">
        <div className="mx-auto max-w-2xl text-center space-y-8">
          {/* 404 Visual */}
          <div className="space-y-4">
            <h1 className="text-8xl font-black text-primary font-heading">
              404
            </h1>
            <h2 className="text-2xl font-bold uppercase tracking-wider text-foreground font-heading">
              Transfer Not Found
            </h2>
          </div>

          {/* Error Description */}
          <div className="space-y-4">
            <p className="text-lg text-text-secondary">
              The transfer, player, or page you&apos;re looking for has either been 
              completed, moved, or never existed in our database.
            </p>
            <p className="text-sm text-text-tertiary">
              Check the URL for typos, or use the search bar to find what you need.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/"
              className="w-full sm:w-auto rounded-full bg-primary px-8 py-3 text-sm font-semibold uppercase tracking-widest text-primary-foreground transition hover:bg-primary/80 flex items-center justify-center gap-2"
            >
              Back to Dashboard
            </Link>
            
            <button className="w-full sm:w-auto rounded-full border border-surface-border px-8 py-3 text-sm font-semibold uppercase tracking-widest text-foreground transition hover:bg-white/10 flex items-center justify-center gap-2">
              Search Transfers
            </button>
          </div>

          {/* Helpful Links */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 border-t border-surface-border">
            <Link
              href="/transfers"
              className="text-sm text-text-secondary hover:text-accent transition-colors"
            >
              Live Transfers
            </Link>
            <Link
              href="/players"
              className="text-sm text-text-secondary hover:text-accent transition-colors"
            >
              Player Search
            </Link>
            <Link
              href="/teams"
              className="text-sm text-text-secondary hover:text-accent transition-colors"
            >
              Teams
            </Link>
            <Link
              href="/analytics"
              className="text-sm text-text-secondary hover:text-accent transition-colors"
            >
              Analytics
            </Link>
          </div>

          {/* Status Indicator */}
          <div className="flex items-center justify-center gap-2 pt-4">
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-accent">
              🟢 LIVE MARKET UPDATE
            </span>
          </div>
        </div>
      </main>
      
      <footer className="bg-surface border-t border-surface-border py-8">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-text-tertiary">
              Winter Window 2025 • Soft Launch Edition
            </p>
            <p className="text-xs text-text-tertiary">
              Coming February 2, 2025
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
