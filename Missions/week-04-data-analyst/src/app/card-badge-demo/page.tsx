"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { SkeletonCard } from "@/components/ui/skeleton-card"
import { ErrorCard } from "@/components/ui/error-card"
import { Button } from "@/components/ui/button"

export default function CardBadgeDemo() {
  const [isLoading, setIsLoading] = useState(false)
  const [hasError, setHasError] = useState(false)

  const handleRetry = () => {
    setHasError(false)
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      // Simulate random success/error
      setHasError(Math.random() > 0.5)
    }, 2000)
  }

  const simulateLoading = () => {
    setIsLoading(true)
    setHasError(false)
    setTimeout(() => setIsLoading(false), 3000)
  }

  const simulateError = () => {
    setHasError(true)
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-8 py-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-primary">Card & Badge Components</h1>
            <p className="text-muted-foreground text-lg">
              Transfer Hub Design System - Glassmorphism UI Components
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-8 py-12 space-y-16">
        {/* Badge Status Variants */}
        <section aria-labelledby="badge-heading">
          <div className="space-y-6">
            <div>
              <h2 id="badge-heading" className="text-2xl font-semibold text-foreground mb-4">
                Badge Status Variants
              </h2>
              <p className="text-muted-foreground mb-6 max-w-3xl">
                Status badges for transfer states with proper color coding and accessibility. 
                Each badge uses semantic HTML and includes proper ARIA labels for screen readers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-semibold text-foreground">Done Status</h3>
                  <div className="space-y-2">
                    <Badge variant="done">Completed</Badge>
                    <p className="text-sm text-muted-foreground">
                      Emerald green for completed transfers
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-semibold text-foreground">Pending Status</h3>
                  <div className="space-y-2">
                    <Badge variant="pending">Pending</Badge>
                    <p className="text-sm text-muted-foreground">
                      Purple for in-progress transfers
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-semibold text-foreground">Rumor Status</h3>
                  <div className="space-y-2">
                    <Badge variant="rumor">Rumor</Badge>
                    <p className="text-sm text-muted-foreground">
                      Yellow for speculative transfers
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-semibold text-foreground">Outline Status</h3>
                  <div className="space-y-2">
                    <Badge variant="outline">Default</Badge>
                    <p className="text-sm text-muted-foreground">
                      White border for neutral states
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Card Variants */}
        <section aria-labelledby="card-variants-heading">
          <div className="space-y-6">
            <div>
              <h2 id="card-variants-heading" className="text-2xl font-semibold text-foreground mb-4">
                Card Variants
              </h2>
              <p className="text-muted-foreground mb-6 max-w-3xl">
                Different card styles with glassmorphism effects and interactive states. 
                Interactive cards include keyboard navigation and focus indicators for accessibility.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Standard Card</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Default card variant with standard styling and borders.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button size="sm">Action</Button>
                </CardFooter>
              </Card>

              <Card variant="interactive">
                <CardHeader>
                  <CardTitle>Interactive Card</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Hover over this card to see the interactive border effect. 
                    Tab to focus with keyboard navigation.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button size="sm">Interactive</Button>
                </CardFooter>
              </Card>

              <Card variant="glass">
                <CardHeader>
                  <CardTitle>Glass Card</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Glassmorphism effect with backdrop blur and transparency.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button size="sm">Glass Effect</Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>

        {/* KPI Card Examples */}
        <section aria-labelledby="kpi-heading">
          <div className="space-y-6">
            <div>
              <h2 id="kpi-heading" className="text-2xl font-semibold text-foreground mb-4">
                KPI Card Examples
              </h2>
              <p className="text-muted-foreground mb-6 max-w-3xl">
                Dashboard cards showing metrics with status badges. These follow the UI spec 
                for KPI card layouts with proper visual hierarchy and accessibility.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card variant="glass">
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">Total Transfers</h3>
                      <p className="text-sm text-muted-foreground">This season</p>
                    </div>
                    <Badge variant="done">Live</Badge>
                  </div>
                  <div className="space-y-2">
                    <p className="text-2xl font-bold text-primary">1,247</p>
                    <p className="text-sm text-muted-foreground">+12% from last season</p>
                  </div>
                </CardContent>
              </Card>

              <Card variant="glass">
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">Pending Deals</h3>
                      <p className="text-sm text-muted-foreground">In progress</p>
                    </div>
                    <Badge variant="pending">Active</Badge>
                  </div>
                  <div className="space-y-2">
                    <p className="text-2xl font-bold text-purple-400">23</p>
                    <p className="text-sm text-muted-foreground">5 high priority</p>
                  </div>
                </CardContent>
              </Card>

              <Card variant="glass">
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">Rumor Mill</h3>
                      <p className="text-sm text-muted-foreground">Speculative</p>
                    </div>
                    <Badge variant="rumor">Unconfirmed</Badge>
                  </div>
                  <div className="space-y-2">
                    <p className="text-2xl font-bold text-yellow-400">47</p>
                    <p className="text-sm text-muted-foreground">12 this week</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* State Management */}
        <section aria-labelledby="state-heading">
          <div className="space-y-6">
            <div>
              <h2 id="state-heading" className="text-2xl font-semibold text-foreground mb-4">
                State Management
              </h2>
              <p className="text-muted-foreground mb-6 max-w-3xl">
                Loading and error state cards with transitions and accessibility announcements. 
                These provide proper feedback during data fetching and error recovery.
              </p>
            </div>

            <div className="flex flex-wrap gap-4 mb-6">
              <Button onClick={simulateLoading} variant="secondary">
                Show Loading
              </Button>
              <Button onClick={simulateError} variant="secondary">
                Show Error
              </Button>
              <Button onClick={() => { setIsLoading(false); setHasError(false) }} variant="ghost">
                Reset States
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {isLoading && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground">Loading State</h3>
                  <SkeletonCard height="kpi" />
                </div>
              )}

              {hasError && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground">Error State</h3>
                  <ErrorCard 
                    onRetry={handleRetry}
                    title="Failed to Load Transfer Data"
                    description="Unable to fetch the latest transfer information. Please check your connection and try again."
                  />
                </div>
              )}

              {!isLoading && !hasError && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground">Normal State</h3>
                  <Card variant="glass">
                    <CardContent className="p-5">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">Sample Data</h3>
                          <p className="text-sm text-muted-foreground">Loaded successfully</p>
                        </div>
                        <Badge variant="done">Ready</Badge>
                      </div>
                      <div className="space-y-2">
                        <p className="text-2xl font-bold text-primary">847</p>
                        <p className="text-sm text-muted-foreground">All systems operational</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Padding Variants */}
        <section aria-labelledby="padding-heading">
          <div className="space-y-6">
            <div>
              <h2 id="padding-heading" className="text-2xl font-semibold text-foreground mb-4">
                Padding Variants
              </h2>
              <p className="text-muted-foreground mb-6 max-w-3xl">
                Different padding options for flexible layouts. Each variant provides appropriate 
                spacing for different content densities and use cases.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card padding="none">
                <CardContent className="space-y-2">
                  <h3 className="font-semibold text-foreground">No Padding</h3>
                  <p className="text-sm text-muted-foreground">p-0 - No padding</p>
                </CardContent>
              </Card>

              <Card padding="sm">
                <CardContent>
                  <h3 className="font-semibold text-foreground">Small Padding</h3>
                  <p className="text-sm text-muted-foreground">p-3 - 12px padding</p>
                </CardContent>
              </Card>

              <Card padding="default">
                <CardContent>
                  <h3 className="font-semibold text-foreground">Default Padding</h3>
                  <p className="text-sm text-muted-foreground">p-5 - 20px padding</p>
                </CardContent>
              </Card>

              <Card padding="lg">
                <CardContent>
                  <h3 className="font-semibold text-foreground">Large Padding</h3>
                  <p className="text-sm text-muted-foreground">p-6 - 24px padding</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
