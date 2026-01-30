'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { SheetsConfiguration } from '@/components/settings/SheetsConfiguration';
import { AutomationLogs } from '@/components/settings/AutomationLogs';

interface GoogleConnection {
  connected: boolean;
  email?: string;
  name?: string;
  picture?: string;
}

export default function SettingsPage() {
  const searchParams = useSearchParams();
  const [googleConnection, setGoogleConnection] = useState<GoogleConnection>({
    connected: false,
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  useEffect(() => {
    // Check for OAuth callback messages
    const success = searchParams.get('success');
    const error = searchParams.get('error');

    if (success) {
      setMessage({ type: 'success', text: 'Successfully connected to Google!' });
      // Clear URL params
      window.history.replaceState({}, '', '/settings');
    } else if (error) {
      setMessage({ type: 'error', text: `Authentication failed: ${error}` });
      window.history.replaceState({}, '', '/settings');
    }

    checkGoogleConnection();
  }, [searchParams]);

  const checkGoogleConnection = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/settings/google');
      const data = await response.json();
      setGoogleConnection(data);
    } catch (error) {
      console.error('Failed to check Google connection:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectGoogle = () => {
    window.location.href = '/api/auth/google';
  };

  const handleDisconnectGoogle = async () => {
    if (!confirm('Are you sure you want to disconnect your Google account?')) {
      return;
    }

    try {
      const response = await fetch('/api/settings/google', {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Successfully disconnected from Google' });
        checkGoogleConnection();
      } else {
        setMessage({ type: 'error', text: 'Failed to disconnect from Google' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to disconnect from Google' });
    }
  };

  return (
    <div className="px-4 sm:px-0">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>

      {message && (
        <div
          className={`mb-6 p-4 rounded-md ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          <div className="flex">
            <div className="flex-shrink-0">
              {message.type === 'success' ? (
                <svg
                  className="h-5 w-5 text-green-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{message.text}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setMessage(null)}
                className="inline-flex text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Dismiss</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Google Integration */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Google Integration</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Google Account</p>
                <p className="text-sm text-gray-500">
                  Connect to Gmail, Calendar, and Sheets
                </p>
              </div>
              {loading ? (
                <div className="text-sm text-gray-500">Loading...</div>
              ) : googleConnection.connected ? (
                <button
                  onClick={handleDisconnectGoogle}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                >
                  Disconnect
                </button>
              ) : (
                <button
                  onClick={handleConnectGoogle}
                  className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700"
                >
                  Connect Google
                </button>
              )}
            </div>

            <div className="border-t pt-4">
              {loading ? (
                <p className="text-sm text-gray-600">Checking connection...</p>
              ) : googleConnection.connected ? (
                <div className="space-y-3">
                  <div className="flex items-center">
                    <svg
                      className="h-5 w-5 text-green-500 mr-2"
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
                    <span className="text-sm text-green-600 font-medium">Connected</span>
                  </div>
                  {googleConnection.email && (
                    <div className="flex items-center space-x-3">
                      {googleConnection.picture && (
                        <img
                          src={googleConnection.picture}
                          alt={googleConnection.name || 'User'}
                          className="h-10 w-10 rounded-full"
                        />
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {googleConnection.name || 'Unknown'}
                        </p>
                        <p className="text-sm text-gray-500">{googleConnection.email}</p>
                      </div>
                    </div>
                  )}
                  <div className="text-sm text-gray-600">
                    <p className="font-medium mb-1">Access granted to:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Gmail (read and modify)</li>
                      <li>Google Calendar (read)</li>
                      <li>Google Sheets (read and write)</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="flex items-center">
                  <svg
                    className="h-5 w-5 text-red-500 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-sm text-red-600 font-medium">Not Connected</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Google Sheets Configuration */}
        {googleConnection.connected && (
          <SheetsConfiguration />
        )}

        {/* Environment Setup Info */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Environment Setup</h2>
          <div className="space-y-3 text-sm text-gray-600">
            <p>To use this application, you need to:</p>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>
                Create a Supabase project and update{' '}
                <code className="bg-gray-100 px-2 py-1 rounded">.env.local</code>
              </li>
              <li>Create a Google Cloud project and enable Gmail, Calendar, and Sheets APIs</li>
              <li>
                Create OAuth 2.0 credentials and update{' '}
                <code className="bg-gray-100 px-2 py-1 rounded">.env.local</code>
              </li>
              <li>Run the database migrations in Supabase</li>
            </ol>
            <p className="mt-4">
              See <code className="bg-gray-100 px-2 py-1 rounded">.env.local.example</code> for
              required variables.
            </p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Documentation</h2>
          <div className="space-y-2">
            <a
              href="https://console.cloud.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-sm text-orange-600 hover:text-orange-800"
            >
              → Google Cloud Console
            </a>
            <a
              href="https://supabase.com"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-sm text-orange-600 hover:text-orange-800"
            >
              → Supabase Dashboard
            </a>
          </div>
        </div>

        {/* Automation Logs */}
        <AutomationLogs />
      </div>
    </div>
  );
}
