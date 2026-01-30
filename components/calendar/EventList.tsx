'use client';

import Link from 'next/link';

interface EventContact {
  id: string;
  name: string;
  email: string;
  company?: string;
}

interface CalendarEvent {
  id: string;
  google_event_id: string;
  summary: string;
  description?: string;
  start_time: string;
  end_time: string;
  related_contact_ids?: string[];
  contacts?: EventContact[];
}

interface EventListProps {
  events: CalendarEvent[];
}

export function EventList({ events }: EventListProps) {
  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-semibold text-gray-900">No upcoming events</h3>
        <p className="mt-1 text-sm text-gray-500">
          Your calendar events will appear here.
        </p>
      </div>
    );
  }

  const getTimeUntil = (startTime: string): string => {
    const start = new Date(startTime);
    const now = new Date();
    const diff = start.getTime() - now.getTime();

    if (diff < 0) {
      return 'Past';
    }

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `In ${days} day${days > 1 ? 's' : ''}`;
    } else if (hours > 0) {
      return `In ${hours} hour${hours > 1 ? 's' : ''}`;
    } else if (minutes > 0) {
      return `In ${minutes} minute${minutes > 1 ? 's' : ''}`;
    } else {
      return 'Now';
    }
  };

  const isToday = (date: string): boolean => {
    const eventDate = new Date(date);
    const today = new Date();
    return eventDate.toDateString() === today.toDateString();
  };

  const isSoon = (startTime: string): boolean => {
    const start = new Date(startTime);
    const now = new Date();
    const diff = start.getTime() - now.getTime();
    const hours = diff / (1000 * 60 * 60);
    return hours > 0 && hours <= 2;
  };

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <div
          key={event.id}
          className={`bg-white border rounded-lg p-4 hover:shadow-md transition-shadow ${
            isToday(event.start_time) ? 'border-orange-300 bg-orange-50' : 'border-gray-200'
          } ${isSoon(event.start_time) ? 'border-l-4 border-l-orange-500' : ''}`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex items-center space-x-2 mb-2">
                {isToday(event.start_time) && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                    Today
                  </span>
                )}
                {isSoon(event.start_time) && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                    Starting Soon
                  </span>
                )}
                {event.contacts && event.contacts.length > 0 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    {event.contacts.length} Contact{event.contacts.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>

              {/* Title */}
              <h3 className="text-base font-semibold text-gray-900 mb-1">
                {event.summary}
              </h3>

              {/* Time */}
              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                <div className="flex items-center">
                  <svg
                    className="h-4 w-4 mr-1 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {new Date(event.start_time).toLocaleString()}
                </div>
                <span className="text-orange-600 font-medium">
                  {getTimeUntil(event.start_time)}
                </span>
              </div>

              {/* Description */}
              {event.description && (
                <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                  {event.description}
                </p>
              )}

              {/* Linked Contacts */}
              {event.contacts && event.contacts.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs font-medium text-gray-500 mb-1">Attendees:</p>
                  <div className="flex flex-wrap gap-2">
                    {event.contacts.map((contact) => (
                      <Link
                        key={contact.id}
                        href={`/contacts/${contact.id}`}
                        className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-100 text-gray-700 hover:bg-gray-200"
                      >
                        {contact.name}
                        {contact.company && ` (${contact.company})`}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="ml-4 flex-shrink-0">
              <a
                href={`https://calendar.google.com/calendar/event?eid=${event.google_event_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800"
                title="View in Google Calendar"
              >
                📅 Open
              </a>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
