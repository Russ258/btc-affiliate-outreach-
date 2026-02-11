import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Check auth
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const nameColumn = formData.get('nameColumn') as string || 'Name';
    const followerColumn = formData.get('followerColumn') as string || 'Follower Count';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Read CSV
    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());

    if (lines.length < 2) {
      return NextResponse.json({ error: 'CSV file is empty or invalid' }, { status: 400 });
    }

    // Parse header
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const nameIndex = headers.findIndex(h => h.toLowerCase() === nameColumn.toLowerCase());
    const followerIndex = headers.findIndex(h => h.toLowerCase() === followerColumn.toLowerCase());

    if (nameIndex === -1) {
      return NextResponse.json(
        { error: `Column "${nameColumn}" not found. Available columns: ${headers.join(', ')}` },
        { status: 400 }
      );
    }

    if (followerIndex === -1) {
      return NextResponse.json(
        { error: `Column "${followerColumn}" not found. Available columns: ${headers.join(', ')}` },
        { status: 400 }
      );
    }

    // Parse data rows
    let updated = 0;
    let notFound = 0;

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      const name = values[nameIndex];
      const followerCountStr = values[followerIndex];

      if (!name || !followerCountStr) continue;

      // Parse follower count (remove commas, K, M suffixes)
      let followerCount = 0;
      const cleaned = followerCountStr.replace(/,/g, '').toUpperCase();
      if (cleaned.includes('K')) {
        followerCount = Math.round(parseFloat(cleaned) * 1000);
      } else if (cleaned.includes('M')) {
        followerCount = Math.round(parseFloat(cleaned) * 1000000);
      } else {
        followerCount = parseInt(cleaned) || 0;
      }

      // Update contact by name (case-insensitive)
      const { data, error } = await supabase
        .from('contacts')
        .update({ follower_count: followerCount })
        .ilike('name', name)
        .select();

      if (error) {
        console.error(`Error updating ${name}:`, error);
        continue;
      }

      if (data && data.length > 0) {
        updated += data.length;
      } else {
        notFound++;
      }
    }

    return NextResponse.json({
      updated,
      notFound,
      total: lines.length - 1,
    });
  } catch (error: any) {
    console.error('Bulk follower update error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update follower counts' },
      { status: 500 }
    );
  }
}
