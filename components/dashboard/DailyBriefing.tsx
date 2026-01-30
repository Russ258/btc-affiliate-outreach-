'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface BriefingData {
  followupsDue: number;
  unreadEmails: number;
  eventsToday: number;
  actionRequiredEmails: number;
}

export function DailyBriefing() {
  const [data, setData] = useState<BriefingData>({
    followupsDue: 0,
    unreadEmails: 0,
    eventsToday: 0,
    actionRequiredEmails: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBriefing();
  }, []);

  const fetchBriefing = async () => {
    try {
      const response = await fetch('/api/dashboard/stats');
      const result = await response.json();
      setData({
        followupsDue: result.stats.followupsDue || 0,
        unreadEmails: result.stats.unreadEmails || 0,
        eventsToday: result.stats.eventsToday || 0,
        actionRequiredEmails: result.stats.actionRequiredEmails || 0,
      });
    } catch (error) {
      console.error('Failed to fetch briefing:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalActionItems =
    data.followupsDue + data.actionRequiredEmails + data.eventsToday;

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Today&apos;s Briefing
        </h2>
        <div className="text-center text-sm text-gray-500 py-4">Loading...</div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Today&apos;s Briefing</h2>
        <span className="text-sm text-gray-600">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })}
        </span>
      </div>

      {totalActionItems === 0 ? (
        <div className="text-center py-6">
          <svg
            className="mx-auto h-12 w-12 text-green-500 mb-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-sm font-medium text-gray-900">All caught up!</p>
          <p className="text-xs text-gray-600">No action items for today.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.followupsDue > 0 && (
            <Link
              href="/contacts"
              className="flex items-center justify-between p-3 bg-white rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                  <span className="text-red-600 font-semibold">
                    {data.followupsDue}
                  </span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    Follow-ups Due
                  </p>
                  <p className="text-xs text-gray-500">
                    Contacts need your attention
                  </p>
                </div>
              </div>
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          )}

          {data.actionRequiredEmails > 0 && (
            <Link
              href="/emails"
              className="flex items-center justify-between p-3 bg-white rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <span className="text-orange-600 font-semibold">
                    {data.actionRequiredEmails}
                  </span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    Action Required Emails
                  </p>
                  <p className="text-xs text-gray-500">
                    Urgent messages to respond to
                  </p>
                </div>
              </div>
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          )}

          {data.eventsToday > 0 && (
            <Link
              href="/calendar"
              className="flex items-center justify-between p-3 bg-white rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">
                    {data.eventsToday}
                  </span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    Events Today
                  </p>
                  <p className="text-xs text-gray-500">
                    Meetings scheduled for today
                  </p>
                </div>
              </div>
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          )}

          {data.unreadEmails > 0 && (
            <Link
              href="/emails"
              className="flex items-center justify-between p-3 bg-white rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <span className="text-gray-600 font-semibold">
                    {data.unreadEmails}
                  </span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    Unread Emails
                  </p>
                  <p className="text-xs text-gray-500">
                    Flagged messages to review
                  </p>
                </div>
              </div>
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
