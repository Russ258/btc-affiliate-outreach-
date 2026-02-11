import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// GET /api/contacts - List contacts (personal or team based on view param)
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => Promise.resolve(cookieStore) });

    // Get current user
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const search = searchParams.get('search');
    const view = searchParams.get('view') || 'team'; // 'personal' or 'team'

    let query = supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false });

    // Filter based on view
    if (view === 'personal') {
      // Show only user's personal contacts (but they're still shared with team)
      query = query.eq('user_id', session.user.id);
    } else {
      // Show ALL team contacts (everyone's contacts)
      query = query.eq('is_shared', true);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (priority) {
      query = query.eq('priority', priority);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,twitter_handle.ilike.%${search}%,company.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ contacts: data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch contacts' },
      { status: 500 }
    );
  }
}

// POST /api/contacts - Create a new contact
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => Promise.resolve(cookieStore) });

    // Get current user
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const { data, error } = await supabase
      .from('contacts')
      .insert([
        {
          email: body.email || null,
          twitter_handle: body.twitter_handle || null,
          name: body.name,
          company: body.company,
          phone: body.phone,
          website: body.website,
          status: body.status || 'new',
          priority: body.priority || 'medium',
          notes: body.notes,
          tags: body.tags,
          first_contact_date: body.first_contact_date || null,
          next_followup_date: body.next_followup_date || null,
          user_id: session.user.id,
          is_shared: true, // Always shared with team
        },
      ])
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

    return NextResponse.json({ contact: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create contact' },
      { status: 500 }
    );
  }
}
