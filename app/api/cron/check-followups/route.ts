import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { validateCronRequest, unauthorizedResponse } from '@/lib/utils/cron-auth';

// GET /api/cron/check-followups - Checks for contacts needing follow-up, runs hourly
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  // Validate cron authorization
  if (!validateCronRequest(request)) {
    return unauthorizedResponse();
  }

  try {
    // Log job start
    await supabase.from('automation_logs').insert({
      job_name: 'check-followups',
      status: 'running',
      message: 'Checking for contacts needing follow-up',
    });

    const now = new Date();

    // Find contacts with follow-up dates in the past or today
    const { data: overdueContacts, error } = await supabase
      .from('contacts')
      .select('id, name, email, company, next_followup_date, status')
      .not('next_followup_date', 'is', null)
      .lte('next_followup_date', now.toISOString())
      .neq('status', 'declined'); // Don't remind for declined contacts

    if (error) {
      throw new Error(`Failed to fetch contacts: ${error.message}`);
    }

    const contactsFound = overdueContacts?.length || 0;
    let updated = 0;

    // For each overdue contact, we could:
    // 1. Send notification (future enhancement)
    // 2. Update status or flag for attention
    // 3. Create a communication record

    if (contactsFound > 0) {
      // Log which contacts need follow-up
      const contactList = overdueContacts
        .map((c: any) => `${c.name} (${c.email})`)
        .join(', ');

      // Store in settings for dashboard display
      await supabase.from('settings').upsert(
        {
          key: 'pending_followups',
          value: JSON.stringify({
            contacts: overdueContacts,
            checkedAt: now.toISOString(),
          }),
        },
        { onConflict: 'key' }
      );

      updated = contactsFound;
    }

    const executionTime = Date.now() - startTime;

    // Log success
    const message =
      contactsFound > 0
        ? `Found ${contactsFound} contacts needing follow-up`
        : 'No contacts need follow-up at this time';

    await supabase.from('automation_logs').insert({
      job_name: 'check-followups',
      status: 'success',
      message,
      execution_time_ms: executionTime,
    });

    return NextResponse.json({
      success: true,
      contactsFound,
      updated,
      executionTime,
      message,
    });
  } catch (error) {
    const executionTime = Date.now() - startTime;
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';

    // Log failure
    await supabase.from('automation_logs').insert({
      job_name: 'check-followups',
      status: 'failed',
      message: `Error: ${errorMessage}`,
      execution_time_ms: executionTime,
    });

    return NextResponse.json(
      {
        error: 'Failed to check follow-ups',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
