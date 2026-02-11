import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

/**
 * POST /api/daily-queue/generate
 * Generates a fresh daily queue of 150-200 uncontacted prospects
 */
export async function POST(request: NextRequest) {
  console.log('=== GENERATE QUEUE CALLED ===');
  try {
    const cookieStore = await cookies();
    console.log('Got cookie store');
    // @ts-ignore
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    console.log('Created supabase client');

    const { data: { session } } = await supabase.auth.getSession();
    console.log('Got session:', !!session);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const limit = body.limit || 150;
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    console.log('Checking queue for date:', today);

    // Step 1: Check if queue already exists for today
    const { data: existingQueue, error: checkError } = await supabase
      .from('daily_queue')
      .select('id')
      .eq('queue_date', today)
      .limit(1);

    console.log('Check error:', checkError);
    console.log('Existing queue:', existingQueue);

    if (checkError) {
      console.log('RETURNING ERROR:', checkError.message);
      return NextResponse.json({ error: checkError.message }, { status: 500 });
    }

    // If queue already exists, clear it first (regenerate)
    if (existingQueue && existingQueue.length > 0) {
      console.log('Deleting existing queue...');
      const { error: deleteError } = await supabase
        .from('daily_queue')
        .delete()
        .eq('queue_date', today);

      console.log('Delete error:', deleteError);
      if (deleteError) {
        console.log('RETURNING DELETE ERROR:', deleteError.message);
        return NextResponse.json({ error: deleteError.message }, { status: 500 });
      }
      console.log('Delete successful');
    }

    // Step 2: Get blocklist to exclude
    console.log('Fetching blocklist...');
    const { data: blocklist } = await supabase
      .from('blocklist')
      .select('name, email, twitter_handle, youtube_channel');

    const blocklistNames = new Set(blocklist?.map(b => b.name?.toLowerCase()) || []);
    const blocklistEmails = new Set(blocklist?.map(b => b.email?.toLowerCase()).filter(Boolean) || []);
    const blocklistTwitter = new Set(blocklist?.map(b => b.twitter_handle?.toLowerCase()).filter(Boolean) || []);
    const blocklistYoutube = new Set(blocklist?.map(b => b.youtube_channel?.toLowerCase()).filter(Boolean) || []);
    console.log('Blocklist size:', blocklistNames.size);

    // Step 3: Find fresh prospects (not yet contacted)
    // Priority: HIGH confidence, has email, newest discoveries
    console.log('Querying prospects...');
    const { data: allProspects, error: prospectsError } = await supabase
      .from('prospects')
      .select('id, name, email, twitter_handle, youtube_channel, instagram_handle, source, follower_count, confidence, discovered_at')
      .in('status', ['new', 'queued']) // Only fresh prospects
      .order('confidence', { ascending: false, nullsFirst: false })
      .order('discovered_at', { ascending: false })
      .limit(limit * 2); // Fetch extra to account for blocklist filtering

    // Filter out blocklisted prospects
    const prospects = allProspects?.filter(p => {
      if (blocklistNames.has(p.name?.toLowerCase())) return false;
      if (p.email && blocklistEmails.has(p.email.toLowerCase())) return false;
      if (p.twitter_handle && blocklistTwitter.has(p.twitter_handle.toLowerCase())) return false;
      if (p.youtube_channel && blocklistYoutube.has(p.youtube_channel.toLowerCase())) return false;
      return true;
    }).slice(0, limit);

    console.log('Prospects error:', prospectsError);
    console.log('Prospects found:', prospects?.length);
    if (prospectsError) {
      console.log('RETURNING PROSPECTS ERROR:', prospectsError.message);
      return NextResponse.json({ error: prospectsError.message }, { status: 500 });
    }

    if (!prospects || prospects.length === 0) {
      return NextResponse.json({
        ok: true,
        queue_date: today,
        pending: 0,
        message: 'No fresh prospects found. Run discovery scripts first: npm run discover'
      });
    }

    // Step 3: Prioritize prospects with email
    const prospectsWithEmail = prospects.filter(p => p.email);
    const prospectsWithoutEmail = prospects.filter(p => !p.email);
    const sortedProspects = [...prospectsWithEmail, ...prospectsWithoutEmail].slice(0, limit);

    // Step 4: Insert into daily queue (link to prospects, not contacts)
    // Deduplicate prospect IDs just in case
    const uniqueProspects = Array.from(new Map(sortedProspects.map(p => [p.id, p])).values());
    console.log('Sorted prospects:', sortedProspects.length, 'Unique:', uniqueProspects.length);

    const queueEntries = uniqueProspects.map(prospect => ({
      queue_date: today,
      prospect_id: prospect.id,
      state: 'pending',
    }));

    console.log('Inserting', queueEntries.length, 'queue entries...');

    // Insert queue entries
    const { error: insertError } = await supabase
      .from('daily_queue')
      .insert(queueEntries);

    console.log('Insert error:', insertError);
    if (insertError) {
      console.log('RETURNING INSERT ERROR:', insertError.message);
      console.log('Insert error code:', insertError.code);
      return NextResponse.json({ error: insertError.message, code: insertError.code }, { status: 500 });
    }
    console.log('Insert successful!');

    // Step 5: Get final counts
    const { count: pendingCount } = await supabase
      .from('daily_queue')
      .select('*', { count: 'exact', head: true })
      .eq('queue_date', today)
      .eq('state', 'pending');

    return NextResponse.json({
      ok: true,
      queue_date: today,
      pending: pendingCount || 0,
      added: sortedProspects.length,
      limit: limit,
    });

  } catch (error: any) {
    console.error('=== GENERATE ERROR ===');
    console.error('Full error:', error);
    console.error('Error message:', error?.message);
    console.error('Error stack:', error?.stack);
    return NextResponse.json(
      { error: error?.message || 'Failed to generate daily queue', details: error?.toString() },
      { status: 500 }
    );
  }
}
