'use client';

import { useState } from 'react';

interface DuplicateMatch {
  id: string;
  name: string;
  email: string;
  company?: string;
  confidence: number;
  reasons: string[];
}

interface DuplicateItem {
  newContact: {
    name: string;
    email: string;
    company?: string;
    phone?: string;
    website?: string;
    notes?: string;
    sheets_row_id?: number;
  };
  matches: DuplicateMatch[];
}

interface DuplicateResolverProps {
  duplicates: DuplicateItem[];
  onResolve: (
    duplicate: DuplicateItem,
    action: 'merge' | 'create' | 'skip',
    existingContactId?: string
  ) => Promise<void>;
  onComplete: () => void;
}

export function DuplicateResolver({
  duplicates,
  onResolve,
  onComplete,
}: DuplicateResolverProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [processing, setProcessing] = useState(false);

  if (duplicates.length === 0) {
    return null;
  }

  const currentDuplicate = duplicates[currentIndex];
  const progress = ((currentIndex + 1) / duplicates.length) * 100;

  const handleAction = async (
    action: 'merge' | 'create' | 'skip',
    existingContactId?: string
  ) => {
    setProcessing(true);
    try {
      await onResolve(currentDuplicate, action, existingContactId);

      // Move to next duplicate or complete
      if (currentIndex < duplicates.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        onComplete();
      }
    } catch (error) {
      console.error('Failed to resolve duplicate:', error);
      alert('Failed to process. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-8 border w-full max-w-4xl shadow-lg rounded-md bg-white mb-10">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-2xl font-bold text-gray-900">
              Review Potential Duplicates
            </h2>
            <span className="text-sm text-gray-500">
              {currentIndex + 1} of {duplicates.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-orange-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="space-y-6">
          {/* New Contact */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-3">
              New Contact from Sheet
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="font-medium text-gray-700">Name:</span>
                <span className="ml-2 text-gray-900">
                  {currentDuplicate.newContact.name}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Email:</span>
                <span className="ml-2 text-gray-900">
                  {currentDuplicate.newContact.email}
                </span>
              </div>
              {currentDuplicate.newContact.company && (
                <div>
                  <span className="font-medium text-gray-700">Company:</span>
                  <span className="ml-2 text-gray-900">
                    {currentDuplicate.newContact.company}
                  </span>
                </div>
              )}
              {currentDuplicate.newContact.phone && (
                <div>
                  <span className="font-medium text-gray-700">Phone:</span>
                  <span className="ml-2 text-gray-900">
                    {currentDuplicate.newContact.phone}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Potential Matches */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Potential Matches in Database ({currentDuplicate.matches.length})
            </h3>
            <div className="space-y-3">
              {currentDuplicate.matches.map((match, index) => (
                <div
                  key={match.id}
                  className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-orange-300 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                        <div>
                          <span className="font-medium text-gray-700">Name:</span>
                          <span className="ml-2 text-gray-900">{match.name}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Email:</span>
                          <span className="ml-2 text-gray-900">{match.email}</span>
                        </div>
                        {match.company && (
                          <div>
                            <span className="font-medium text-gray-700">Company:</span>
                            <span className="ml-2 text-gray-900">{match.company}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 mb-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            match.confidence >= 90
                              ? 'bg-red-100 text-red-800'
                              : match.confidence >= 75
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {match.confidence}% Match
                        </span>
                      </div>
                      <div className="text-xs text-gray-600">
                        <span className="font-medium">Reasons: </span>
                        {match.reasons.join(', ')}
                      </div>
                    </div>
                    <button
                      onClick={() => handleAction('merge', match.id)}
                      disabled={processing}
                      className="ml-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 text-sm font-medium"
                    >
                      Merge with This
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="border-t pt-6 flex justify-between items-center">
            <button
              onClick={() => handleAction('skip')}
              disabled={processing}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Skip This Contact
            </button>
            <button
              onClick={() => handleAction('create')}
              disabled={processing}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              Create as New Contact
            </button>
          </div>

          {processing && (
            <div className="text-center text-sm text-gray-500">Processing...</div>
          )}
        </div>
      </div>
    </div>
  );
}
