"use client"

import { useState } from "react"
import { SidebarListItem } from "./SidebarListItem"
import { SidebarLoadingState, SidebarEmptyState, SidebarErrorState } from "./SidebarStates"
import { SidebarErrorBoundary } from "./SidebarErrorBoundary"
import { useTopTransfersQuery } from "@/hooks/useTopTransfers"
import type { TopTransfer } from "@/hooks/useTopTransfers"
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip"

interface SidebarProps {
  className?: string
}

export function Sidebar({ className = "" }: SidebarProps) {
  const [activeTab, setActiveTab] = useState("TOP TRANSFERS")
  
  const { 
    data: transfers = [], 
    isLoading, 
    error, 
    refetch 
  } = useTopTransfersQuery()

  const handleTransferClick = (transfer: TopTransfer) => {
    // TODO: Implement click-to-scroll integration with MCS-100
    // Future: Analytics tracking for sidebar interactions
    // trackEvent('sidebar_transfer_click', { 
    //   transferId: transfer.id,
    //   playerName: transfer.playerName,
    //   fromClub: transfer.fromClub,
    //   toClub: transfer.toClub
    // });
  }

  const tabs = [
    { id: "TOP TRANSFERS", label: "TOP TRANSFERS", active: true },
    { id: "LATEST DEALS", label: "LATEST DEALS", active: false, disabled: true },
    { id: "INSIDER FEED", label: "INSIDER FEED", active: false, disabled: true },
  ]

  return (
    <TooltipProvider>
      <div 
        className={`bg-surface border-l border-surface-border flex flex-col ${className}`}
        role="region"
        aria-label="Top Transfers"
      >
      {/* Tab Navigation */}
      <div className="border-b border-surface-border">
        <div className="flex" role="tablist">
          {tabs.map((tab) => (
            tab.disabled ? (
              <Tooltip key={tab.id}>
                <TooltipTrigger asChild>
                  <button
                    role="tab"
                    aria-selected={false}
                    aria-disabled={true}
                    onClick={(e) => e.preventDefault()}
                    className="flex-1 px-3 py-3 text-xs font-bold uppercase tracking-wider text-text-tertiary cursor-not-allowed"
                  >
                    {tab.label}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-gray-800 text-white text-xs px-3 py-2 rounded">
                  Coming in Full MVP (Summer 2025)
                </TooltipContent>
              </Tooltip>
            ) : (
              <button
                key={tab.id}
                role="tab"
                aria-selected={tab.active}
                aria-disabled={tab.disabled}
                disabled={tab.disabled}
                onClick={() => !tab.disabled && setActiveTab(tab.id)}
                className={`
                  flex-1 px-3 py-3 text-xs font-bold uppercase tracking-wider transition-all duration-200
                  ${tab.active 
                    ? 'text-primary border-b-2 border-primary' 
                    : tab.disabled
                      ? 'text-text-tertiary cursor-not-allowed'
                      : 'text-text-secondary hover:text-foreground hover:bg-surface-hover'
                  }
                `}
              >
                {tab.label}
              </button>
            )
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <SidebarErrorBoundary>
          {isLoading ? (
            <SidebarLoadingState />
          ) : error ? (
            <SidebarErrorState onRetry={() => refetch()} />
          ) : transfers.length === 0 ? (
            <SidebarEmptyState />
          ) : (
            <div role="list" className="divide-y divide-surface-border/60">
              {transfers.map((transfer, index) => (
                <SidebarListItem
                  key={transfer.id}
                  rank={transfer.rank}
                  playerName={transfer.playerName}
                  fromClub={transfer.fromClub}
                  toClub={transfer.toClub}
                  transferValue={transfer.transferValue}
                  onClick={() => handleTransferClick(transfer)}
                />
              ))}
            </div>
          )}
        </SidebarErrorBoundary>
      </div>

    </div>
    </TooltipProvider>
  )
}
