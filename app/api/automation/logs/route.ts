import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

// GET /api/automation/logs - Fetch automation job execution logs
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const jobName = searchParams.get('job_name');
    const limit = parseInt(searchParams.get('limit') || '50');

    let query = supabase
      .from('automation_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (jobName) {
      query = query.eq('job_name', jobName);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ logs: data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch automation logs' },
      { status: 500 }
    );
  }
}
