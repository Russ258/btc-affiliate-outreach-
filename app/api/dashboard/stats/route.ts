import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// GET /api/dashboard/stats - Get dashboard statistics
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    // @ts-ignore - Next.js 15 compatibility: cookies() returns Promise but Supabase expects sync access
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Check auth
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get userId from query params (optional - if not provided, show all team stats)
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    // Build base query with optional user filter
    let baseQuery = supabase.from('contacts');
    if (userId) {
      baseQuery = baseQuery.eq('user_id', userId);
    }

    // Total contacts
    const { count: totalContacts } = await baseQuery
      .select('*', { count: 'exact', head: true });

    // Contacts by status
    let statusQuery = supabase.from('contacts').select('status');
    if (userId) {
      statusQuery = statusQuery.eq('user_id', userId);
    }
    const { data: contactsByStatus } = await statusQuery;

    const statusCounts = {
      new: 0,
      contacted: 0,
      responded: 0,
      interested: 0,
      declined: 0,
    };

    contactsByStatus?.forEach((c) => {
      if (c.status in statusCounts) {
        statusCounts[c.status as keyof typeof statusCounts]++;
      }
    });

    // Active outreach (contacted but not responded/interested/declined)
    const activeOutreach = statusCounts.contacted;

    // Response rate (responded + interested / total contacted)
    const totalContacted = statusCounts.contacted + statusCounts.responded + statusCounts.interested + statusCounts.declined;
    const totalResponded = statusCounts.responded + statusCounts.interested;
    const responseRate = totalContacted > 0 ? Math.round((totalResponded / totalContacted) * 100) : 0;

    // Follow-ups due (next_followup_date is today or in the past)
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    let followupsQuery = supabase
      .from('contacts')
      .select('*', { count: 'exact', head: true })
      .not('next_followup_date', 'is', null)
      .lte('next_followup_date', today.toISOString());
    if (userId) {
      followupsQuery = followupsQuery.eq('user_id', userId);
    }
    const { count: followupsDue } = await followupsQuery;

    // Flagged emails (unread)
    const { count: unreadEmails } = await supabase
      .from('flagged_emails')
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false);

    // Action required emails
    const { count: actionRequiredEmails } = await supabase
      .from('flagged_emails')
      .select('*', { count: 'exact', head: true })
      .eq('action_required', true)
      .eq('is_read', false);

    // Upcoming events (today and next 7 days)
    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const { count: upcomingEvents } = await supabase
      .from('calendar_events')
      .select('*', { count: 'exact', head: true })
      .gte('start_time', now.toISOString())
      .lte('start_time', nextWeek.toISOString());

    // Events today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const { count: eventsToday } = await supabase
      .from('calendar_events')
      .select('*', { count: 'exact', head: true })
      .gte('start_time', todayStart.toISOString())
      .lte('start_time', todayEnd.toISOString());

    // Recent activity (last 7 days)
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);

    let newContactsQuery = supabase
      .from('contacts')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', lastWeek.toISOString());
    if (userId) {
      newContactsQuery = newContactsQuery.eq('user_id', userId);
    }
    const { count: newContactsThisWeek } = await newContactsQuery;

    const { count: emailsThisWeek } = await supabase
      .from('flagged_emails')
      .select('*', { count: 'exact', head: true })
      .gte('received_at', lastWeek.toISOString());

    // Total outreach (all contacts that have been contacted - all time)
    let totalOutreachQuery = supabase
      .from('contacts')
      .select('*', { count: 'exact', head: true })
      .not('last_contact_date', 'is', null);
    if (userId) {
      totalOutreachQuery = totalOutreachQuery.eq('user_id', userId);
    }
    const { count: totalOutreach } = await totalOutreachQuery;

    // Outreach today (for the corner ticker)
    let outreachTodayQuery = supabase
      .from('contacts')
      .select('*', { count: 'exact', head: true })
      .gte('last_contact_date', todayStart.toISOString())
      .lte('last_contact_date', todayEnd.toISOString());
    if (userId) {
      outreachTodayQuery = outreachTodayQuery.eq('user_id', userId);
    }
    const { count: outreachToday } = await outreachTodayQuery;

    return NextResponse.json({
      stats: {
        totalContacts: totalContacts || 0,
        activeOutreach: activeOutreach || 0,
        responseRate,
        followupsDue: followupsDue || 0,
        unreadEmails: unreadEmails || 0,
        actionRequiredEmails: actionRequiredEmails || 0,
        upcomingEvents: upcomingEvents || 0,
        eventsToday: eventsToday || 0,
        newContactsThisWeek: newContactsThisWeek || 0,
        emailsThisWeek: emailsThisWeek || 0,
        totalOutreach: totalOutreach || 0,
        outreachToday: outreachToday || 0,
        statusCounts,
      },
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}
