import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { getUpcomingEvents, parseCalendarEvent } from '@/lib/google/calendar';
import { linkEventToContacts, isAffiliateRelated } from '@/lib/utils/event-linking';
import { Contact } from '@/types';

// POST /api/calendar/events - Sync calendar events from Google Calendar
export async function POST() {
  try {
    // Fetch all contacts for linking
    const { data: contacts, error: contactsError } = await supabase
      .from('contacts')
      .select('*');

    if (contactsError) {
      return NextResponse.json(
        { error: 'Failed to fetch contacts' },
        { status: 500 }
      );
    }

    // Get upcoming events from Google Calendar (next 30 days)
    const events = await getUpcomingEvents(30);

    let syncedCount = 0;
    const syncedEvents = [];

    for (const rawEvent of events) {
      const event = parseCalendarEvent(rawEvent);

      // Check if already synced
      const { data: existing } = await supabase
        .from('calendar_events')
        .select('id')
        .eq('google_event_id', event.id)
        .single();

      // Link to contacts
      const { contactIds } = linkEventToContacts(
        event.attendeeEmails,
        contacts as Contact[]
      );

      if (existing) {
        // Update existing event
        const { error: updateError } = await supabase
          .from('calendar_events')
          .update({
            summary: event.summary,
            description: event.description,
            start_time: event.start,
            end_time: event.end,
            related_contact_ids: contactIds,
          })
          .eq('google_event_id', event.id);

        if (!updateError) {
          syncedCount++;
        }
      } else {
        // Insert new event
        const { data: inserted, error: insertError } = await supabase
          .from('calendar_events')
          .insert({
            google_event_id: event.id,
            summary: event.summary,
            description: event.description,
            start_time: event.start,
            end_time: event.end,
            related_contact_ids: contactIds,
          })
          .select()
          .single();

        if (!insertError && inserted) {
          syncedCount++;
          syncedEvents.push({
            ...event,
            relatedContactCount: contactIds.length,
          });

          // Create communication records for linked contacts
          for (const contactId of contactIds) {
            await supabase.from('communications').insert({
              contact_id: contactId,
              type: 'meeting',
              calendar_event_id: event.id,
              subject: event.summary,
              body: event.description,
              scheduled_for: event.start,
            });
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      synced: syncedCount,
      total: events.length,
      events: syncedEvents,
    });
  } catch (error) {
    console.error('Calendar sync error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to sync calendar events',
      },
      { status: 500 }
    );
  }
}

// GET /api/calendar/events - List synced calendar events
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get('days') || '7');

    const now = new Date();
    const future = new Date();
    future.setDate(future.getDate() + days);

    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .gte('start_time', now.toISOString())
      .lte('start_time', future.toISOString())
      .order('start_time', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Fetch contact details for events with related contacts
    const eventsWithContacts = await Promise.all(
      (data || []).map(async (event) => {
        if (event.related_contact_ids && event.related_contact_ids.length > 0) {
          const { data: contacts } = await supabase
            .from('contacts')
            .select('id, name, email, company')
            .in('id', event.related_contact_ids);

          return {
            ...event,
            contacts: contacts || [],
          };
        }
        return {
          ...event,
          contacts: [],
        };
      })
    );

    return NextResponse.json({ events: eventsWithContacts });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch calendar events' },
      { status: 500 }
    );
  }
}
