"use client"

import React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SidebarErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface SidebarErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error?: Error; reset: () => void }>
}

export class SidebarErrorBoundary extends React.Component<
  SidebarErrorBoundaryProps,
  SidebarErrorBoundaryState
> {
  constructor(props: SidebarErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): SidebarErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to monitoring service in production
    console.error('Sidebar Error Boundary caught an error:', error, errorInfo)
  }

  reset = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultSidebarErrorFallback
      return <FallbackComponent error={this.state.error} reset={this.reset} />
    }

    return this.props.children
  }
}

function DefaultSidebarErrorFallback({ error, reset }: { error?: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center p-6 text-center min-h-[200px]">
      <AlertTriangle className="h-8 w-8 text-destructive mb-3" />
      <h3 className="text-sm font-medium text-foreground mb-2">
        Sidebar Error
      </h3>
      <p className="text-xs text-text-secondary mb-4">
        {error?.message || 'Something went wrong loading the sidebar'}
      </p>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={reset}
        className="text-xs"
      >
        <RefreshCw className="h-3 w-3 mr-1" />
        Try Again
      </Button>
    </div>
  )
}
