import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';

export const runtime = 'nodejs';

async function handleDebugQuery(req: NextRequest) {
  try {
    const supabase = getSupabaseAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    const today = new Date().toISOString().split('T')[0];
    
    // Test different query approaches
    const queries = [
      {
        name: 'Count only',
        result: await supabase
          .from('transfers')
          .select('*', { count: 'exact', head: true })
          .eq('transfer_date', today)
      },
      {
        name: 'Select all columns',
        result: await supabase
          .from('transfers')
          .select('*')
          .eq('transfer_date', today)
          .limit(5)
      },
      {
        name: 'Select specific columns',
        result: await supabase
          .from('transfers')
          .select('player_name, from_club_name, to_club_name, transfer_date')
          .eq('transfer_date', today)
          .limit(5)
      },
      {
        name: 'No date filter (just recent)',
        result: await supabase
          .from('transfers')
          .select('player_name, transfer_date')
          .order('transfer_date', { ascending: false })
          .limit(5)
      }
    ];

    const results = await Promise.all(
      queries.map(async (query) => {
        const { data, error, count } = await query.result;
        return {
          name: query.name,
          data: data || [],
          error: error?.message,
          count: count || 0,
          dataLength: data?.length || 0
        };
      })
    );

    return NextResponse.json({
      today,
      results
    });
  } catch (error) {
    console.error('Debug query error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const GET = handleDebugQuery;
