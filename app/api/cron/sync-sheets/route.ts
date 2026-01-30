import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { validateCronRequest, unauthorizedResponse } from '@/lib/utils/cron-auth';
import { readSheet, parseSheetData } from '@/lib/google/sheets';
import { findDuplicates } from '@/lib/utils/dedupe';
import { Contact } from '@/types';

// GET /api/cron/sync-sheets - Automatically syncs Google Sheets daily at midnight
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  // Validate cron authorization
  if (!validateCronRequest(request)) {
    return unauthorizedResponse();
  }

  try {
    // Log job start
    await supabase.from('automation_logs').insert({
      job_name: 'sync-sheets',
      status: 'running',
      message: 'Starting automatic Google Sheets sync',
    });

    // Get saved sheets configuration
    const { data: configData } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'sheets_config')
      .single();

    if (!configData) {
      const executionTime = Date.now() - startTime;
      await supabase.from('automation_logs').insert({
        job_name: 'sync-sheets',
        status: 'success',
        message: 'No sheets configuration found - skipping sync',
        execution_time_ms: executionTime,
      });

      return NextResponse.json({
        success: true,
        skipped: true,
        message: 'No sheets configuration',
      });
    }

    const config = JSON.parse(configData.value);
    const { spreadsheetId, sheetName, columnMapping } = config;

    // Read data from Google Sheets
    const range = `${sheetName}!A:Z`;
    const rows = await readSheet(spreadsheetId, range);

    if (!rows || rows.length === 0) {
      throw new Error('No data found in spreadsheet');
    }

    // Parse sheet data
    const parsedContacts = parseSheetData(rows, columnMapping);

    // Fetch existing contacts for duplicate detection
    const { data: existingContacts } = await supabase
      .from('contacts')
      .select('*');

    let imported = 0;
    let duplicatesFound = 0;
    let updated = 0;

    for (const contact of parsedContacts) {
      const matches = findDuplicates(contact, existingContacts || []);

      if (matches.length === 0) {
        // No duplicates, insert new contact
        const { error } = await supabase.from('contacts').insert({
          name: contact.name,
          email: contact.email,
          company: contact.company,
          phone: contact.phone,
          website: contact.website,
          notes: contact.notes,
          sheets_row_id: contact.sheets_row_id,
          status: 'new',
          priority: 'medium',
        });

        if (!error) {
          imported++;
        }
      } else {
        // Found duplicates - auto-merge high-confidence matches (90%+)
        const highConfidenceMatch = matches.find((m) => m.confidence >= 90);

        if (highConfidenceMatch) {
          // Update existing contact with new data
          const existingId = highConfidenceMatch.existingContact.id;

          const { error } = await supabase
            .from('contacts')
            .update({
              // Only update if new data is provided
              company: contact.company || highConfidenceMatch.existingContact.company,
              phone: contact.phone || highConfidenceMatch.existingContact.phone,
              website: contact.website || highConfidenceMatch.existingContact.website,
              notes: contact.notes
                ? highConfidenceMatch.existingContact.notes
                  ? `${highConfidenceMatch.existingContact.notes}\n\n---\n\n${contact.notes}`
                  : contact.notes
                : highConfidenceMatch.existingContact.notes,
              sheets_row_id: contact.sheets_row_id,
            })
            .eq('id', existingId);

          if (!error) {
            updated++;
          }
        } else {
          // Lower confidence - skip for manual review
          duplicatesFound++;
        }
      }
    }

    const executionTime = Date.now() - startTime;

    const message = [
      `Synced ${parsedContacts.length} rows from Google Sheets`,
      `- ${imported} new contacts imported`,
      `- ${updated} existing contacts updated`,
      `- ${duplicatesFound} potential duplicates skipped`,
    ].join('\n');

    // Log success
    await supabase.from('automation_logs').insert({
      job_name: 'sync-sheets',
      status: 'success',
      message,
      execution_time_ms: executionTime,
    });

    return NextResponse.json({
      success: true,
      processed: parsedContacts.length,
      imported,
      updated,
      duplicatesFound,
      executionTime,
    });
  } catch (error) {
    const executionTime = Date.now() - startTime;
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';

    // Log failure
    await supabase.from('automation_logs').insert({
      job_name: 'sync-sheets',
      status: 'failed',
      message: `Error: ${errorMessage}`,
      execution_time_ms: executionTime,
    });

    return NextResponse.json(
      {
        error: 'Failed to sync Google Sheets',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
