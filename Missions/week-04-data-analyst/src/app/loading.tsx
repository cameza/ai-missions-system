import { SkeletonCard } from "@/components/ui/skeleton-card"

export default function Loading() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="bg-surface/80 border-b border-surface-border backdrop-blur-md">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="h-6 w-32 bg-surface/60 rounded animate-pulse" />
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
              <div className="h-3 w-24 bg-surface/60 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </header>
      
      <main className="flex-1 flex items-center justify-center px-6 py-24">
        <div className="mx-auto max-w-5xl w-full">
          <div className="space-y-12">
            {/* Hero Section Skeleton */}
            <div className="space-y-6">
              <div className="h-4 w-32 bg-surface/60 rounded animate-pulse" />
              <div className="space-y-2">
                <div className="h-12 w-3/4 bg-surface/60 rounded animate-pulse" />
                <div className="h-12 w-1/2 bg-surface/60 rounded animate-pulse" />
              </div>
              <div className="space-y-2">
                <div className="h-6 w-full bg-surface/60 rounded animate-pulse" />
                <div className="h-6 w-2/3 bg-surface/60 rounded animate-pulse" />
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="h-12 w-40 bg-surface/60 rounded-full animate-pulse" />
                <div className="h-4 w-24 bg-surface/60 rounded animate-pulse" />
              </div>
            </div>

            {/* Stats Cards Skeleton */}
            <div className="grid gap-4 rounded-2xl border border-border/60 bg-card/40 p-6 backdrop-blur-md sm:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <SkeletonCard key={i} className="space-y-2">
                  <div className="h-4 w-24 bg-surface/60 rounded animate-pulse" />
                  <div className="h-8 w-16 bg-surface/60 rounded animate-pulse" />
                </SkeletonCard>
              ))}
            </div>

            {/* Additional Content Skeleton */}
            <div className="space-y-8">
              <div className="h-8 w-48 bg-surface/60 rounded animate-pulse" />
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <SkeletonCard key={i}>
                    <div className="space-y-4">
                      <div className="h-4 w-3/4 bg-surface/60 rounded animate-pulse" />
                      <div className="h-20 w-full bg-surface/60 rounded animate-pulse" />
                      <div className="h-6 w-1/2 bg-surface/60 rounded animate-pulse" />
                    </div>
                  </SkeletonCard>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="bg-surface border-t border-surface-border py-8">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="h-3 w-32 bg-surface/60 rounded animate-pulse" />
            <div className="h-3 w-24 bg-surface/60 rounded animate-pulse" />
          </div>
        </div>
      </footer>
    </div>
  )
}
