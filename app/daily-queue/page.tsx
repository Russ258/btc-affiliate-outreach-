'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface QueueContact {
  queue_id: number;
  queue_date: string;
  queue_state: string;
  is_prospect: boolean;
  id: number;
  name: string;
  email: string;
  twitter_handle: string;
  instagram_handle?: string;
  youtube_channel?: string;
  youtube_url?: string;
  company: string;
  phone: string;
  website: string;
  status: string;
  priority: string;
  notes: string;
  tags: string[];
  source?: string; // 'youtube', 'twitter', 'instagram', etc.
  follower_count?: number;
  confidence?: string;
  bio?: string;
  created_at: string;
  discovered_at?: string;
}

interface QueueStats {
  pending: number;
  contacted: number;
  skipped: number;
  total: number;
}

export default function DailyQueuePage() {
  const [queue, setQueue] = useState<QueueContact[]>([]);
  const [stats, setStats] = useState<QueueStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<string>('');

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/daily-queue');
      const data = await response.json();
      setQueue(data.queue || []);
      setStats(data.stats || null);
      if (data.stats && data.stats.total > 0) {
        setLastGenerated(new Date().toLocaleString());
      }
    } catch (error) {
      console.error('Failed to fetch queue:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateQueue = async () => {
    setGenerating(true);
    try {
      const response = await fetch('/api/daily-queue/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limit: 150 }),
      });
      const data = await response.json();

      if (data.ok) {
        setLastGenerated(new Date().toLocaleString());
        await fetchQueue();
      } else {
        alert(data.message || 'Failed to generate queue');
      }
    } catch (error) {
      console.error('Failed to generate queue:', error);
      alert('Failed to generate queue');
    } finally {
      setGenerating(false);
    }
  };

  const markAsContacted = async (queueId: number) => {
    try {
      const response = await fetch(`/api/daily-queue/${queueId}/mark-contacted`, {
        method: 'PATCH',
      });

      if (response.ok) {
        await fetchQueue();
      } else {
        alert('Failed to mark as contacted');
      }
    } catch (error) {
      console.error('Failed to mark as contacted:', error);
      alert('Failed to mark as contacted');
    }
  };


  return (
    <div className="px-4 sm:px-0">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Daily Queue</h1>
            <p className="mt-2 text-sm text-gray-600">
              Your personalized list of fresh prospects to reach out to today
            </p>
          </div>
          <button
            onClick={generateQueue}
            disabled={generating}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generating ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : (
              <>
                <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Generate List
              </>
            )}
          </button>
        </div>

        {/* Stats Bar */}
        {stats && stats.total > 0 && (
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-4">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">Total in Queue</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.total}</dd>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">Pending</dt>
                <dd className="mt-1 text-3xl font-semibold text-orange-600">{stats.pending}</dd>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">Contacted</dt>
                <dd className="mt-1 text-3xl font-semibold text-green-600">{stats.contacted}</dd>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">Skipped</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-600">{stats.skipped}</dd>
              </div>
            </div>
          </div>
        )}

        {lastGenerated && (
          <p className="mt-4 text-sm text-gray-500">
            Last generated: {lastGenerated}
          </p>
        )}
      </div>

      {/* Queue List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          <p className="mt-4 text-gray-600">Loading queue...</p>
        </div>
      ) : queue.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">No Queue Generated</h3>
          <p className="mt-1 text-sm text-gray-500">
            Click "Generate List" to create your daily outreach queue
          </p>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {queue.map((contact, index) => (
              <li key={contact.queue_id} className="hover:bg-gray-50 transition-colors duration-150">
                <div className="px-6 py-5">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-800 text-sm font-medium">
                          {index + 1}
                        </span>
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {contact.name || 'Unknown'}
                        </h3>
                        {contact.is_prospect && contact.source && (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            contact.source === 'youtube' ? 'bg-red-100 text-red-800' :
                            contact.source === 'twitter' ? 'bg-blue-100 text-blue-800' :
                            contact.source === 'instagram' ? 'bg-pink-100 text-pink-800' :
                            contact.source === 'linkedin' ? 'bg-indigo-100 text-indigo-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {contact.source === 'youtube' ? '📺' : contact.source === 'twitter' ? '🐦' : contact.source === 'instagram' ? '📷' : contact.source === 'linkedin' ? '💼' : '🔍'} {contact.source.toUpperCase()}
                            {contact.follower_count && ` • ${contact.follower_count >= 1000000 ? `${(contact.follower_count / 1000000).toFixed(1)}M` : contact.follower_count >= 1000 ? `${(contact.follower_count / 1000).toFixed(1)}K` : contact.follower_count}`}
                          </span>
                        )}
                      </div>

                      <div className="mt-2 grid grid-cols-2 gap-4 text-sm text-gray-600">
                        {contact.email && (
                          <div className="flex items-center gap-2">
                            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <a href={`mailto:${contact.email}`} className="text-orange-600 hover:text-orange-700">
                              {contact.email}
                            </a>
                          </div>
                        )}

                        {contact.twitter_handle && (
                          <div className="flex items-center gap-2">
                            <svg className="h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                            </svg>
                            <a href={`https://twitter.com/${contact.twitter_handle.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:text-orange-700">
                              @{contact.twitter_handle.replace('@', '')}
                            </a>
                          </div>
                        )}

                        {contact.youtube_channel && (
                          <div className="flex items-center gap-2">
                            <svg className="h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                            </svg>
                            <a href={contact.youtube_url || `https://youtube.com/${contact.youtube_channel}`} target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:text-orange-700 truncate">
                              {contact.youtube_channel}
                            </a>
                          </div>
                        )}

                        {contact.instagram_handle && (
                          <div className="flex items-center gap-2">
                            <svg className="h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                            </svg>
                            <a href={`https://instagram.com/${contact.instagram_handle.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:text-orange-700">
                              @{contact.instagram_handle.replace('@', '')}
                            </a>
                          </div>
                        )}

                        {contact.company && (
                          <div className="flex items-center gap-2">
                            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            <span>{contact.company}</span>
                          </div>
                        )}

                        {contact.website && (
                          <div className="flex items-center gap-2">
                            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                            </svg>
                            <a href={contact.website} target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:text-orange-700 truncate">
                              {contact.website}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="ml-6 flex items-center gap-3">
                      <Link
                        href={`/contacts/${contact.id}`}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                      >
                        View Details
                      </Link>
                      <button
                        onClick={() => markAsContacted(contact.queue_id)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        <svg className="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Mark Contacted
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
