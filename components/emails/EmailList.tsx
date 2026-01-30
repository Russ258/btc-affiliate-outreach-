'use client';

import { FlaggedEmail } from '@/types';
import Link from 'next/link';

interface EmailListProps {
  emails: (FlaggedEmail & { contacts?: { name: string; company?: string } })[];
  onMarkAsRead?: (id: string, isRead: boolean) => void;
  onToggleAction?: (id: string, actionRequired: boolean) => void;
  onRemove?: (id: string) => void;
}

export function EmailList({
  emails,
  onMarkAsRead,
  onToggleAction,
  onRemove,
}: EmailListProps) {
  if (emails.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
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
        <h3 className="mt-2 text-sm font-semibold text-gray-900">No flagged emails</h3>
        <p className="mt-1 text-sm text-gray-500">
          Important emails from affiliates will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {emails.map((email) => (
        <div
          key={email.id}
          className={`bg-white border rounded-lg p-4 hover:shadow-md transition-shadow ${
            !email.is_read ? 'border-orange-300 bg-orange-50' : 'border-gray-200'
          } ${email.action_required ? 'border-l-4 border-l-red-500' : ''}`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex items-center space-x-2 mb-2">
                {!email.is_read && (
                  <span className="inline-block h-2 w-2 rounded-full bg-orange-500"></span>
                )}
                {email.action_required && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                    Action Required
                  </span>
                )}
                <span className="text-xs text-gray-500">
                  {new Date(email.received_at).toLocaleString()}
                </span>
              </div>

              {/* From */}
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-sm font-medium text-gray-900">
                  From: {email.from_email}
                </span>
                {email.contacts && (
                  <Link
                    href={`/contacts/${email.contact_id}`}
                    className="text-xs text-orange-600 hover:text-orange-800"
                  >
                    ({email.contacts.name}
                    {email.contacts.company && ` - ${email.contacts.company}`})
                  </Link>
                )}
              </div>

              {/* Subject */}
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                {email.subject || '(No Subject)'}
              </h3>

              {/* Snippet */}
              {email.snippet && (
                <p className="text-sm text-gray-600 line-clamp-2">{email.snippet}</p>
              )}
            </div>

            {/* Actions */}
            <div className="ml-4 flex-shrink-0 flex flex-col space-y-2">
              {onMarkAsRead && (
                <button
                  onClick={() => onMarkAsRead(email.id, !email.is_read)}
                  className="text-xs text-blue-600 hover:text-blue-800"
                  title={email.is_read ? 'Mark as unread' : 'Mark as read'}
                >
                  {email.is_read ? '✉️ Unread' : '✓ Read'}
                </button>
              )}
              {onToggleAction && (
                <button
                  onClick={() => onToggleAction(email.id, !email.action_required)}
                  className="text-xs text-orange-600 hover:text-orange-800"
                  title={
                    email.action_required
                      ? 'Remove action flag'
                      : 'Mark as action required'
                  }
                >
                  {email.action_required ? '🚩 Unflag' : '🚩 Flag'}
                </button>
              )}
              {onRemove && (
                <button
                  onClick={() => onRemove(email.id)}
                  className="text-xs text-red-600 hover:text-red-800"
                  title="Remove from list"
                >
                  ✕ Remove
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
