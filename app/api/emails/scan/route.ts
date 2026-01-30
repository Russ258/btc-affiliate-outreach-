import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { getRecentMessages } from '@/lib/google/gmail';
import { shouldFlagEmail, requiresAction } from '@/lib/utils/email-flagging';
import { Contact } from '@/types';

// POST /api/emails/scan - Manually scan Gmail for new messages to flag
export async function POST() {
  try {
    // Fetch all contacts for matching
    const { data: contacts, error: contactsError } = await supabase
      .from('contacts')
      .select('*');

    if (contactsError) {
      return NextResponse.json(
        { error: 'Failed to fetch contacts' },
        { status: 500 }
      );
    }

    // Get recent Gmail messages
    const messages = await getRecentMessages(50);

    let flaggedCount = 0;
    const newlyFlagged = [];

    for (const message of messages) {
      // Check if already flagged
      const { data: existing } = await supabase
        .from('flagged_emails')
        .select('id')
        .eq('gmail_message_id', message.id)
        .single();

      if (existing) {
        continue; // Already flagged, skip
      }

      // Check if should be flagged
      const flagResult = shouldFlagEmail(
        message.fromEmail,
        message.subject,
        message.body || message.snippet,
        contacts as Contact[]
      );

      if (flagResult.shouldFlag) {
        // Insert into flagged_emails
        const { data: flagged, error: flagError } = await supabase
          .from('flagged_emails')
          .insert({
            gmail_message_id: message.id,
            from_email: message.fromEmail,
            subject: message.subject,
            snippet: message.snippet,
            contact_id: flagResult.contactId || null,
            is_read: !message.isUnread,
            action_required: requiresAction(
              message.subject,
              message.body || message.snippet
            ),
            received_at: message.date || new Date().toISOString(),
          })
          .select()
          .single();

        if (!flagError && flagged) {
          flaggedCount++;
          newlyFlagged.push({
            subject: message.subject,
            from: message.fromEmail,
            reason: flagResult.reason,
          });

          // If linked to contact, create communication record
          if (flagResult.contactId) {
            await supabase.from('communications').insert({
              contact_id: flagResult.contactId,
              type: 'email',
              direction: 'inbound',
              gmail_message_id: message.id,
              subject: message.subject,
              body: message.snippet,
              created_at: message.date || new Date().toISOString(),
            });

            // Update contact's last_contact_date
            await supabase
              .from('contacts')
              .update({ last_contact_date: new Date().toISOString() })
              .eq('id', flagResult.contactId);
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      scanned: messages.length,
      flagged: flaggedCount,
      newlyFlagged,
    });
  } catch (error) {
    console.error('Email scan error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to scan Gmail messages',
      },
      { status: 500 }
    );
  }
}
