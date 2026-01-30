'use client';

import { useState, useEffect } from 'react';
import { EmailList } from '@/components/emails/EmailList';

export default function EmailsPage() {
  const [emails, setEmails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [filterUnread, setFilterUnread] = useState(false);
  const [filterActionRequired, setFilterActionRequired] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  useEffect(() => {
    fetchEmails();
  }, [filterUnread, filterActionRequired]);

  const fetchEmails = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterUnread) params.append('is_read', 'false');
      if (filterActionRequired) params.append('action_required', 'true');

      const response = await fetch(`/api/emails?${params}`);
      const data = await response.json();
      setEmails(data.emails || []);
    } catch (error) {
      console.error('Failed to fetch emails:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScanGmail = async () => {
    setScanning(true);
    setMessage(null);

    try {
      const response = await fetch('/api/emails/scan', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to scan Gmail');
      }

      setMessage({
        type: 'success',
        text: `Scanned ${data.scanned} emails, flagged ${data.flagged} new messages.`,
      });

      fetchEmails();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to scan Gmail',
      });
    } finally {
      setScanning(false);
    }
  };

  const handleMarkAsRead = async (id: string, isRead: boolean) => {
    try {
      const response = await fetch(`/api/emails/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_read: isRead }),
      });

      if (response.ok) {
        fetchEmails();
      }
    } catch (error) {
      console.error('Failed to update email:', error);
    }
  };

  const handleToggleAction = async (id: string, actionRequired: boolean) => {
    try {
      const response = await fetch(`/api/emails/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action_required: actionRequired }),
      });

      if (response.ok) {
        fetchEmails();
      }
    } catch (error) {
      console.error('Failed to update email:', error);
    }
  };

  const handleRemove = async (id: string) => {
    if (!confirm('Remove this email from the flagged list?')) return;

    try {
      const response = await fetch(`/api/emails/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchEmails();
      }
    } catch (error) {
      console.error('Failed to remove email:', error);
    }
  };

  return (
    <div className="px-4 sm:px-0">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Flagged Emails</h1>
        <button
          onClick={handleScanGmail}
          disabled={scanning}
          className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 disabled:opacity-50"
        >
          {scanning ? 'Scanning...' : '🔍 Scan Gmail'}
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
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filterUnread}
                onChange={(e) => setFilterUnread(e.target.checked)}
                className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 mr-2"
              />
              <span className="text-sm text-gray-700">Unread only</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filterActionRequired}
                onChange={(e) => setFilterActionRequired(e.target.checked)}
                className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 mr-2"
              />
              <span className="text-sm text-gray-700">Action required</span>
            </label>
            <div className="ml-auto text-sm text-gray-500">
              {emails.length} email{emails.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading emails...</div>
          ) : (
            <EmailList
              emails={emails}
              onMarkAsRead={handleMarkAsRead}
              onToggleAction={handleToggleAction}
              onRemove={handleRemove}
            />
          )}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">
          How Email Flagging Works
        </h3>
        <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
          <li>Emails from known contacts are automatically flagged</li>
          <li>
            Emails containing keywords like &quot;partnership&quot;, &quot;sponsor&quot;, &quot;affiliate&quot; are flagged
          </li>
          <li>Click &quot;Scan Gmail&quot; to manually check for new important emails</li>
          <li>Use filters to focus on unread or action-required messages</li>
        </ul>
      </div>
    </div>
  );
}
