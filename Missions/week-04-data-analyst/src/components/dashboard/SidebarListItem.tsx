"use client"

import { ArrowRight } from "lucide-react"

interface SidebarListItemProps {
  rank: number // 1-5
  playerName: string
  fromClub: string
  toClub: string
  transferValue: string // Pre-formatted (e.g., "€180M")
  onClick?: () => void
}

export function SidebarListItem({
  rank,
  playerName,
  fromClub,
  toClub,
  transferValue,
  onClick,
}: SidebarListItemProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onClick?.()
    }
  }

  return (
    <div
      role="listitem"
      className="group flex items-center gap-4 px-4 py-3 border-b border-surface-border/60 transition-all duration-200 hover:bg-surface-hover cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent focus:ring-inset"
      onClick={onClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      aria-label={`Rank ${rank}: ${playerName} from ${fromClub} to ${toClub} for ${transferValue}`}
    >
      {/* Rank Number */}
      <div className="text-primary/50 text-2xl font-black italic min-w-[var(--spacing-rank-width)] group-hover:scale-105 transition-transform duration-200">
        {String(rank).padStart(2, '0')}
      </div>

      {/* Transfer Details */}
      <div className="flex-1 min-w-0">
        {/* Player Name */}
        <div className="text-foreground text-sm font-bold truncate">
          {playerName}
        </div>
        
        {/* Transfer Route */}
        <div className="text-text-secondary text-xs flex items-center gap-1">
          <span className="truncate">{fromClub}</span>
          <ArrowRight className="h-3 w-3 flex-shrink-0" />
          <span className="truncate">{toClub}</span>
        </div>
      </div>

      {/* Transfer Value */}
      <div className="text-foreground text-sm font-bold ml-auto flex-shrink-0">
        {transferValue}
      </div>
    </div>
  )
}
