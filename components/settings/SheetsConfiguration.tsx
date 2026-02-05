'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DuplicateResolver } from '@/components/contacts/DuplicateResolver';

export function SheetsConfiguration() {
  const router = useRouter();
  const [spreadsheetId, setSpreadsheetId] = useState('');
  const [sheetName, setSheetName] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );
  const [duplicates, setDuplicates] = useState<any[]>([]);
  const [showDuplicateResolver, setShowDuplicateResolver] = useState(false);

  useEffect(() => {
    loadSavedConfig();
  }, []);

  const loadSavedConfig = async () => {
    try {
      const response = await fetch('/api/contacts/sync');
      const data = await response.json();
      if (data.config) {
        setSpreadsheetId(data.config.spreadsheetId || '');
        setSheetName(data.config.sheetName || '');
      }
    } catch (error) {
      console.error('Failed to load saved config:', error);
    }
  };

  const handleSync = async () => {
    if (!spreadsheetId || !sheetName) {
      setMessage({ type: 'error', text: 'Please enter spreadsheet ID and sheet name' });
      return;
    }

    setSyncing(true);
    setMessage(null);

    try {
      // Column mapping for: A=Name, B=Twitter Handle, C=Notes, D=Status, E=Date Contacted
      const columnMapping = {
        name: 0, // Column A
        twitter_handle: 1, // Column B
        notes: 2, // Column C
        status: 3, // Column D
        first_contact_date: 4, // Column E
      };

      const response = await fetch('/api/contacts/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spreadsheetId,
          sheetName,
          columnMapping,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sync');
      }

      if (data.duplicatesFound > 0) {
        // Show duplicate resolver
        setDuplicates(data.duplicates);
        setShowDuplicateResolver(true);
        setMessage({
          type: 'success',
          text: `Imported ${data.imported} contacts. Found ${data.duplicatesFound} potential duplicates to review.`,
        });
      } else {
        setMessage({
          type: 'success',
          text: `Successfully imported ${data.imported} contacts from Google Sheets!`,
        });
        // Refresh contacts page if user navigates there
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to sync contacts',
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleResolveDuplicate = async (
    duplicate: any,
    action: 'merge' | 'create' | 'skip',
    existingContactId?: string
  ) => {
    const response = await fetch('/api/contacts/dedupe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action,
        newContact: duplicate.newContact,
        existingContactId,
      }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to resolve duplicate');
    }
  };

  const handleDuplicateResolverComplete = () => {
    setShowDuplicateResolver(false);
    setDuplicates([]);
    setMessage({
      type: 'success',
      text: 'All duplicates have been reviewed!',
    });
    // Refresh the page or redirect to contacts
    router.refresh();
  };

  return (
    <>
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Google Sheets Import</h2>

        {message && (
          <div
            className={`mb-4 p-3 rounded-md ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            <p className="text-sm">{message.text}</p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Spreadsheet ID
            </label>
            <input
              type="text"
              value={spreadsheetId}
              onChange={(e) => setSpreadsheetId(e.target.value)}
              placeholder="From the URL: docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Find this in your Google Sheets URL between /d/ and /edit
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sheet Name
            </label>
            <input
              type="text"
              value={sheetName}
              onChange={(e) => setSheetName(e.target.value)}
              placeholder="e.g., Sheet1, Contacts, Affiliates"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              The name of the sheet tab (visible at the bottom of Google Sheets)
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">
              Expected Sheet Format
            </h3>
            <p className="text-xs text-blue-800 mb-2">
              Your sheet should have these columns in order:
            </p>
            <div className="text-xs text-blue-800 font-mono">
              <div className="grid grid-cols-5 gap-2">
                <div className="bg-blue-100 p-1 rounded">A: Name</div>
                <div className="bg-blue-100 p-1 rounded">B: Twitter Handle</div>
                <div className="bg-blue-100 p-1 rounded">C: Notes</div>
                <div className="bg-blue-100 p-1 rounded">D: Status</div>
                <div className="bg-blue-100 p-1 rounded">E: Date Contacted</div>
              </div>
            </div>
            <p className="text-xs text-blue-800 mt-2">
              First row should be headers. Name and Twitter Handle are required. Email column optional.
            </p>
          </div>

          <button
            onClick={handleSync}
            disabled={syncing || !spreadsheetId || !sheetName}
            className="w-full bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {syncing ? 'Importing...' : 'Import Contacts from Sheet'}
          </button>

          <p className="text-xs text-gray-500">
            The import will automatically detect duplicates and let you review them before adding.
          </p>
        </div>
      </div>

      {showDuplicateResolver && duplicates.length > 0 && (
        <DuplicateResolver
          duplicates={duplicates}
          onResolve={handleResolveDuplicate}
          onComplete={handleDuplicateResolverComplete}
        />
      )}
    </>
  );
}
