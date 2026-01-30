import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { validateCronRequest, unauthorizedResponse } from '@/lib/utils/cron-auth';

// GET /api/cron/daily-briefing - Generates daily briefing at 8 AM
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  // Validate cron authorization
  if (!validateCronRequest(request)) {
    return unauthorizedResponse();
  }

  try {
    // Log job start
    await supabase.from('automation_logs').insert({
      job_name: 'daily-briefing',
      status: 'running',
      message: 'Starting daily briefing generation',
    });

    // Calculate today's date boundaries
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Gather briefing data
    const briefingData: any = {
      date: today.toISOString(),
      generatedAt: new Date().toISOString(),
    };

    // 1. New contacts since yesterday
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const { data: newContacts } = await supabase
      .from('contacts')
      .select('id, name, email, company')
      .gte('created_at', yesterday.toISOString())
      .lt('created_at', today.toISOString());

    briefingData.newContacts = newContacts || [];

    // 2. Follow-ups due today
    const { data: followups } = await supabase
      .from('contacts')
      .select('id, name, email, company, next_followup_date')
      .not('next_followup_date', 'is', null)
      .gte('next_followup_date', today.toISOString())
      .lt('next_followup_date', tomorrow.toISOString());

    briefingData.followupsDue = followups || [];

    // 3. Recent flagged emails (last 24 hours)
    const { data: recentEmails } = await supabase
      .from('flagged_emails')
      .select('id, from_email, subject, snippet, received_at')
      .gte('received_at', yesterday.toISOString())
      .order('received_at', { ascending: false })
      .limit(10);

    briefingData.recentEmails = recentEmails || [];

    // 4. Upcoming events (next 7 days)
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const { data: upcomingEvents } = await supabase
      .from('calendar_events')
      .select('id, summary, start_time')
      .gte('start_time', today.toISOString())
      .lte('start_time', nextWeek.toISOString())
      .order('start_time', { ascending: true })
      .limit(5);

    briefingData.upcomingEvents = upcomingEvents || [];

    // 5. Events today
    const { data: eventsToday } = await supabase
      .from('calendar_events')
      .select('id, summary, start_time')
      .gte('start_time', today.toISOString())
      .lt('start_time', tomorrow.toISOString())
      .order('start_time', { ascending: true });

    briefingData.eventsToday = eventsToday || [];

    // Generate summary message
    const summary = [
      `Daily Briefing for ${today.toLocaleDateString()}`,
      `- ${briefingData.newContacts.length} new contacts added yesterday`,
      `- ${briefingData.followupsDue.length} follow-ups due today`,
      `- ${briefingData.recentEmails.length} new flagged emails`,
      `- ${briefingData.eventsToday.length} events scheduled for today`,
      `- ${briefingData.upcomingEvents.length} events in the next 7 days`,
    ].join('\n');

    // Store briefing in settings
    await supabase.from('settings').upsert(
      {
        key: 'last_daily_briefing',
        value: JSON.stringify(briefingData),
      },
      { onConflict: 'key' }
    );

    const executionTime = Date.now() - startTime;

    // Log success
    await supabase.from('automation_logs').insert({
      job_name: 'daily-briefing',
      status: 'success',
      message: summary,
      execution_time_ms: executionTime,
    });

    return NextResponse.json({
      success: true,
      briefing: briefingData,
      summary,
      executionTime,
    });
  } catch (error) {
    const executionTime = Date.now() - startTime;
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';

    // Log failure
    await supabase.from('automation_logs').insert({
      job_name: 'daily-briefing',
      status: 'failed',
      message: `Error: ${errorMessage}`,
      execution_time_ms: executionTime,
    });

    return NextResponse.json(
      {
        error: 'Failed to generate daily briefing',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
