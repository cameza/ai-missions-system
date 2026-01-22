import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';

export const runtime = 'nodejs';

async function handleDebugTransfers(req: NextRequest) {
  try {
    const supabase = getSupabaseAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    console.log('Debug info:', { today, yesterday, now: new Date().toISOString() });

    // Get today's transfers with details
    const { data: todayTransfers, error: todayError } = await supabase
      .from('transfers')
      .select('player_full_name, from_club_name, to_club_name, transfer_date, window')
      .eq('transfer_date', today)
      .limit(10);

    // Get yesterday's transfers with details
    const { data: yesterdayTransfers, error: yesterdayError } = await supabase
      .from('transfers')
      .select('player_full_name, from_club_name, to_club_name, transfer_date, window')
      .eq('transfer_date', yesterday)
      .limit(10);

    // Get recent transfers by date
    const { data: recentTransfers, error: recentError } = await supabase
      .from('transfers')
      .select('player_full_name, transfer_date, window')
      .order('transfer_date', { ascending: false })
      .limit(20);

    // Get count by date
    const { data: dateCounts, error: countError } = await supabase
      .from('transfers')
      .select('transfer_date', { count: 'exact' })
      .gte('transfer_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

    const uniqueDates = [...new Set(dateCounts?.map(t => t.transfer_date))].sort();
    const countsByDate = await Promise.all(
      uniqueDates.map(async (date) => {
        const { count } = await supabase
          .from('transfers')
          .select('*', { count: 'exact', head: true })
          .eq('transfer_date', date);
        return { date, count: count || 0 };
      })
    );

    return NextResponse.json({
      debug: {
        today,
        yesterday,
        now: new Date().toISOString(),
        timezone: new Date().getTimezoneOffset(),
        todayCount: todayTransfers?.length || 0,
        yesterdayCount: yesterdayTransfers?.length || 0,
      },
      todayTransfers: todayTransfers || [],
      yesterdayTransfers: yesterdayTransfers || [],
      recentTransfers: recentTransfers || [],
      countsByDate,
    });
  } catch (error) {
    console.error('Debug API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const GET = handleDebugTransfers;
