"use client"

import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"
import { useEffect } from "react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error)
  }, [error])

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
          {/* Error Visual */}
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="p-4 rounded-full bg-destructive/20">
                <AlertTriangle className="h-12 w-12 text-destructive" />
              </div>
            </div>
            <h1 className="text-3xl font-bold uppercase tracking-wider text-foreground font-heading">
              System Error
            </h1>
          </div>

          {/* Error Description */}
          <div className="space-y-4">
            <p className="text-lg text-text-secondary">
              Something went wrong while loading the transfer data. 
              Our team has been notified and is working on a fix.
            </p>
            
            {process.env.NODE_ENV === "development" && (
              <div className="p-4 bg-surface/60 border border-surface-border rounded-lg">
                <p className="text-sm font-mono text-text-tertiary text-left">
                  {error.message}
                </p>
                {error.digest && (
                  <p className="text-xs text-text-tertiary mt-2">
                    Error ID: {error.digest}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              onClick={reset}
              className="bg-primary hover:bg-primary/80 flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
            
            <Button 
              variant="ghost" 
              className="hover:bg-white/10"
              onClick={() => window.location.href = "/"}
            >
              <div className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Back to Dashboard
              </div>
            </Button>
          </div>

          {/* Status Indicator */}
          <div className="flex items-center justify-center gap-2 pt-4">
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-accent">
              🟢 LIVE MARKET UPDATE
            </span>
          </div>

          {/* Additional Help */}
          <div className="text-sm text-text-tertiary space-y-2">
            <p>If the problem persists, you can:</p>
            <ul className="space-y-1">
              <li>• Check your internet connection</li>
              <li>• Clear your browser cache</li>
              <li>• Contact our support team</li>
            </ul>
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
