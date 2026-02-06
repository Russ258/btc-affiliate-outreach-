'use client';

import { useState } from 'react';

export function BulkStatusUpdate({ onComplete }: { onComplete?: () => void }) {
  const [identifierText, setIdentifierText] = useState('');
  const [status, setStatus] = useState<'new' | 'contacted' | 'responded' | 'interested' | 'declined'>('contacted');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    updated: number;
    searched: number;
    matchedContacts?: { name: string; twitter_handle?: string; email?: string }[];
  } | null>(null);

  const handleUpdate = async () => {
    if (!identifierText.trim()) {
      alert('Please enter at least one name, email, or Twitter handle');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // Split by newlines and commas, clean up
      const identifiers = identifierText
        .split(/[\n,]/)
        .map((id) => id.trim())
        .filter((id) => id.length > 0);

      const response = await fetch('/api/contacts/bulk-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifiers,
          status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update contacts');
      }

      setResult(data);
      if (data.updated > 0) {
        setIdentifierText(''); // Clear on success
        if (onComplete) onComplete();
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to update contacts');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Bulk Status Update</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Names, Twitter Handles, or Emails (one per line)
          </label>
          <textarea
            value={identifierText}
            onChange={(e) => setIdentifierText(e.target.value)}
            placeholder="John Doe&#10;@johncena&#10;jane@example.com&#10;..."
            rows={10}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500 font-mono text-sm"
          />
          <p className="mt-1 text-xs text-gray-500">
            Paste a list of contacts to update. Separate with newlines or commas. Can be names, Twitter handles (with or without @), or email addresses.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            New Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="responded">Responded</option>
            <option value="interested">Interested</option>
            <option value="declined">Declined</option>
          </select>
        </div>

        <button
          onClick={handleUpdate}
          disabled={loading || !identifierText.trim()}
          className="w-full bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Updating...' : 'Update Contacts'}
        </button>

        {result && (
          <div className={`p-4 rounded-md ${result.updated > 0 ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
            <p className={`text-sm font-semibold ${result.updated > 0 ? 'text-green-800' : 'text-yellow-800'}`}>
              {result.updated > 0
                ? `✓ Successfully updated ${result.updated} contact${result.updated > 1 ? 's' : ''}`
                : `No matches found among ${result.searched} identifier${result.searched > 1 ? 's' : ''}`
              }
            </p>
            {result.matchedContacts && result.matchedContacts.length > 0 && (
              <div className="mt-2">
                <p className="text-xs font-medium text-gray-700 mb-1">Updated contacts:</p>
                <ul className="text-xs text-gray-600 space-y-1">
                  {result.matchedContacts.slice(0, 10).map((contact, idx) => (
                    <li key={idx} className="font-mono">
                      {contact.name} {contact.twitter_handle && `(@${contact.twitter_handle})`} {contact.email && `(${contact.email})`}
                    </li>
                  ))}
                  {result.matchedContacts.length > 10 && (
                    <li className="text-gray-500">...and {result.matchedContacts.length - 10} more</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
