import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// GET /api/users - Get all team members
export async function GET() {
  try {
    // Use service role to access auth.users
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Get all users from auth
    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();

    if (error) {
      throw error;
    }

    // Format user list - only include @btcmedia.org users
    const teamMembers = users
      .filter(user => user.email?.endsWith('@btcmedia.org'))
      .map(user => ({
        id: user.id,
        email: user.email,
        name: user.email?.split('@')[0]?.replace('.', ' ') || 'Unknown',
      }));

    return NextResponse.json({ users: teamMembers });
  } catch (error: any) {
    console.error('Fetch users error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
