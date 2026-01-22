"use client"

import { ExternalLink, Rss } from 'lucide-react';
import { useEffect } from 'react';

export function InsiderFeedTab() {
  useEffect(() => {
    // Load Elfsight platform script if not already loaded
    if (!document.querySelector('script[src="https://elfsightcdn.com/platform.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://elfsightcdn.com/platform.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-surface-border">
        <div className="flex items-center gap-2 mb-2">
          <Rss className="w-4 h-4 text-primary" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
            MARKET INSIDER
          </h3>
        </div>
        <p className="text-xs text-text-secondary">
          @FabrizioRomano
        </p>
      </div>

      {/* Elfsight Twitter Feed */}
      <div className="flex-1 overflow-y-auto">
        <div 
          className="elfsight-app-e2bb7604-3f52-4aa4-8d8f-4567b2112f84" 
          data-elfsight-app-lazy
        />
      </div>

      {/* Footer Link */}
      <div className="p-4 border-t border-surface-border">
        <a
          href="https://x.com/FabrizioRomano"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 text-xs text-primary hover:text-primary/80 transition-colors"
        >
          <span>View more on Twitter/X</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}
