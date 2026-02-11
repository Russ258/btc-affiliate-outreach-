import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

/**
 * PATCH /api/daily-queue/[id]/mark-contacted
 * Marks a queue item as contacted
 * If it's a prospect, creates a contact record and moves the prospect to contacts
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('=== MARK CONTACTED START ===');
  try {
    const cookieStore = await cookies();
    console.log('Got cookies');
    // @ts-ignore
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    console.log('Got supabase client');

    const { data: { session } } = await supabase.auth.getSession();
    console.log('Got session:', !!session);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const queueId = parseInt(id);
    console.log('Queue ID:', queueId);

    if (isNaN(queueId)) {
      return NextResponse.json({ error: 'Invalid queue ID' }, { status: 400 });
    }

    // Step 1: Get the queue item to see if it's a contact or prospect
    console.log('Fetching queue item...');
    const { data: queueItem, error: fetchError } = await supabase
      .from('daily_queue')
      .select('contact_id, prospect_id')
      .eq('id', queueId)
      .single();

    console.log('Queue item:', queueItem);
    console.log('Fetch error:', fetchError);

    if (fetchError || !queueItem) {
      console.log('RETURNING: Queue item not found');
      return NextResponse.json({ error: 'Queue item not found' }, { status: 404 });
    }

    const isProspect = queueItem.prospect_id !== null;
    console.log('Is prospect:', isProspect);
    const today = new Date().toISOString();
    console.log('Today:', today);

    if (isProspect) {
      // PROSPECT PATH: Move prospect to contacts
      console.log('Fetching prospect details for ID:', queueItem.prospect_id);

      // Get prospect details
      const { data: prospect, error: prospectError } = await supabase
        .from('prospects')
        .select('*')
        .eq('id', queueItem.prospect_id)
        .single();

      console.log('Prospect:', prospect);
      console.log('Prospect error:', prospectError);

      if (prospectError || !prospect) {
        console.log('RETURNING: Prospect not found');
        return NextResponse.json({ error: prospectError?.message || 'Prospect not found' }, { status: 404 });
      }

      console.log('Creating contact from prospect...');

      // Create contact from prospect
      // If no twitter handle but has YouTube, use @youtube_channel as twitter_handle
      const contactData = {
        name: prospect.name,
        email: prospect.email,
        twitter_handle: prospect.twitter_handle || (prospect.youtube_channel ? `@${prospect.youtube_channel}` : null),
        website: prospect.website || prospect.youtube_url || null,
        status: 'contacted',
        priority: prospect.confidence === 'HIGH' ? 'high' : prospect.confidence === 'LOW' ? 'low' : 'medium',
        notes: `Discovered from ${prospect.source}${prospect.youtube_channel ? `\nYouTube: ${prospect.youtube_channel}` : ''}${prospect.bio ? `\n${prospect.bio}` : ''}`,
        first_contact_date: today,
        user_id: session.user.id,
        is_shared: true,
      };
      console.log('Contact data:', contactData);

      const { data: newContact, error: contactError } = await supabase
        .from('contacts')
        .insert([contactData])
        .select()
        .single();

      console.log('New contact:', newContact);
      console.log('Contact error:', contactError);

      if (contactError) {
        console.log('RETURNING CONTACT ERROR:', contactError.message);
        return NextResponse.json({ error: contactError.message }, { status: 500 });
      }

      console.log('Contact created successfully!');

      // Update prospect to mark as contacted and link to contact
      await supabase
        .from('prospects')
        .update({
          status: 'contacted',
          contacted_at: today,
          moved_to_contacts_at: today,
          contact_id: newContact.id,
        })
        .eq('id', queueItem.prospect_id);

      // Update queue state
      await supabase
        .from('daily_queue')
        .update({ state: 'contacted' })
        .eq('id', queueId);

      return NextResponse.json({
        ok: true,
        queue_id: queueId,
        was_prospect: true,
        prospect: prospect,
        new_contact: newContact,
      });

    } else {
      // CONTACT PATH: Just update the contact

      const { data: updatedContact, error: contactError } = await supabase
        .from('contacts')
        .update({
          status: 'contacted',
          first_contact_date: today,
        })
        .eq('id', queueItem.contact_id)
        .select()
        .single();

      if (contactError) {
        return NextResponse.json({ error: contactError.message }, { status: 500 });
      }

      // Update queue state
      await supabase
        .from('daily_queue')
        .update({ state: 'contacted' })
        .eq('id', queueId);

      return NextResponse.json({
        ok: true,
        queue_id: queueId,
        was_prospect: false,
        contact: updatedContact,
      });
    }

  } catch (error: any) {
    console.error('=== MARK CONTACTED ERROR ===');
    console.error('Error:', error);
    console.error('Message:', error?.message);
    console.error('Stack:', error?.stack);
    return NextResponse.json(
      { error: error?.message || 'Failed to mark as contacted' },
      { status: 500 }
    );
  }
}
