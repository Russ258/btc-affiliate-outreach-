import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// GET /api/analytics/follower-tiers - Get success rate by follower tier
export async function GET() {
  try {
    const cookieStore = await cookies();
    // @ts-ignore - Next.js 15 compatibility: cookies() returns Promise but Supabase expects sync access
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Check auth
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all contacts with follower counts
    const { data: contacts, error } = await supabase
      .from('contacts')
      .select('follower_count, status')
      .not('follower_count', 'is', null);

    if (error) {
      throw error;
    }

    // Define follower tiers
    const tiers = [
      { name: '0-10K', min: 0, max: 10000 },
      { name: '10K-50K', min: 10000, max: 50000 },
      { name: '50K-100K', min: 50000, max: 100000 },
      { name: '100K-500K', min: 100000, max: 500000 },
      { name: '500K+', min: 500000, max: Infinity },
    ];

    // Calculate stats for each tier
    const tierStats = tiers.map((tier) => {
      const tierContacts = contacts?.filter(
        (c) => c.follower_count >= tier.min && c.follower_count < tier.max
      ) || [];

      const total = tierContacts.length;
      const contacted = tierContacts.filter(
        (c) => ['contacted', 'responded', 'interested', 'accepted', 'declined'].includes(c.status)
      ).length;
      const accepted = tierContacts.filter((c) => c.status === 'accepted').length;
      const conversionRate = contacted > 0 ? Math.round((accepted / contacted) * 100) : 0;

      return {
        tier: tier.name,
        total,
        contacted,
        accepted,
        conversionRate,
      };
    });

    return NextResponse.json({ tiers: tierStats });
  } catch (error: any) {
    console.error('Follower tier analytics error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
