import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

/**
 * GET /api/blocklist - List all blocked names
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    // @ts-ignore
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('blocklist')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ blocklist: data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch blocklist' }, { status: 500 });
  }
}

/**
 * POST /api/blocklist - Add name(s) to blocklist
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    // @ts-ignore
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { names, reason } = body; // names can be a string (single) or array (bulk)

    const namesToBlock = Array.isArray(names)
      ? names.map(n => n.trim()).filter(Boolean)
      : [names.trim()].filter(Boolean);

    if (namesToBlock.length === 0) {
      return NextResponse.json({ error: 'No names provided' }, { status: 400 });
    }

    const entries = namesToBlock.map(name => ({
      name,
      reason: reason || null,
      added_by: session.user.id,
    }));

    const { data, error } = await supabase
      .from('blocklist')
      .insert(entries)
      .select();

    if (error) {
      // Handle duplicate error gracefully
      if (error.code === '23505') {
        return NextResponse.json({
          error: 'Some names are already in the blocklist',
          details: error.message
        }, { status: 409 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      added: data.length,
      blocklist: data
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add to blocklist' }, { status: 500 });
  }
}

/**
 * DELETE /api/blocklist - Remove name from blocklist
 */
export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    // @ts-ignore
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('blocklist')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to remove from blocklist' }, { status: 500 });
  }
}
