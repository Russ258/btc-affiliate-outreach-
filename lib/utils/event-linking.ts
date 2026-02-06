import { Contact } from '@/types';

// Links calendar events to contacts based on attendee emails
export function linkEventToContacts(
  attendeeEmails: string[],
  contacts: Contact[]
): {
  linkedContacts: Contact[];
  contactIds: string[];
} {
  const linkedContacts: Contact[] = [];
  const contactIds: string[] = [];

  for (const email of attendeeEmails) {
    const match = contacts.find(
      (c) => c.email && c.email.toLowerCase() === email.toLowerCase()
    );

    if (match && !contactIds.includes(match.id)) {
      linkedContacts.push(match);
      contactIds.push(match.id);
    }
  }

  return { linkedContacts, contactIds };
}

// Determines if an event is affiliate-related based on attendees and content
export function isAffiliateRelated(
  summary: string,
  description: string,
  attendeeEmails: string[],
  contacts: Contact[]
): {
  isRelated: boolean;
  reason: string;
  relatedContacts: Contact[];
} {
  const summaryLower = summary.toLowerCase();
  const descriptionLower = description.toLowerCase();

  // Check if any attendees are known contacts
  const { linkedContacts } = linkEventToContacts(attendeeEmails, contacts);

  if (linkedContacts.length > 0) {
    return {
      isRelated: true,
      reason: `Meeting with ${linkedContacts.length} contact${
        linkedContacts.length > 1 ? 's' : ''
      }: ${linkedContacts.map((c) => c.name).join(', ')}`,
      relatedContacts: linkedContacts,
    };
  }

  // Check for affiliate-related keywords
  const affiliateKeywords = [
    'partnership',
    'sponsor',
    'affiliate',
    'bitcoin conference',
    'btc conference',
    'booth',
    'exhibition',
    'speaking',
    'panel',
  ];

  const foundKeywords = affiliateKeywords.filter(
    (keyword) =>
      summaryLower.includes(keyword) || descriptionLower.includes(keyword)
  );

  if (foundKeywords.length > 0) {
    return {
      isRelated: true,
      reason: `Contains keywords: ${foundKeywords.join(', ')}`,
      relatedContacts: [],
    };
  }

  return {
    isRelated: false,
    reason: 'No matching criteria',
    relatedContacts: [],
  };
}

// Calculates priority score for an event (0-100)
export function calculateEventPriority(
  summary: string,
  description: string,
  attendeeEmails: string[],
  contacts: Contact[],
  startTime: string
): number {
  let score = 0;

  // Has linked contacts (+40)
  const { linkedContacts } = linkEventToContacts(attendeeEmails, contacts);
  if (linkedContacts.length > 0) {
    score += 40;

    // High priority contacts (+20)
    const hasHighPriority = linkedContacts.some((c) => c.priority === 'high');
    if (hasHighPriority) {
      score += 20;
    }
  }

  // Contains important keywords (+20)
  const importantKeywords = ['partnership', 'sponsor', 'bitcoin conference'];
  const text = `${summary} ${description}`.toLowerCase();
  const hasImportant = importantKeywords.some((k) => text.includes(k));
  if (hasImportant) {
    score += 20;
  }

  // Event is soon (+10 if within 24 hours)
  const start = new Date(startTime);
  const now = new Date();
  const hoursUntil = (start.getTime() - now.getTime()) / (1000 * 60 * 60);
  if (hoursUntil > 0 && hoursUntil <= 24) {
    score += 10;
  }

  // Multiple attendees (+10)
  if (attendeeEmails.length >= 3) {
    score += 10;
  }

  return Math.min(score, 100);
}

// Formats event time for display
export function formatEventTime(start: string, end: string, isAllDay: boolean): string {
  const startDate = new Date(start);
  const endDate = new Date(end);

  if (isAllDay) {
    return startDate.toLocaleDateString();
  }

  const sameDay = startDate.toDateString() === endDate.toDateString();

  if (sameDay) {
    return `${startDate.toLocaleString()} - ${endDate.toLocaleTimeString()}`;
  } else {
    return `${startDate.toLocaleString()} - ${endDate.toLocaleString()}`;
  }
}
