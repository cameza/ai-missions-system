import { NextRequest, NextResponse } from 'next/server'

// Mock data for development/build time when Supabase is not available
const mockTopTransfers = [
  {
    id: "mock-1",
    rank: 1,
    playerName: "Kylian Mbappé",
    fromClub: "Paris Saint-Germain",
    toClub: "Real Madrid",
    transferValue: "€180M",
    transferValueUsd: 180000000,
  },
  {
    id: "mock-2",
    rank: 2,
    playerName: "Jude Bellingham",
    fromClub: "Borussia Dortmund",
    toClub: "Real Madrid",
    transferValue: "€103M",
    transferValueUsd: 103000000,
  },
  {
    id: "mock-3",
    rank: 3,
    playerName: "Declan Rice",
    fromClub: "West Ham United",
    toClub: "Arsenal",
    transferValue: "€116M",
    transferValueUsd: 116000000,
  },
  {
    id: "mock-4",
    rank: 4,
    playerName: "Josko Gvardiol",
    fromClub: "RB Leipzig",
    toClub: "Manchester City",
    transferValue: "€90M",
    transferValueUsd: 90000000,
  },
  {
    id: "mock-5",
    rank: 5,
    playerName: "Rasmus Hojlund",
    fromClub: "Atalanta",
    toClub: "Manchester United",
    transferValue: "€73M",
    transferValueUsd: 73000000,
  },
]

export async function GET(request: NextRequest) {
  try {
    // Check if Supabase environment variables are available
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      // In development, log the issue. In production, this would go to monitoring
      if (process.env.NODE_ENV === 'development') {
        console.info('Supabase environment variables not found, using mock data')
      }
      return NextResponse.json(mockTopTransfers)
    }

    // Initialize Supabase client only when environment variables are available
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Fetch top 5 transfers by value, sorted by transferValueUsd descending
    const { data: transfers, error } = await supabase
      .from('transfers')
      .select(`
        id,
        playerFirstName,
        playerLastName,
        playerFullName,
        fromClubName,
        toClubName,
        transferValueUsd,
        transferValueDisplay,
        transferDate
      `)
      .not('transferValueUsd', 'is', null)
      .order('transferValueUsd', { ascending: false })
      .limit(5)

    if (error) {
      console.error('Database error:', error)
      // Fall back to mock data if database fails
      return NextResponse.json(mockTopTransfers)
    }

    if (!transfers || transfers.length === 0) {
      return NextResponse.json(mockTopTransfers)
    }

    // Transform data for frontend
    const topTransfers = transfers.map((transfer, index) => ({
      id: transfer.id,
      rank: index + 1,
      playerName: transfer.playerFullName || `${transfer.playerFirstName} ${transfer.playerLastName}`,
      fromClub: transfer.fromClubName,
      toClub: transfer.toClubName,
      transferValue: transfer.transferValueDisplay || 'FREE',
      transferValueUsd: transfer.transferValueUsd,
    }))

    return NextResponse.json(topTransfers)
  } catch (error) {
    console.error('API error:', error)
    // Always return mock data as fallback
    return NextResponse.json(mockTopTransfers)
  }
}
