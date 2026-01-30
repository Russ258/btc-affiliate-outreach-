import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { mergeContacts } from '@/lib/utils/dedupe';

// POST /api/contacts/dedupe - Handle duplicate resolution (merge or create new)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, newContact, existingContactId } = body;

    if (!action || !newContact) {
      return NextResponse.json(
        { error: 'Action and newContact are required' },
        { status: 400 }
      );
    }

    if (action === 'merge') {
      // Merge with existing contact
      if (!existingContactId) {
        return NextResponse.json(
          { error: 'Existing contact ID required for merge' },
          { status: 400 }
        );
      }

      // Fetch existing contact
      const { data: existing, error: fetchError } = await supabase
        .from('contacts')
        .select('*')
        .eq('id', existingContactId)
        .single();

      if (fetchError || !existing) {
        return NextResponse.json(
          { error: 'Existing contact not found' },
          { status: 404 }
        );
      }

      // Merge the contacts
      const merged = mergeContacts(existing, newContact);

      // Update existing contact with merged data
      const { data, error } = await supabase
        .from('contacts')
        .update(merged)
        .eq('id', existingContactId)
        .select()
        .single();

      if (error) {
        return NextResponse.json(
          { error: 'Failed to merge contacts' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        action: 'merged',
        contact: data,
      });
    } else if (action === 'create') {
      // Create as new contact (user confirmed it's not a duplicate)
      const { data, error } = await supabase
        .from('contacts')
        .insert({
          name: newContact.name,
          email: newContact.email,
          company: newContact.company,
          phone: newContact.phone,
          website: newContact.website,
          notes: newContact.notes,
          sheets_row_id: newContact.sheets_row_id,
          status: 'new',
          priority: 'medium',
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          return NextResponse.json(
            { error: 'A contact with this email already exists' },
            { status: 409 }
          );
        }
        return NextResponse.json(
          { error: 'Failed to create contact' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        action: 'created',
        contact: data,
      });
    } else if (action === 'skip') {
      // Skip this contact (don't import)
      return NextResponse.json({
        success: true,
        action: 'skipped',
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Must be merge, create, or skip' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Dedupe error:', error);
    return NextResponse.json(
      { error: 'Failed to process duplicate resolution' },
      { status: 500 }
    );
  }
}

// GET /api/contacts/dedupe - Find all potential duplicates in the database
export async function GET() {
  try {
    const { data: contacts, error } = await supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch contacts' },
        { status: 500 }
      );
    }

    // This would require implementing a function to find duplicates within existing contacts
    // For now, return empty array (this is primarily used for sheet imports)
    return NextResponse.json({ duplicates: [] });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to check for duplicates' },
      { status: 500 }
    );
  }
}
