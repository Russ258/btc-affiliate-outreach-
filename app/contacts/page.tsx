'use client';

import { useState, useEffect } from 'react';
import { Contact } from '@/types';
import { ContactList } from '@/components/contacts/ContactList';
import { ContactForm } from '@/components/contacts/ContactForm';
import { BulkStatusUpdate } from '@/components/contacts/BulkStatusUpdate';
import { BulkFollowerUpdate } from '@/components/contacts/BulkFollowerUpdate';

export default function ContactsPage() {
  const [mounted, setMounted] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showBulkUpdate, setShowBulkUpdate] = useState(false);
  const [showBulkFollowerUpdate, setShowBulkFollowerUpdate] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState<'team' | 'personal'>('team'); // Toggle between team and personal
  const [showFollowupsDue, setShowFollowupsDue] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Check URL params for followups filter
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('followups') === 'due') {
      setShowFollowupsDue(true);
      setView('personal'); // Show personal view when viewing followups
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchContacts();
    }
  }, [statusFilter, priorityFilter, searchTerm, view, showFollowupsDue, mounted]);

  if (!mounted) {
    return null;
  }

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('view', view);
      if (statusFilter) params.append('status', statusFilter);
      if (priorityFilter) params.append('priority', priorityFilter);
      if (searchTerm) params.append('search', searchTerm);
      if (showFollowupsDue) params.append('followups', 'due');

      const response = await fetch(`/api/contacts?${params}`);
      const data = await response.json();
      setContacts(data.contacts || []);
    } catch (error) {
      console.error('Failed to fetch contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddContact = async (contactData: Partial<Contact>) => {
    const response = await fetch('/api/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contactData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to add contact');
    }

    setShowAddForm(false);
    fetchContacts();
  };

  const handleDeleteContact = async (id: string) => {
    if (!confirm('Are you sure you want to delete this contact?')) return;

    try {
      const response = await fetch(`/api/contacts/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchContacts();
      }
    } catch (error) {
      console.error('Failed to delete contact:', error);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const contact = contacts.find((c) => c.id === id);
      if (!contact) return;

      const response = await fetch(`/api/contacts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...contact,
          status,
          last_contact_date: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        // Update local state immediately for better UX
        setContacts(contacts.map((c) => (c.id === id ? { ...c, status: status as any } : c)));
      }
    } catch (error) {
      console.error('Failed to update contact status:', error);
    }
  };

  const handlePriorityChange = async (id: string, priority: string) => {
    try {
      const contact = contacts.find((c) => c.id === id);
      if (!contact) return;

      const response = await fetch(`/api/contacts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...contact,
          priority,
        }),
      });

      if (response.ok) {
        // Update local state immediately for better UX
        setContacts(contacts.map((c) => (c.id === id ? { ...c, priority: priority as any } : c)));
      }
    } catch (error) {
      console.error('Failed to update contact priority:', error);
    }
  };

  const downloadCSV = () => {
    if (contacts.length === 0) {
      alert('No contacts to download');
      return;
    }

    // Define CSV headers
    const headers = [
      'Name',
      'Email',
      'Twitter Handle',
      'Follower Count',
      'Company',
      'Phone',
      'Website',
      'Status',
      'Priority',
      'Notes',
      'Tags',
      'First Contact Date',
      'Last Contact Date',
      'Next Followup Date',
    ];

    // Convert contacts to CSV rows
    const rows = contacts.map((contact) => [
      contact.name || '',
      contact.email || '',
      contact.twitter_handle || '',
      contact.follower_count || '',
      contact.company || '',
      contact.phone || '',
      contact.website || '',
      contact.status || '',
      contact.priority || '',
      contact.notes || '',
      (contact.tags || []).join('; '),
      contact.first_contact_date || '',
      contact.last_contact_date || '',
      contact.next_followup_date || '',
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        row.map((cell) => {
          // Escape quotes and wrap in quotes if contains comma, quote, or newline
          const cellStr = String(cell);
          if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
            return `"${cellStr.replace(/"/g, '""')}"`;
          }
          return cellStr;
        }).join(',')
      ),
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    // Generate filename with current filters
    const timestamp = new Date().toISOString().split('T')[0];
    const filterPart = statusFilter ? `_${statusFilter}` : '';
    const filename = `contacts${filterPart}_${timestamp}.csv`;

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="px-4 sm:px-0">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contacts</h1>
          {/* View Toggle */}
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setView('team')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                view === 'team'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Team Contacts
            </button>
            <button
              onClick={() => setView('personal')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                view === 'personal'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              My Contacts
            </button>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={downloadCSV}
            disabled={contacts.length === 0}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download CSV
          </button>
          <button
            onClick={() => setShowBulkFollowerUpdate(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
          >
            Update Followers
          </button>
          <button
            onClick={() => setShowBulkUpdate(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Bulk Update
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700"
          >
            Add Contact
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add New Contact</h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            <ContactForm
              onSubmit={handleAddContact}
              onCancel={() => setShowAddForm(false)}
            />
          </div>
        </div>
      )}

      {showBulkUpdate && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Bulk Status Update</h3>
              <button
                onClick={() => setShowBulkUpdate(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            <BulkStatusUpdate
              onComplete={() => {
                fetchContacts();
                setShowBulkUpdate(false);
              }}
            />
          </div>
        </div>
      )}

      {showBulkFollowerUpdate && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Bulk Update Follower Counts</h3>
              <button
                onClick={() => setShowBulkFollowerUpdate(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            <BulkFollowerUpdate
              onComplete={() => {
                fetchContacts();
                setShowBulkFollowerUpdate(false);
              }}
            />
          </div>
        </div>
      )}

      {showFollowupsDue && (
        <div className="bg-orange-50 border-l-4 border-orange-400 p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-orange-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-orange-700">
                <strong>Showing Follow-ups Due:</strong> Contacts that need attention today or are overdue
              </p>
            </div>
            <button
              onClick={() => {
                setShowFollowupsDue(false);
                window.history.pushState({}, '', '/contacts');
              }}
              className="text-orange-700 hover:text-orange-900 text-sm font-medium"
            >
              Clear Filter
            </button>
          </div>
        </div>
      )}

      <div className="bg-white shadow rounded-lg mb-6">
        <div className="p-4 border-b border-gray-200">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <input
                type="text"
                placeholder="Name, email, or company"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">All Statuses</option>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="responded">Responded</option>
                <option value="interested">Interested</option>
                <option value="accepted">Accepted</option>
                <option value="declined">Declined</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading contacts...</div>
          ) : (
            <ContactList
              contacts={contacts}
              onDelete={handleDeleteContact}
              onStatusChange={handleStatusChange}
              onPriorityChange={handlePriorityChange}
              onUpdateContact={fetchContacts}
            />
          )}
        </div>
      </div>
    </div>
  );
}
