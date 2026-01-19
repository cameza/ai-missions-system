import { Github, Twitter, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Footer() {
  return (
    <footer className="bg-surface border-t border-surface-border mt-auto">
      <div className="container mx-auto px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold uppercase tracking-wider text-foreground font-heading">
              Transfer Hub V2
            </h3>
            <p className="text-sm text-text-secondary max-w-xs">
              Pure transfer intel. Zero noise. Real-time football transfer analytics dashboard.
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-accent">
                🟢 LIVE MARKET UPDATE
              </span>
            </div>
          </div>

          {/* Links Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-foreground font-heading">
              Links
            </h4>
            <nav className="flex flex-col gap-2">
              <a
                href="#about"
                className="text-sm text-text-secondary hover:text-accent transition-colors"
              >
                About
              </a>
              <a
                href="#privacy"
                className="text-sm text-text-secondary hover:text-accent transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="#terms"
                className="text-sm text-text-secondary hover:text-accent transition-colors"
              >
                Terms of Service
              </a>
              <a
                href="#contact"
                className="text-sm text-text-secondary hover:text-accent transition-colors"
              >
                Contact
              </a>
            </nav>
          </div>

          {/* Social & Credits Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-foreground font-heading">
              Connect
            </h4>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:text-accent transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:text-accent transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:text-accent transition-colors"
                aria-label="API Documentation"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-xs text-text-tertiary space-y-1">
              <p>Built with Next.js • React • TypeScript</p>
              <p>Data by API-Football</p>
              <p className="flex items-center gap-1">
                © 2025 Transfer Hub V2
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-surface-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-text-tertiary">
              Winter Window 2025 • Soft Launch Edition
            </p>
            <p className="text-xs text-text-tertiary">
              Coming February 2, 2025
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
