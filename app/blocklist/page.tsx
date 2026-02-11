'use client';

import { useState, useEffect } from 'react';

interface BlocklistEntry {
  id: string;
  name: string;
  reason: string;
  email: string;
  twitter_handle: string;
  youtube_channel: string;
  created_at: string;
}

export default function BlocklistPage() {
  const [blocklist, setBlocklist] = useState<BlocklistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [bulkNames, setBulkNames] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    fetchBlocklist();
  }, []);

  const fetchBlocklist = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/blocklist');
      const data = await response.json();
      setBlocklist(data.blocklist || []);
    } catch (error) {
      console.error('Failed to fetch blocklist:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToBlocklist = async () => {
    if (!bulkNames.trim()) {
      alert('Please enter at least one name');
      return;
    }

    setAdding(true);
    try {
      const names = bulkNames
        .split('\n')
        .map(n => n.trim())
        .filter(n => n.length > 0);

      const response = await fetch('/api/blocklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ names, reason }),
      });

      const data = await response.json();

      if (response.ok) {
        setBulkNames('');
        setReason('');
        await fetchBlocklist();
        alert(`Added ${data.added} name(s) to blocklist`);
      } else {
        alert(data.error || 'Failed to add to blocklist');
      }
    } catch (error) {
      console.error('Failed to add to blocklist:', error);
      alert('Failed to add to blocklist');
    } finally {
      setAdding(false);
    }
  };

  const removeFromBlocklist = async (id: string) => {
    if (!confirm('Remove this name from the blocklist?')) return;

    try {
      const response = await fetch(`/api/blocklist?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchBlocklist();
      } else {
        alert('Failed to remove from blocklist');
      }
    } catch (error) {
      console.error('Failed to remove from blocklist:', error);
      alert('Failed to remove from blocklist');
    }
  };

  return (
    <div className="px-4 sm:px-0">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Blocklist</h1>
        <p className="mt-2 text-sm text-gray-600">
          Names added here will never appear in your daily queue
        </p>
      </div>

      {/* Add to Blocklist Form */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Add to Blocklist</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Names (one per line)
            </label>
            <textarea
              value={bulkNames}
              onChange={(e) => setBulkNames(e.target.value)}
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="John Doe&#10;Jane Smith&#10;Company Name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason (optional)
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="e.g., Already working with, Declined, etc."
            />
          </div>

          <button
            onClick={addToBlocklist}
            disabled={adding}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
          >
            {adding ? 'Adding...' : 'Add to Blocklist'}
          </button>
        </div>
      </div>

      {/* Blocklist Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Blocked Names ({blocklist.length})
          </h2>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : blocklist.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No blocked names yet. Add names above to exclude them from your daily queue.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Added
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {blocklist.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {entry.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {entry.reason || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(entry.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => removeFromBlocklist(entry.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
