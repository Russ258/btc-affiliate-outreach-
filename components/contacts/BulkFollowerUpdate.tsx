'use client';

import { useState } from 'react';

interface BulkFollowerUpdateProps {
  onComplete: () => void;
}

export function BulkFollowerUpdate({ onComplete }: BulkFollowerUpdateProps) {
  const [file, setFile] = useState<File | null>(null);
  const [nameColumn, setNameColumn] = useState('Name');
  const [followerColumn, setFollowerColumn] = useState('Follower Count');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ updated: number; notFound: number; total: number } | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('nameColumn', nameColumn);
      formData.append('followerColumn', followerColumn);

      const response = await fetch('/api/contacts/bulk-follower-update', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setResult(data);
      setTimeout(() => {
        onComplete();
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600">
        Upload a CSV with contact names and follower counts to update existing contacts.
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            CSV File
          </label>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
          <p className="mt-1 text-xs text-gray-500">
            Your CSV should have columns for name and follower count
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name Column Header
            </label>
            <input
              type="text"
              value={nameColumn}
              onChange={(e) => setNameColumn(e.target.value)}
              placeholder="e.g., Name, Full Name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Follower Count Column Header
            </label>
            <input
              type="text"
              value={followerColumn}
              onChange={(e) => setFollowerColumn(e.target.value)}
              placeholder="e.g., Followers, Follower Count"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
            {error}
          </div>
        )}

        {result && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-md">
            <div className="text-green-800 font-medium mb-2">
              ✓ Bulk Update Complete!
            </div>
            <div className="text-sm text-green-700 space-y-1">
              <div>Updated: {result.updated} contacts</div>
              <div>Not found: {result.notFound} contacts</div>
              <div>Total processed: {result.total} rows</div>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !file}
          className="w-full bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Updating...' : 'Update Follower Counts'}
        </button>
      </form>

      <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-md">
        <strong>Tip:</strong> Contacts are matched by name (case-insensitive). For better accuracy,
        make sure names in your CSV match names in your database exactly.
      </div>
    </div>
  );
}
