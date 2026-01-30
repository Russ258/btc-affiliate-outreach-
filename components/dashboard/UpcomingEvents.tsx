'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface EventContact {
  id: string;
  name: string;
}

interface Event {
  id: string;
  summary: string;
  start_time: string;
  contacts?: EventContact[];
}

export function UpcomingEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/calendar/events?days=7');
      const data = await response.json();
      setEvents((data.events || []).slice(0, 5)); // Show max 5 events
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

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
      return `${days}d`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${minutes}m`;
    }
  };

  const isToday = (date: string): boolean => {
    const eventDate = new Date(date);
    const today = new Date();
    return eventDate.toDateString() === today.toDateString();
  };

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Events</h2>
        <div className="text-center text-sm text-gray-500 py-4">Loading...</div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Upcoming Events</h2>
        <Link href="/calendar" className="text-sm text-orange-600 hover:text-orange-800">
          View all →
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="text-center text-sm text-gray-500 py-4">
          No upcoming events in the next 7 days.
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <div
              key={event.id}
              className={`border-l-4 pl-3 py-2 ${
                isToday(event.start_time) ? 'border-orange-500' : 'border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {event.summary}
                  </p>
                  <div className="flex items-center mt-1 space-x-2 text-xs text-gray-500">
                    <span>{new Date(event.start_time).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{new Date(event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  {event.contacts && event.contacts.length > 0 && (
                    <p className="text-xs text-gray-600 mt-1">
                      with {event.contacts.map(c => c.name).join(', ')}
                    </p>
                  )}
                </div>
                <span
                  className={`ml-2 flex-shrink-0 text-xs font-medium ${
                    isToday(event.start_time) ? 'text-orange-600' : 'text-gray-500'
                  }`}
                >
                  {getTimeUntil(event.start_time)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
