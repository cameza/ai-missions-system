/**
 * Dashboard Page - Transfer Hub
 * 
 * Server Component that implements the main dashboard page with:
 * - Parallel data fetching for optimal performance
 * - Server-side rendering for initial load
 * - Client component hydration for interactivity
 * 
 * Architecture: Server Component → DashboardClient (Client Component)
 * Data Flow: Server fetch → Client hydration → TanStack Query updates
 * 
 * References:
 * - Tech Spec §5.1: Component hierarchy and data flow
 * - PRD §6.2.1: Complete dashboard layout specification
 * - UI Spec §4: Responsive layout structure (65/35 split)
 */
import { DashboardClient } from '@/components/dashboard/DashboardClient';
import ErrorBoundary from '@/components/ErrorBoundary';
import { fetchTransfers, fetchSummary, fetchTopTransfers } from '@/lib/api/server-fetchers';

// Server Component for initial data fetch and SSR
export default async function DashboardPage() {
  // Parallel data fetching for performance (Tech Spec §8.1)
  let initialTransfers: any[] = [], initialSummary: any = null, initialTopTransfers: any[] = [];
  
  try {
    [initialTransfers, initialSummary, initialTopTransfers] = await Promise.all([
      fetchTransfers({ limit: 100 }),
      fetchSummary(),
      fetchTopTransfers({ limit: 5 }),
    ])
  } catch (error) {
    // Graceful error handling for server-side fetch failures
    console.error('Dashboard data fetch failed:', error)
    
    // Set empty initial data for client-side retry
    initialTransfers = [];
    initialSummary = null;
    initialTopTransfers = [];
  }
  
  return (
    <ErrorBoundary>
      <DashboardClient 
        initialTransfers={initialTransfers}
        initialSummary={initialSummary}
        initialTopTransfers={initialTopTransfers}
      />
    </ErrorBoundary>
  )
}
