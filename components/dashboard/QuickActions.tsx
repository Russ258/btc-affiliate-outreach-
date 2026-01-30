'use client';

import Link from 'next/link';
import { useState } from 'react';

export function QuickActions() {
  const [syncing, setSyncing] = useState({ sheets: false, gmail: false, calendar: false });

  const handleSyncSheets = async () => {
    setSyncing({ ...syncing, sheets: true });
    // This would trigger the sheets sync
    // For now, just redirect to settings
    window.location.href = '/settings';
  };

  const handleScanGmail = async () => {
    setSyncing({ ...syncing, gmail: true });
    try {
      await fetch('/api/emails/scan', { method: 'POST' });
      window.location.href = '/emails';
    } catch (error) {
      console.error('Failed to scan Gmail:', error);
    } finally {
      setSyncing({ ...syncing, gmail: false });
    }
  };

  const handleSyncCalendar = async () => {
    setSyncing({ ...syncing, calendar: true });
    try {
      await fetch('/api/calendar/events', { method: 'POST' });
      window.location.href = '/calendar';
    } catch (error) {
      console.error('Failed to sync calendar:', error);
    } finally {
      setSyncing({ ...syncing, calendar: false });
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Link
          href="/contacts"
          className="flex flex-col items-center justify-center p-4 border-2 border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors"
        >
          <svg
            className="h-8 w-8 text-gray-600 mb-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
            />
          </svg>
          <span className="text-sm font-medium text-gray-900">Add Contact</span>
        </Link>

        <button
          onClick={handleSyncSheets}
          disabled={syncing.sheets}
          className="flex flex-col items-center justify-center p-4 border-2 border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors disabled:opacity-50"
        >
          <svg
            className="h-8 w-8 text-gray-600 mb-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <span className="text-sm font-medium text-gray-900">
            {syncing.sheets ? 'Syncing...' : 'Import Sheets'}
          </span>
        </button>

        <button
          onClick={handleScanGmail}
          disabled={syncing.gmail}
          className="flex flex-col items-center justify-center p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors disabled:opacity-50"
        >
          <svg
            className="h-8 w-8 text-gray-600 mb-2"
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
          <span className="text-sm font-medium text-gray-900">
            {syncing.gmail ? 'Scanning...' : 'Scan Gmail'}
          </span>
        </button>

        <button
          onClick={handleSyncCalendar}
          disabled={syncing.calendar}
          className="flex flex-col items-center justify-center p-4 border-2 border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors disabled:opacity-50"
        >
          <svg
            className="h-8 w-8 text-gray-600 mb-2"
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
          <span className="text-sm font-medium text-gray-900">
            {syncing.calendar ? 'Syncing...' : 'Sync Calendar'}
          </span>
        </button>
      </div>
    </div>
  );
}
