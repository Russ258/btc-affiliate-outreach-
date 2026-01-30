'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-orange-600">404</h1>
          <div className="mt-4">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Page not found
            </h2>
            <p className="text-gray-600">
              Sorry, we couldn&apos;t find the page you&apos;re looking for.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Go to Dashboard
          </Link>

          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Go Back
          </button>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Looking for something specific? Try these:
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Link
              href="/contacts"
              className="text-sm text-orange-600 hover:text-orange-700 underline"
            >
              Contacts
            </Link>
            <span className="text-gray-300">•</span>
            <Link
              href="/calendar"
              className="text-sm text-orange-600 hover:text-orange-700 underline"
            >
              Calendar
            </Link>
            <span className="text-gray-300">•</span>
            <Link
              href="/emails"
              className="text-sm text-orange-600 hover:text-orange-700 underline"
            >
              Emails
            </Link>
            <span className="text-gray-300">•</span>
            <Link
              href="/settings"
              className="text-sm text-orange-600 hover:text-orange-700 underline"
            >
              Settings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
