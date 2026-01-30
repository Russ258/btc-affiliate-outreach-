import { google } from 'googleapis';
import { getAuthenticatedClient } from './auth';

// Fetches calendar events within a specified time range
export async function listEvents(
  timeMin: string,
  timeMax: string,
  maxResults: number = 50
) {
  try {
    const auth = await getAuthenticatedClient();
    const calendar = google.calendar({ version: 'v3', auth });

    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin,
      timeMax,
      maxResults,
      singleEvents: true,
      orderBy: 'startTime',
    });

    return response.data.items || [];
  } catch (error) {
    console.error('Error listing calendar events:', error);
    throw new Error('Failed to fetch calendar events');
  }
}

// Gets detailed information about a specific calendar event
export async function getEvent(eventId: string) {
  try {
    const auth = await getAuthenticatedClient();
    const calendar = google.calendar({ version: 'v3', auth });

    const response = await calendar.events.get({
      calendarId: 'primary',
      eventId,
    });

    return response.data;
  } catch (error) {
    console.error('Error getting calendar event:', error);
    throw new Error('Failed to fetch event details');
  }
}

// Gets upcoming events for the next N days
export async function getUpcomingEvents(days: number = 7) {
  const now = new Date();
  const future = new Date();
  future.setDate(future.getDate() + days);

  return listEvents(now.toISOString(), future.toISOString());
}

// Gets events for today
export async function getTodayEvents() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return listEvents(today.toISOString(), tomorrow.toISOString());
}

// Parses a calendar event to extract useful information
export function parseCalendarEvent(event: any) {
  const start = event.start?.dateTime || event.start?.date;
  const end = event.end?.dateTime || event.end?.date;

  // Extract attendee emails
  const attendees = (event.attendees || []).map((a: any) => ({
    email: a.email,
    displayName: a.displayName,
    responseStatus: a.responseStatus, // accepted, declined, tentative, needsAction
    organizer: a.organizer || false,
  }));

  // Extract attendee emails only
  const attendeeEmails = attendees.map((a: any) => a.email.toLowerCase());

  // Check if event is all-day
  const isAllDay = !event.start?.dateTime;

  return {
    id: event.id,
    summary: event.summary || '(No title)',
    description: event.description || '',
    location: event.location || '',
    start,
    end,
    isAllDay,
    attendees,
    attendeeEmails,
    organizer: event.organizer?.email || '',
    status: event.status, // confirmed, tentative, cancelled
    htmlLink: event.htmlLink,
    meetingUrl: extractMeetingUrl(event.description || ''),
    created: event.created,
    updated: event.updated,
  };
}

// Extracts meeting URL from event description
function extractMeetingUrl(description: string): string | null {
  // Common patterns for meeting links
  const patterns = [
    /https:\/\/meet\.google\.com\/[a-z-]+/i,
    /https:\/\/zoom\.us\/j\/\d+/i,
    /https:\/\/.*\.zoom\.us\/j\/\d+/i,
    /https:\/\/teams\.microsoft\.com\/l\/meetup-join/i,
  ];

  for (const pattern of patterns) {
    const match = description.match(pattern);
    if (match) {
      return match[0];
    }
  }

  return null;
}

// Checks if an event is happening soon (within next hour)
export function isEventSoon(event: any, minutesBefore: number = 60): boolean {
  const startTime = new Date(event.start?.dateTime || event.start?.date);
  const now = new Date();
  const diff = startTime.getTime() - now.getTime();
  const minutes = diff / (1000 * 60);

  return minutes > 0 && minutes <= minutesBefore;
}

// Checks if an event is currently happening
export function isEventNow(event: any): boolean {
  const startTime = new Date(event.start?.dateTime || event.start?.date);
  const endTime = new Date(event.end?.dateTime || event.end?.date);
  const now = new Date();

  return now >= startTime && now <= endTime;
}

// Gets a human-readable time until event
export function getTimeUntilEvent(event: any): string {
  const startTime = new Date(event.start?.dateTime || event.start?.date);
  const now = new Date();
  const diff = startTime.getTime() - now.getTime();

  if (diff < 0) {
    return 'Past';
  }

  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''}`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  } else {
    return 'Now';
  }
}
