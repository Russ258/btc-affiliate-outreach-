'use client';

import Link from 'next/link';
import { Contact, ContactStatus, ContactPriority } from '@/types';

interface ContactListProps {
  contacts: Contact[];
  onDelete?: (id: string) => void;
  onStatusChange?: (id: string, status: ContactStatus) => void;
  onPriorityChange?: (id: string, priority: ContactPriority) => void;
}

// Returns a CSS class name for styling status badges based on the contact status
function getStatusColor(status: ContactStatus) {
  const colors = {
    new: 'bg-blue-100 text-blue-800',
    contacted: 'bg-yellow-100 text-yellow-800',
    responded: 'bg-purple-100 text-purple-800',
    interested: 'bg-green-100 text-green-800',
    declined: 'bg-red-100 text-red-800',
  };
  return colors[status];
}

// Returns a CSS class name for styling priority badges based on the contact priority
function getPriorityColor(priority: ContactPriority) {
  const colors = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-blue-100 text-blue-800',
    high: 'bg-orange-100 text-orange-800',
  };
  return colors[priority];
}

export function ContactList({ contacts, onDelete, onStatusChange, onPriorityChange }: ContactListProps) {
  if (contacts.length === 0) {
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
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-semibold text-gray-900">No contacts</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by adding a new contact.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Company
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Priority
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Next Follow-up
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {contacts.map((contact) => (
            <tr key={contact.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex flex-col">
                  <div className="text-sm font-medium text-gray-900">{contact.name}</div>
                  <div className="text-sm text-gray-500">
                    {contact.email || (contact.twitter_handle ? `@${contact.twitter_handle}` : '-')}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{contact.company || '-'}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {onStatusChange ? (
                  <select
                    value={contact.status}
                    onChange={(e) => onStatusChange(contact.id, e.target.value as ContactStatus)}
                    className={`px-2 text-xs leading-5 font-semibold rounded-full border-0 ${getStatusColor(
                      contact.status
                    )}`}
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="responded">Responded</option>
                    <option value="interested">Interested</option>
                    <option value="declined">Declined</option>
                  </select>
                ) : (
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                      contact.status
                    )}`}
                  >
                    {contact.status}
                  </span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {onPriorityChange ? (
                  <select
                    value={contact.priority}
                    onChange={(e) => onPriorityChange(contact.id, e.target.value as ContactPriority)}
                    className={`px-2 text-xs leading-5 font-semibold rounded-full border-0 ${getPriorityColor(
                      contact.priority
                    )}`}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                ) : (
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(
                      contact.priority
                    )}`}
                  >
                    {contact.priority}
                  </span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {contact.next_followup_date
                  ? new Date(contact.next_followup_date).toLocaleDateString()
                  : '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <Link
                  href={`/contacts/${contact.id}`}
                  className="text-orange-600 hover:text-orange-900 mr-4"
                >
                  View
                </Link>
                {onDelete && (
                  <button
                    onClick={() => onDelete(contact.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
