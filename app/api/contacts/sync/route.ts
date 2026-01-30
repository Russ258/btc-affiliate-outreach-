import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { readSheet, parseSheetData } from '@/lib/google/sheets';
import { findDuplicates } from '@/lib/utils/dedupe';
import { Contact } from '@/types';

// POST /api/contacts/sync - Import contacts from Google Sheets with duplicate detection
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { spreadsheetId, sheetName, columnMapping } = body;

    if (!spreadsheetId || !sheetName) {
      return NextResponse.json(
        { error: 'Spreadsheet ID and sheet name are required' },
        { status: 400 }
      );
    }

    // Read data from Google Sheets
    const range = `${sheetName}!A:Z`;
    const rows = await readSheet(spreadsheetId, range);

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { error: 'No data found in spreadsheet' },
        { status: 400 }
      );
    }

    // Parse sheet data into contact objects
    const parsedContacts = parseSheetData(rows, columnMapping);

    if (parsedContacts.length === 0) {
      return NextResponse.json(
        { error: 'No valid contacts found in spreadsheet' },
        { status: 400 }
      );
    }

    // Fetch existing contacts for duplicate detection
    const { data: existingContacts, error: fetchError } = await supabase
      .from('contacts')
      .select('*');

    if (fetchError) {
      return NextResponse.json(
        { error: 'Failed to fetch existing contacts' },
        { status: 500 }
      );
    }

    // Detect duplicates and categorize contacts
    const newContacts: any[] = [];
    const duplicates: any[] = [];

    for (const contact of parsedContacts) {
      const matches = findDuplicates(contact, existingContacts || []);

      if (matches.length > 0) {
        // Found potential duplicates
        duplicates.push({
          newContact: contact,
          matches: matches.map((m) => ({
            id: m.existingContact.id,
            name: m.existingContact.name,
            email: m.existingContact.email,
            company: m.existingContact.company,
            confidence: m.confidence,
            reasons: m.reasons,
          })),
        });
      } else {
        // No duplicates, safe to import
        newContacts.push(contact);
      }
    }

    // Import new contacts (auto-import non-duplicates)
    let importedCount = 0;
    if (newContacts.length > 0) {
      const contactsToInsert = newContacts.map((c) => ({
        name: c.name,
        email: c.email,
        company: c.company,
        phone: c.phone,
        website: c.website,
        notes: c.notes,
        sheets_row_id: c.sheets_row_id,
        status: 'new',
        priority: 'medium',
      }));

      const { data, error } = await supabase
        .from('contacts')
        .insert(contactsToInsert)
        .select();

      if (error) {
        console.error('Error inserting contacts:', error);
      } else {
        importedCount = data?.length || 0;
      }
    }

    // Store spreadsheet config in settings for future syncs
    await supabase.from('settings').upsert(
      {
        key: 'sheets_config',
        value: JSON.stringify({ spreadsheetId, sheetName, columnMapping }),
      },
      { onConflict: 'key' }
    );

    return NextResponse.json({
      success: true,
      imported: importedCount,
      duplicatesFound: duplicates.length,
      duplicates: duplicates,
      totalProcessed: parsedContacts.length,
    });
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to sync contacts from Google Sheets',
      },
      { status: 500 }
    );
  }
}

// GET /api/contacts/sync - Get current sheets configuration
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'sheets_config')
      .single();

    if (error || !data) {
      return NextResponse.json({ config: null });
    }

    return NextResponse.json({ config: JSON.parse(data.value) });
  } catch (error) {
    return NextResponse.json({ config: null });
  }
}
