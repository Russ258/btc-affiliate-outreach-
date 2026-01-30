'use client';

import { useState, useEffect } from 'react';
import { EventList } from '@/components/calendar/EventList';

export default function CalendarPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [days, setDays] = useState(7);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  useEffect(() => {
    fetchEvents();
  }, [days]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/calendar/events?days=${days}`);
      const data = await response.json();
      setEvents(data.events || []);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    setMessage(null);

    try {
      const response = await fetch('/api/calendar/events', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sync calendar');
      }

      setMessage({
        type: 'success',
        text: `Synced ${data.synced} events from Google Calendar (${data.total} total).`,
      });

      fetchEvents();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to sync calendar',
      });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="px-4 sm:px-0">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 disabled:opacity-50"
        >
          {syncing ? 'Syncing...' : '🔄 Sync Calendar'}
        </button>
      </div>

      {message && (
        <div
          className={`mb-6 p-4 rounded-md ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-sm">{message.text}</p>
            <button
              onClick={() => setMessage(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="bg-white shadow rounded-lg mb-6">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Show next:</label>
              <select
                value={days}
                onChange={(e) => setDays(parseInt(e.target.value))}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="1">1 day</option>
                <option value="3">3 days</option>
                <option value="7">7 days</option>
                <option value="14">14 days</option>
                <option value="30">30 days</option>
              </select>
            </div>
            <div className="text-sm text-gray-500">
              {events.length} event{events.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading events...</div>
          ) : (
            <EventList events={events} />
          )}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">
          How Calendar Integration Works
        </h3>
        <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
          <li>Events from your Google Calendar are synced automatically</li>
          <li>Events with known contact attendees are highlighted</li>
          <li>Click &quot;Sync Calendar&quot; to fetch the latest events</li>
          <li>Communication records are created for meetings with contacts</li>
          <li>Click &quot;Open&quot; to view the event in Google Calendar</li>
        </ul>
      </div>
    </div>
  );
}
