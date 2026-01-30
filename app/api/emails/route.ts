import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

// GET /api/emails - List flagged emails with optional filtering
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const isRead = searchParams.get('is_read');
    const actionRequired = searchParams.get('action_required');

    let query = supabase
      .from('flagged_emails')
      .select('*, contacts(name, company)')
      .order('received_at', { ascending: false });

    if (isRead !== null) {
      query = query.eq('is_read', isRead === 'true');
    }

    if (actionRequired !== null) {
      query = query.eq('action_required', actionRequired === 'true');
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ emails: data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch flagged emails' },
      { status: 500 }
    );
  }
}
