import { NextRequest } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { resolveWindowContext } from '@/lib/utils/window-context';

export async function GET(req: NextRequest) {
  const supabase = getSupabaseAdminClient();
  
  if (!supabase) {
    return Response.json(
      { error: 'Database connection not available' },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type'); // 'leagues' | 'teams' | 'daily'

  const windowContext = await resolveWindowContext(supabase);

  try {
    if (type === 'leagues') {
      // Aggregate transfers by league_name using SQL grouping
      const { data, error } = await supabase
        .from('transfers')
        .select('league_name')
        .eq('window', windowContext)
        .not('league_name', 'is', null);

      if (error) throw error;

      // Count occurrences and return top 5
      const counts = data.reduce((acc: Record<string, number>, transfer) => {
        const league = transfer.league_name;
        if (league) {
          acc[league] = (acc[league] || 0) + 1;
        }
        return acc;
      }, {});

      const result = Object.entries(counts)
        .map(([league, transfers]) => ({ league, transfers }))
        .sort((a, b) => b.transfers - a.transfers)
        .slice(0, 5);

      return Response.json(result);
    }

    if (type === 'teams') {
      // Aggregate transfers by team_name (both from_team and to_team)
      try {
        const { data: fromData, error: fromError } = await supabase
          .from('transfers')
          .select('from_club_name')
          .eq('window', windowContext)
          .not('from_club_name', 'is', null);

        const { data: toData, error: toError } = await supabase
          .from('transfers')
          .select('to_club_name')
          .eq('window', windowContext)
          .not('to_club_name', 'is', null);

        if (fromError) {
          throw fromError;
        }
        if (toError) {
          throw toError;
        }

      // Count all team appearances
      const counts: Record<string, number> = {};
      
      fromData?.forEach(transfer => {
        const team = transfer.from_club_name;
        if (team && team !== 'Without Club') {
          counts[team] = (counts[team] || 0) + 1;
        }
      });
      
      toData?.forEach(transfer => {
        const team = transfer.to_club_name;
        if (team && team !== 'Without Club') {
          counts[team] = (counts[team] || 0) + 1;
        }
      });

      const result = Object.entries(counts)
        .map(([team, volume]) => ({ team, volume }))
        .sort((a, b) => b.volume - a.volume)
        .slice(0, 5);

      return Response.json(result);
      } catch (error) {
        throw error;
      }
    }

    if (type === 'daily') {
      // Aggregate transfers by date for the entire current transfer window
      // Winter window: Jan 1 - Feb 2, Summer window: Jun 1 - Sep 1
      const { data, error } = await supabase
        .from('transfers')
        .select('transfer_date')
        .eq('window', windowContext)
        .not('transfer_date', 'is', null)
        .order('transfer_date', { ascending: true });

      if (error) throw error;

      // Group transfers by date
      const counts: Record<string, number> = {};
      
      data?.forEach(transfer => {
        if (transfer.transfer_date) {
          // Parse as local date to avoid timezone shift
          const dateStr = transfer.transfer_date;
          const [year, month, day] = dateStr.split('-').map(Number);
          const localDate = new Date(year, month - 1, day);
          const displayStr = localDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          counts[displayStr] = (counts[displayStr] || 0) + 1;
        }
      });

      // Convert to array sorted by date
      const result = Object.entries(counts)
        .map(([date, activity]) => ({ date, activity }))
        .sort((a, b) => {
          // Parse dates for proper sorting
          const dateA = new Date(a.date + ', 2026');
          const dateB = new Date(b.date + ', 2026');
          return dateA.getTime() - dateB.getTime();
        });

      return Response.json(result);
    }

    return Response.json(
      { error: 'Invalid type parameter. Use: leagues, teams, or daily' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Analytics API error:', error);
    return Response.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}
