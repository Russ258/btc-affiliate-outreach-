'use client';

import { useState, useEffect } from 'react';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { DailyBriefing } from '@/components/dashboard/DailyBriefing';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { UpcomingEvents } from '@/components/dashboard/UpcomingEvents';

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats');
      const data = await response.json();
      setStats(data.stats);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 sm:px-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">
          Welcome back! Here&apos;s what&apos;s happening with your affiliate outreach.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatsCard
          title="Outreach Today"
          value={loading ? '...' : stats?.outreachToday || 0}
          icon={
            <svg
              className="h-6 w-6 text-orange-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          }
          subtitle="Contacts reached out to today"
          highlight={true}
        />

        <StatsCard
          title="Total Contacts"
          value={loading ? '...' : stats?.totalContacts || 0}
          icon={
            <svg
              className="h-6 w-6 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          }
          subtitle={
            stats?.newContactsThisWeek
              ? `+${stats.newContactsThisWeek} this week`
              : undefined
          }
        />

        <StatsCard
          title="Active Outreach"
          value={loading ? '...' : stats?.activeOutreach || 0}
          icon={
            <svg
              className="h-6 w-6 text-gray-400"
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
          }
          subtitle="Contacted, awaiting response"
        />

        <StatsCard
          title="Response Rate"
          value={loading ? '...' : `${stats?.responseRate || 0}%`}
          icon={
            <svg
              className="h-6 w-6 text-gray-400"
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
          }
          subtitle="Responded or interested"
        />

        <StatsCard
          title="Follow-ups Due"
          value={loading ? '...' : stats?.followupsDue || 0}
          icon={
            <svg
              className="h-6 w-6 text-gray-400"
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
          }
          subtitle="Need attention today"
        />
      </div>

      {/* Daily Briefing */}
      <div className="mb-8">
        <DailyBriefing />
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <QuickActions />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <UpcomingEvents />
        <RecentActivity />
      </div>

      {/* Getting Started (only show if no contacts) */}
      {!loading && stats?.totalContacts === 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Getting Started</h2>
          <div className="space-y-3 text-gray-600">
            <p>Welcome to the BTC Affiliate Outreach Management System!</p>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>
                Go to <strong>Settings</strong> to connect your Google account (if not done yet)
              </li>
              <li>Import contacts from Google Sheets using the &quot;Import Sheets&quot; quick action</li>
              <li>
                Start managing your affiliate outreach from the <strong>Contacts</strong> page
              </li>
              <li>Check flagged emails in the <strong>Emails</strong> page</li>
              <li>
                View upcoming meetings in the <strong>Calendar</strong> page
              </li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
