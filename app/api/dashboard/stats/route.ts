import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

// GET /api/dashboard/stats - Get dashboard statistics
export async function GET() {
  try {
    // Total contacts
    const { count: totalContacts } = await supabase
      .from('contacts')
      .select('*', { count: 'exact', head: true });

    // Contacts by status
    const { data: contactsByStatus } = await supabase
      .from('contacts')
      .select('status');

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

    const { count: followupsDue } = await supabase
      .from('contacts')
      .select('*', { count: 'exact', head: true })
      .not('next_followup_date', 'is', null)
      .lte('next_followup_date', today.toISOString());

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

    const { count: newContactsThisWeek } = await supabase
      .from('contacts')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', lastWeek.toISOString());

    const { count: emailsThisWeek } = await supabase
      .from('flagged_emails')
      .select('*', { count: 'exact', head: true })
      .gte('received_at', lastWeek.toISOString());

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
