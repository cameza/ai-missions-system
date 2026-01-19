"use client"

import { ReactNode } from "react"
import { Sidebar } from "./Sidebar"

interface DashboardLayoutProps {
  children: ReactNode
  showSidebar?: boolean
}

export function DashboardLayout({ children, showSidebar = true }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex flex-col lg:flex-row">
        {/* Main Content */}
        <div className={`flex-1 ${showSidebar ? 'lg:max-w-[65%]' : ''}`}>
          {children}
        </div>
        
        {/* Sidebar - Desktop: Right side, Mobile: Bottom */}
        {showSidebar && (
          <div className="lg:w-[35%] lg:max-w-md lg:sticky lg:top-0 lg:h-screen">
            <div className="lg:hidden order-2 border-t border-surface-border">
              <Sidebar className="h-96" />
            </div>
            <div className="hidden lg:block">
              <Sidebar className="h-screen" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
