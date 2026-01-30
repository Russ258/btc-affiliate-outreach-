import { NextRequest, NextResponse } from 'next/server';

// POST /api/gmail/webhook - Receives Gmail push notifications from Google Cloud Pub/Sub
export async function POST(request: NextRequest) {
  try {
    // Gmail push notifications come via Google Cloud Pub/Sub
    // The message is base64 encoded in the request body
    const body = await request.json();

    // Decode the Pub/Sub message
    const message = body.message;
    if (!message || !message.data) {
      return NextResponse.json({ error: 'Invalid message format' }, { status: 400 });
    }

    // Decode base64 data
    const decodedData = Buffer.from(message.data, 'base64').toString('utf-8');
    const notification = JSON.parse(decodedData);

    console.log('Gmail notification received:', notification);

    // The notification contains:
    // - emailAddress: The user's email
    // - historyId: The history ID to fetch changes from

    // In a full implementation, you would:
    // 1. Use historyId to fetch what changed
    // 2. Get new messages
    // 3. Run flagging logic
    // 4. Store flagged emails

    // For now, trigger a manual scan when notification is received
    // This is a simplified approach
    try {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/emails/scan`, {
        method: 'POST',
      });
    } catch (scanError) {
      console.error('Failed to trigger email scan:', scanError);
    }

    // Acknowledge receipt (required by Pub/Sub)
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Gmail webhook error:', error);
    return NextResponse.json(
      { error: 'Failed to process Gmail notification' },
      { status: 500 }
    );
  }
}

// GET /api/gmail/webhook - Endpoint info (for testing)
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/gmail/webhook',
    method: 'POST',
    description: 'Receives Gmail push notifications from Google Cloud Pub/Sub',
    status: 'ready',
    note: 'This endpoint requires Google Cloud Pub/Sub setup. See documentation for details.',
  });
}
