import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// GET /api/contacts/[id] - Get a single contact
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    // @ts-ignore - Next.js 15 compatibility: cookies() returns Promise but Supabase expects sync access
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    const { id } = await params;

    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ contact: data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch contact' },
      { status: 500 }
    );
  }
}

// PATCH /api/contacts/[id] - Update a contact
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    // @ts-ignore - Next.js 15 compatibility: cookies() returns Promise but Supabase expects sync access
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    const { id } = await params;
    const body = await request.json();

    // Auto-set follow-up date based on status
    let nextFollowupDate = body.next_followup_date;

    if (body.status === 'interested' || body.status === 'responded') {
      // Set follow-up for 5 days from now
      const followupDate = new Date();
      followupDate.setDate(followupDate.getDate() + 5);
      nextFollowupDate = followupDate.toISOString();
    } else if (body.status === 'accepted' || body.status === 'declined') {
      // Clear follow-up if deal is closed
      nextFollowupDate = null;
    }

    const { data, error } = await supabase
      .from('contacts')
      .update({
        email: body.email || null,
        twitter_handle: body.twitter_handle || null,
        name: body.name,
        company: body.company,
        phone: body.phone,
        website: body.website,
        status: body.status,
        priority: body.priority,
        comms: body.comms || null,
        notes: body.notes,
        tags: body.tags,
        first_contact_date: body.first_contact_date,
        last_contact_date: body.last_contact_date,
        next_followup_date: nextFollowupDate,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'A contact with this email or Twitter handle already exists' },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ contact: data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update contact' },
      { status: 500 }
    );
  }
}

// DELETE /api/contacts/[id] - Delete a contact
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    // @ts-ignore - Next.js 15 compatibility: cookies() returns Promise but Supabase expects sync access
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    const { id } = await params;

    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete contact' },
      { status: 500 }
    );
  }
}
