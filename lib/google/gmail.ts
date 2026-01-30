import { google } from 'googleapis';
import { getAuthenticatedClient } from './auth';

// Fetches recent messages from Gmail inbox
export async function listMessages(maxResults: number = 10) {
  try {
    const auth = await getAuthenticatedClient();
    const gmail = google.gmail({ version: 'v1', auth });

    const response = await gmail.users.messages.list({
      userId: 'me',
      maxResults,
      labelIds: ['INBOX'],
    });

    return response.data.messages || [];
  } catch (error) {
    console.error('Error listing messages:', error);
    throw new Error('Failed to fetch Gmail messages');
  }
}

// Gets detailed information about a specific email message
export async function getMessage(messageId: string) {
  try {
    const auth = await getAuthenticatedClient();
    const gmail = google.gmail({ version: 'v1', auth });

    const response = await gmail.users.messages.get({
      userId: 'me',
      id: messageId,
      format: 'full',
    });

    return response.data;
  } catch (error) {
    console.error('Error getting message:', error);
    throw new Error('Failed to fetch message details');
  }
}

// Searches Gmail messages using Gmail query syntax
export async function searchMessages(query: string, maxResults: number = 50) {
  try {
    const auth = await getAuthenticatedClient();
    const gmail = google.gmail({ version: 'v1', auth });

    const response = await gmail.users.messages.list({
      userId: 'me',
      q: query,
      maxResults,
    });

    return response.data.messages || [];
  } catch (error) {
    console.error('Error searching messages:', error);
    throw new Error('Failed to search Gmail messages');
  }
}

// Modifies labels on a message (mark as read, archive, etc)
export async function modifyMessage(
  messageId: string,
  addLabelIds?: string[],
  removeLabelIds?: string[]
) {
  try {
    const auth = await getAuthenticatedClient();
    const gmail = google.gmail({ version: 'v1', auth });

    const response = await gmail.users.messages.modify({
      userId: 'me',
      id: messageId,
      requestBody: {
        addLabelIds,
        removeLabelIds,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error modifying message:', error);
    throw new Error('Failed to modify message');
  }
}

// Marks a message as read
export async function markAsRead(messageId: string) {
  return modifyMessage(messageId, undefined, ['UNREAD']);
}

// Marks a message as unread
export async function markAsUnread(messageId: string) {
  return modifyMessage(messageId, ['UNREAD'], undefined);
}

// Sets up Gmail push notifications to receive real-time email updates
export async function watchInbox(topicName: string) {
  try {
    const auth = await getAuthenticatedClient();
    const gmail = google.gmail({ version: 'v1', auth });

    const response = await gmail.users.watch({
      userId: 'me',
      requestBody: {
        topicName,
        labelIds: ['INBOX'],
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error setting up Gmail watch:', error);
    throw new Error('Failed to set up Gmail push notifications');
  }
}

// Stops Gmail push notifications
export async function stopWatch() {
  try {
    const auth = await getAuthenticatedClient();
    const gmail = google.gmail({ version: 'v1', auth });

    await gmail.users.stop({
      userId: 'me',
    });

    return { success: true };
  } catch (error) {
    console.error('Error stopping Gmail watch:', error);
    throw new Error('Failed to stop Gmail watch');
  }
}

// Parses email message to extract useful fields
export function parseEmailMessage(message: any) {
  const headers = message.payload?.headers || [];

  const getHeader = (name: string) => {
    const header = headers.find(
      (h: any) => h.name.toLowerCase() === name.toLowerCase()
    );
    return header?.value || '';
  };

  const from = getHeader('From');
  const to = getHeader('To');
  const subject = getHeader('Subject');
  const date = getHeader('Date');

  // Extract email address from "Name <email@example.com>" format
  const extractEmail = (str: string) => {
    const match = str.match(/<(.+?)>/);
    return match ? match[1] : str;
  };

  const fromEmail = extractEmail(from);

  // Get snippet (preview text)
  const snippet = message.snippet || '';

  // Get message body
  let body = '';
  if (message.payload?.parts) {
    // Multipart message
    const textPart = message.payload.parts.find(
      (part: any) => part.mimeType === 'text/plain'
    );
    if (textPart?.body?.data) {
      body = Buffer.from(textPart.body.data, 'base64').toString('utf-8');
    }
  } else if (message.payload?.body?.data) {
    // Simple message
    body = Buffer.from(message.payload.body.data, 'base64').toString('utf-8');
  }

  return {
    id: message.id,
    threadId: message.threadId,
    from,
    fromEmail,
    to,
    subject,
    date,
    snippet,
    body,
    labelIds: message.labelIds || [],
    isUnread: message.labelIds?.includes('UNREAD') || false,
  };
}

// Gets the most recent messages and returns parsed details
export async function getRecentMessages(count: number = 20) {
  const messages = await listMessages(count);
  const details = await Promise.all(
    messages.map(async (msg: any) => {
      const fullMessage = await getMessage(msg.id);
      return parseEmailMessage(fullMessage);
    })
  );
  return details;
}
