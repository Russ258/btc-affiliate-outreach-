import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

// POST /api/contacts/bulk-update - Update multiple contacts by name or twitter handle
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { identifiers, status, updateField } = body;

    if (!identifiers || !Array.isArray(identifiers) || identifiers.length === 0) {
      return NextResponse.json(
        { error: 'Identifiers array is required' },
        { status: 400 }
      );
    }

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    // Clean and normalize identifiers
    const cleanedIdentifiers = identifiers
      .map((id) => String(id).trim())
      .filter((id) => id.length > 0)
      .map((id) => {
        // Remove @ symbol from twitter handles if present
        return id.replace(/^@/, '').toLowerCase();
      });

    if (cleanedIdentifiers.length === 0) {
      return NextResponse.json(
        { error: 'No valid identifiers provided' },
        { status: 400 }
      );
    }

    // Fetch all contacts to find matches
    const { data: allContacts, error: fetchError } = await supabase
      .from('contacts')
      .select('*');

    if (fetchError) {
      return NextResponse.json(
        { error: 'Failed to fetch contacts' },
        { status: 500 }
      );
    }

    // Find matching contacts by name or twitter handle
    const matchedContacts = allContacts?.filter((contact) => {
      const nameMatch = contact.name && cleanedIdentifiers.includes(contact.name.toLowerCase());
      const twitterMatch = contact.twitter_handle && cleanedIdentifiers.includes(contact.twitter_handle.toLowerCase());
      const emailMatch = contact.email && cleanedIdentifiers.includes(contact.email.toLowerCase());
      return nameMatch || twitterMatch || emailMatch;
    }) || [];

    if (matchedContacts.length === 0) {
      return NextResponse.json(
        {
          success: true,
          updated: 0,
          message: 'No matching contacts found',
          searched: cleanedIdentifiers.length,
        }
      );
    }

    // Update all matched contacts
    const updateData: any = {
      status,
      last_contact_date: new Date().toISOString(),
    };

    if (updateField === 'next_followup_date') {
      // Allow setting next followup date
      updateData.next_followup_date = body.next_followup_date;
    }

    const updatePromises = matchedContacts.map((contact) =>
      supabase
        .from('contacts')
        .update(updateData)
        .eq('id', contact.id)
    );

    await Promise.all(updatePromises);

    return NextResponse.json({
      success: true,
      updated: matchedContacts.length,
      searched: cleanedIdentifiers.length,
      matchedContacts: matchedContacts.map((c) => ({
        id: c.id,
        name: c.name,
        twitter_handle: c.twitter_handle,
        email: c.email,
      })),
    });
  } catch (error) {
    console.error('Bulk update error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to update contacts',
      },
      { status: 500 }
    );
  }
}
