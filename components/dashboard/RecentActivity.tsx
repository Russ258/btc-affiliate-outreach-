'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Activity {
  id: string;
  type: 'contact' | 'email' | 'event';
  title: string;
  subtitle: string;
  timestamp: string;
  link: string;
}

export function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivity();
  }, []);

  const fetchActivity = async () => {
    try {
      // Fetch recent contacts
      const contactsRes = await fetch('/api/contacts');
      const contactsData = await contactsRes.json();
      const recentContacts = (contactsData.contacts || [])
        .slice(0, 3)
        .map((c: any) => ({
          id: c.id,
          type: 'contact' as const,
          title: `New contact: ${c.name}`,
          subtitle: c.company || c.email,
          timestamp: c.created_at,
          link: `/contacts/${c.id}`,
        }));

      // Fetch recent emails
      const emailsRes = await fetch('/api/emails');
      const emailsData = await emailsRes.json();
      const recentEmails = (emailsData.emails || [])
        .slice(0, 3)
        .map((e: any) => ({
          id: e.id,
          type: 'email' as const,
          title: e.subject || '(No subject)',
          subtitle: `From: ${e.from_email}`,
          timestamp: e.received_at,
          link: '/emails',
        }));

      // Fetch recent events
      const eventsRes = await fetch('/api/calendar/events?days=30');
      const eventsData = await eventsRes.json();
      const recentEvents = (eventsData.events || [])
        .slice(0, 3)
        .map((e: any) => ({
          id: e.id,
          type: 'event' as const,
          title: e.summary,
          subtitle: new Date(e.start_time).toLocaleDateString(),
          timestamp: e.created_at || e.start_time,
          link: '/calendar',
        }));

      // Combine and sort by timestamp
      const allActivities = [...recentContacts, ...recentEmails, ...recentEvents]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 8);

      setActivities(allActivities);
    } catch (error) {
      console.error('Failed to fetch activity:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'contact':
        return (
          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
            <svg
              className="h-5 w-5 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
        );
      case 'email':
        return (
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
            <svg
              className="h-5 w-5 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
        );
      case 'event':
        return (
          <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
            <svg
              className="h-5 w-5 text-purple-600"
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
          </div>
        );
      default:
        return null;
    }
  };

  const getRelativeTime = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = now.getTime() - time.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="text-center text-sm text-gray-500 py-4">Loading...</div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>

      {activities.length === 0 ? (
        <div className="text-center text-sm text-gray-500 py-4">
          No recent activity
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => (
            <Link
              key={`${activity.type}-${activity.id}`}
              href={activity.link}
              className="flex items-start space-x-3 hover:bg-gray-50 p-2 rounded-lg transition-colors"
            >
              {getIcon(activity.type)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {activity.title}
                </p>
                <p className="text-xs text-gray-500 truncate">{activity.subtitle}</p>
              </div>
              <span className="text-xs text-gray-400 flex-shrink-0">
                {getRelativeTime(activity.timestamp)}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
