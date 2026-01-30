import { NextResponse } from 'next/server';
import { watchInbox, stopWatch } from '@/lib/google/gmail';
import { supabase } from '@/lib/supabase/client';

// POST /api/gmail/watch - Set up Gmail push notifications
export async function POST() {
  try {
    // In production, you need to create a Pub/Sub topic in Google Cloud
    // For now, this will return an error with instructions
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;

    if (!projectId) {
      return NextResponse.json(
        {
          error: 'Gmail push notifications not configured',
          message:
            'To enable real-time email monitoring, you need to:\n' +
            '1. Create a Google Cloud Pub/Sub topic\n' +
            '2. Set GOOGLE_CLOUD_PROJECT_ID in .env.local\n' +
            '3. Configure the webhook endpoint\n' +
            'For now, use the manual scan feature in Settings.',
        },
        { status: 400 }
      );
    }

    const topicName = `projects/${projectId}/topics/gmail-notifications`;

    const watchResponse = await watchInbox(topicName);

    // Store watch info in settings
    await supabase.from('settings').upsert(
      {
        key: 'gmail_watch',
        value: JSON.stringify({
          historyId: watchResponse.historyId,
          expiration: watchResponse.expiration,
          topicName,
        }),
      },
      { onConflict: 'key' }
    );

    return NextResponse.json({
      success: true,
      historyId: watchResponse.historyId,
      expiration: watchResponse.expiration,
    });
  } catch (error) {
    console.error('Gmail watch error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to set up Gmail watch',
      },
      { status: 500 }
    );
  }
}

// DELETE /api/gmail/watch - Stop Gmail push notifications
export async function DELETE() {
  try {
    await stopWatch();

    // Remove watch info from settings
    await supabase
      .from('settings')
      .delete()
      .eq('key', 'gmail_watch');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Gmail watch stop error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to stop Gmail watch',
      },
      { status: 500 }
    );
  }
}

// GET /api/gmail/watch - Check Gmail watch status
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'gmail_watch')
      .single();

    if (error || !data) {
      return NextResponse.json({ active: false });
    }

    const watchInfo = JSON.parse(data.value);
    const isExpired = watchInfo.expiration < Date.now();

    return NextResponse.json({
      active: !isExpired,
      ...watchInfo,
      isExpired,
    });
  } catch (error) {
    return NextResponse.json({ active: false });
  }
}
