'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Contact } from '@/types';
import { ContactForm } from '@/components/contacts/ContactForm';

export default function ContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    fetchContact();
  }, [resolvedParams.id]);

  const fetchContact = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/contacts/${resolvedParams.id}`);
      if (response.ok) {
        const data = await response.json();
        setContact(data.contact);
      } else {
        router.push('/contacts');
      }
    } catch (error) {
      console.error('Failed to fetch contact:', error);
      router.push('/contacts');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateContact = async (contactData: Partial<Contact>) => {
    const response = await fetch(`/api/contacts/${resolvedParams.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contactData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update contact');
    }

    await fetchContact();
    setEditing(false);
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this contact?')) return;

    try {
      const response = await fetch(`/api/contacts/${resolvedParams.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/contacts');
      }
    } catch (error) {
      console.error('Failed to delete contact:', error);
    }
  };

  if (loading) {
    return (
      <div className="px-4 sm:px-0">
        <div className="text-center py-12 text-gray-500">Loading contact...</div>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="px-4 sm:px-0">
        <div className="text-center py-12 text-gray-500">Contact not found</div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-0">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{contact.name}</h1>
        <div className="space-x-3">
          <button
            onClick={() => router.push('/contacts')}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Back
          </button>
          {!editing && (
            <>
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      {editing ? (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Edit Contact</h2>
          <ContactForm
            contact={contact}
            onSubmit={handleUpdateContact}
            onCancel={() => setEditing(false)}
          />
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Email</h3>
              <p className="mt-1 text-sm text-gray-900">{contact.email}</p>
            </div>

            {contact.company && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Company</h3>
                <p className="mt-1 text-sm text-gray-900">{contact.company}</p>
              </div>
            )}

            {contact.phone && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                <p className="mt-1 text-sm text-gray-900">{contact.phone}</p>
              </div>
            )}

            {contact.website && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Website</h3>
                <a
                  href={contact.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 text-sm text-orange-600 hover:text-orange-800"
                >
                  {contact.website}
                </a>
              </div>
            )}

            <div>
              <h3 className="text-sm font-medium text-gray-500">Status</h3>
              <p className="mt-1 text-sm text-gray-900 capitalize">{contact.status}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Priority</h3>
              <p className="mt-1 text-sm text-gray-900 capitalize">{contact.priority}</p>
            </div>

            {contact.first_contact_date && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">First Contact Date</h3>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(contact.first_contact_date).toLocaleDateString()}
                </p>
              </div>
            )}

            {contact.last_contact_date && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Last Contact Date</h3>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(contact.last_contact_date).toLocaleDateString()}
                </p>
              </div>
            )}

            {contact.next_followup_date && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Next Follow-up Date</h3>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(contact.next_followup_date).toLocaleDateString()}
                </p>
              </div>
            )}

            <div>
              <h3 className="text-sm font-medium text-gray-500">Created</h3>
              <p className="mt-1 text-sm text-gray-900">
                {new Date(contact.created_at).toLocaleString()}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Last Updated</h3>
              <p className="mt-1 text-sm text-gray-900">
                {new Date(contact.updated_at).toLocaleString()}
              </p>
            </div>
          </div>

          {contact.notes && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-500">Notes</h3>
              <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{contact.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
