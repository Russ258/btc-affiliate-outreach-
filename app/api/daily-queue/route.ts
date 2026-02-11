import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

/**
 * GET /api/daily-queue
 * Retrieves today's daily queue with full contact details
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    // @ts-ignore
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
    const state = searchParams.get('state') || 'pending';

    // Fetch queue with both contact and prospect details using JOIN
    const { data: queue, error } = await supabase
      .from('daily_queue')
      .select(`
        id,
        queue_date,
        state,
        added_at,
        updated_at,
        contact_id,
        prospect_id,
        contacts (
          id,
          name,
          email,
          twitter_handle,
          company,
          phone,
          website,
          status,
          priority,
          notes,
          tags,
          created_at,
          first_contact_date,
          next_followup_date,
          user_id
        ),
        prospects (
          id,
          name,
          email,
          twitter_handle,
          instagram_handle,
          youtube_channel,
          youtube_url,
          source,
          follower_count,
          bio,
          website,
          status,
          confidence,
          discovered_at
        )
      `)
      .eq('queue_date', date)
      .eq('state', state)
      .order('added_at', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Flatten the response to include contact OR prospect details at the top level
    const flattenedQueue = queue?.map(item => {
      const isProspect = item.prospect_id !== null;
      const data = isProspect ? item.prospects : item.contacts;

      return {
        queue_id: item.id,
        queue_date: item.queue_date,
        queue_state: item.state,
        queue_added_at: item.added_at,
        queue_updated_at: item.updated_at,
        is_prospect: isProspect,
        ...(data as any), // Spread contact or prospect fields
      };
    }) || [];

    // Get counts for all states
    const { count: pendingCount } = await supabase
      .from('daily_queue')
      .select('*', { count: 'exact', head: true })
      .eq('queue_date', date)
      .eq('state', 'pending');

    const { count: contactedCount } = await supabase
      .from('daily_queue')
      .select('*', { count: 'exact', head: true })
      .eq('queue_date', date)
      .eq('state', 'contacted');

    const { count: skippedCount } = await supabase
      .from('daily_queue')
      .select('*', { count: 'exact', head: true })
      .eq('queue_date', date)
      .eq('state', 'skipped');

    return NextResponse.json({
      queue: flattenedQueue,
      stats: {
        pending: pendingCount || 0,
        contacted: contactedCount || 0,
        skipped: skippedCount || 0,
        total: (pendingCount || 0) + (contactedCount || 0) + (skippedCount || 0),
      },
      date,
    });

  } catch (error) {
    console.error('Fetch daily queue error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch daily queue' },
      { status: 500 }
    );
  }
}
