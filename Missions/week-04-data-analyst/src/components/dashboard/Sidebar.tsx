"use client"

import { useState } from "react"
import { SidebarListItem } from "./SidebarListItem"
import { SidebarLoadingState, SidebarEmptyState, SidebarErrorState } from "./SidebarStates"
import { SidebarErrorBoundary } from "./SidebarErrorBoundary"
import { useTopTransfersQuery } from "@/hooks/useTopTransfers"
import type { TopTransfer } from "@/hooks/useTopTransfers"
import { useLatestDealsQuery } from "@/hooks/useLatestDeals"
import type { LatestDeal } from "@/hooks/useLatestDeals"
import { InsiderFeedTab } from "./InsiderFeedTab"
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip"

interface SidebarProps {
  className?: string
}

function TopTransfersContent() {
  const { data: transfers = [], isLoading, error, refetch } = useTopTransfersQuery();

  if (isLoading) return <SidebarLoadingState />;
  if (error) return <SidebarErrorState onRetry={() => refetch()} tabName="top transfers" />;
  if (transfers.length === 0) return <SidebarEmptyState />;

  return (
    <div role="list" className="divide-y divide-surface-border/60">
      {transfers.map((transfer) => (
        <SidebarListItem
          key={transfer.id}
          rank={transfer.rank}
          playerName={transfer.playerName}
          fromClub={transfer.fromClub}
          toClub={transfer.toClub}
          transferValue={transfer.transferValue}
          onClick={() => {/* TODO: MCS-100 integration */}}
        />
      ))}
    </div>
  );
}

function LatestDealsContent() {
  const { data: deals = [], isLoading, error, refetch } = useLatestDealsQuery();

  if (isLoading) return <SidebarLoadingState />;
  if (error) return <SidebarErrorState onRetry={() => refetch()} tabName="latest deals" />;
  if (deals.length === 0) return <SidebarEmptyState />;

  return (
    <div role="list" className="divide-y divide-surface-border/60">
      {deals.map((deal) => (
        <SidebarListItem
          key={deal.id}
          rank={deal.rank}
          playerName={deal.playerName}
          fromClub={deal.fromClub}
          toClub={deal.toClub}
          transferValue={deal.transferValue}
          onClick={() => {/* TODO: MCS-100 integration */}}
        />
      ))}
    </div>
  );
}

export function Sidebar({ className = "" }: SidebarProps) {
  const [activeTab, setActiveTab] = useState("TOP TRANSFERS")

  const tabs = [
    { id: "TOP TRANSFERS", label: "TOP TRANSFERS", active: true },
    { id: "LATEST DEALS", label: "LATEST DEALS", active: false, disabled: false },
    { id: "INSIDER FEED", label: "INSIDER FEED", active: false, disabled: false },
  ]

  return (
    <TooltipProvider>
      <div 
        className={`bg-surface border-l border-surface-border flex flex-col ${className}`}
        role="region"
        aria-label="Transfer sidebar"
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
                aria-selected={activeTab === tab.id}
                aria-disabled={tab.disabled}
                disabled={tab.disabled}
                onClick={() => !tab.disabled && setActiveTab(tab.id)}
                className={`
                  flex-1 px-3 py-3 text-xs font-bold uppercase tracking-wider transition-all duration-200
                  ${activeTab === tab.id
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
          {activeTab === "TOP TRANSFERS" && (
            <TopTransfersContent />
          )}
          {activeTab === "LATEST DEALS" && (
            <LatestDealsContent />
          )}
          {activeTab === "INSIDER FEED" && (
            <InsiderFeedTab />
          )}
        </SidebarErrorBoundary>
      </div>

    </div>
    </TooltipProvider>
  )
}
