"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, User, Menu, X } from "lucide-react"
import { SearchInput } from "@/components/ui/search-input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface HeaderProps {
  sticky?: boolean
}

export function Header({ sticky = true }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [searchValue, setSearchValue] = useState("")

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleSearchClear = () => {
    setSearchValue("")
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value)
  }

  return (
    <>
      {/* Skip to content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50"
      >
        Skip to main content
      </a>

      <header
        role="banner"
        className={cn(
          "sticky top-0 z-50 transition-all duration-300",
          isScrolled ? "shadow-lg backdrop-blur-xl" : "backdrop-blur-md",
          "bg-surface/80 border-b border-surface-border"
        )}
      >
        <div className="container mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo Section */}
            <div className="flex items-center gap-4">
              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden h-8 w-8 p-0"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>

              <div className="flex items-center">
                <h1 className="text-xl lg:text-2xl font-black italic uppercase tracking-wider text-foreground font-heading">
                  TRANSFER HUB V2
                </h1>
              </div>
            </div>

            {/* Live Status Indicator - Hidden on mobile */}
            <div className="hidden lg:flex items-center gap-2">
              <div className="relative">
                <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-accent">
                🟢 LIVE MARKET UPDATE
              </span>
            </div>

            {/* Search Bar - Desktop */}
            <div className="hidden lg:flex flex-1 max-w-md mx-8">
              <SearchInput
                placeholder="Search transfers, players, teams..."
                value={searchValue}
                onChange={handleSearchChange}
                onClear={handleSearchClear}
                className="bg-surface/60 border-surface-border"
              />
            </div>

            {/* Account Button */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:scale-105 transition-transform"
                aria-label="Account"
              >
                <User className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Mobile Search & Status */}
          <div className="lg:hidden py-3 border-t border-surface-border">
            {/* Mobile Live Status */}
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-accent">
                🟢 LIVE MARKET UPDATE
              </span>
            </div>

            {/* Mobile Search */}
            <SearchInput
              placeholder="Search transfers, players, teams..."
              value={searchValue}
              onChange={handleSearchChange}
              onClear={handleSearchClear}
              className="bg-surface/60 border-surface-border"
            />
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden py-4 border-t border-surface-border">
              <nav className="flex flex-col gap-4">
                <Link
                  href="/"
                  className="text-sm font-medium uppercase tracking-wider text-foreground hover:text-accent transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/transfers"
                  className="text-sm font-medium uppercase tracking-wider text-foreground hover:text-accent transition-colors"
                >
                  Transfers
                </Link>
                <Link
                  href="/analytics"
                  className="text-sm font-medium uppercase tracking-wider text-foreground hover:text-accent transition-colors"
                >
                  Analytics
                </Link>
                <Link
                  href="/about"
                  className="text-sm font-medium uppercase tracking-wider text-foreground hover:text-accent transition-colors"
                >
                  About
                </Link>
              </nav>
            </div>
          )}
        </div>
      </header>
    </>
  )
}
