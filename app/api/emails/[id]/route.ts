import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { markAsRead, markAsUnread } from '@/lib/google/gmail';

// PATCH /api/emails/[id] - Update flagged email status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Update in database
    const { data, error } = await supabase
      .from('flagged_emails')
      .update({
        is_read: body.is_read,
        action_required: body.action_required,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Update in Gmail if is_read changed
    if (body.is_read !== undefined && data.gmail_message_id) {
      try {
        if (body.is_read) {
          await markAsRead(data.gmail_message_id);
        } else {
          await markAsUnread(data.gmail_message_id);
        }
      } catch (gmailError) {
        console.error('Failed to update Gmail:', gmailError);
        // Continue even if Gmail update fails
      }
    }

    return NextResponse.json({ email: data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update email status' },
      { status: 500 }
    );
  }
}

// DELETE /api/emails/[id] - Remove email from flagged list
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { error } = await supabase
      .from('flagged_emails')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to remove flagged email' },
      { status: 500 }
    );
  }
}
