import { Contact } from '@/types';

// Keywords that indicate an important affiliate-related email
const FLAGGING_KEYWORDS = [
  'partnership',
  'sponsor',
  'sponsorship',
  'affiliate',
  'interested',
  'meeting',
  'call',
  'discuss',
  'collaboration',
  'opportunity',
  'proposal',
  'bitcoin conference',
  'btc conference',
  'booth',
  'exhibition',
  'speaking',
  'panel',
];

// Determines if an email should be flagged based on sender and content
export function shouldFlagEmail(
  fromEmail: string,
  subject: string,
  body: string,
  contacts: Contact[]
): {
  shouldFlag: boolean;
  reason: string;
  contactId?: string;
  priority: 'high' | 'medium' | 'low';
} {
  const emailLower = fromEmail.toLowerCase();
  const subjectLower = subject.toLowerCase();
  const bodyLower = body.toLowerCase();

  // Check if sender is a known contact (only check contacts with email)
  const matchingContact = contacts.find(
    (c) => c.email && c.email.toLowerCase() === emailLower
  );

  if (matchingContact) {
    // Email from known contact - always flag
    return {
      shouldFlag: true,
      reason: `Email from known contact: ${matchingContact.name}`,
      contactId: matchingContact.id,
      priority: matchingContact.priority === 'high' ? 'high' : 'medium',
    };
  }

  // Check for flagging keywords in subject or body
  const foundKeywords = FLAGGING_KEYWORDS.filter(
    (keyword) =>
      subjectLower.includes(keyword) || bodyLower.includes(keyword)
  );

  if (foundKeywords.length > 0) {
    // Email contains relevant keywords
    const priority = foundKeywords.some((k) =>
      ['partnership', 'sponsor', 'interested'].includes(k)
    )
      ? 'high'
      : 'medium';

    return {
      shouldFlag: true,
      reason: `Contains keywords: ${foundKeywords.slice(0, 3).join(', ')}`,
      priority,
    };
  }

  // Check if email domain matches any contact's domain
  const emailDomain = emailLower.split('@')[1];
  if (emailDomain) {
    const domainMatch = contacts.find((c) => {
      if (!c.email) return false;
      const contactDomain = c.email.toLowerCase().split('@')[1];
      return contactDomain === emailDomain;
    });

    if (domainMatch) {
      return {
        shouldFlag: true,
        reason: `Same domain as contact: ${domainMatch.name} (${domainMatch.company || 'unknown company'})`,
        contactId: domainMatch.id,
        priority: 'low',
      };
    }
  }

  // Don't flag this email
  return {
    shouldFlag: false,
    reason: 'No matching criteria',
    priority: 'low',
  };
}

// Extracts action items from email content
export function extractActionItems(subject: string, body: string): string[] {
  const actions: string[] = [];
  const text = `${subject} ${body}`.toLowerCase();

  if (text.includes('schedule') || text.includes('meeting')) {
    actions.push('Schedule meeting');
  }
  if (text.includes('call') || text.includes('phone')) {
    actions.push('Return call');
  }
  if (text.includes('proposal') || text.includes('quote')) {
    actions.push('Review proposal');
  }
  if (text.includes('contract') || text.includes('agreement')) {
    actions.push('Review contract');
  }
  if (text.includes('question') || text.includes('clarif')) {
    actions.push('Answer questions');
  }
  if (text.includes('interested') || text.includes('learn more')) {
    actions.push('Follow up with information');
  }

  return actions;
}

// Determines if an email requires immediate action
export function requiresAction(subject: string, body: string): boolean {
  const urgentKeywords = [
    'urgent',
    'asap',
    'deadline',
    'today',
    'immediately',
    'time-sensitive',
    'respond by',
    'final',
    'last chance',
  ];

  const text = `${subject} ${body}`.toLowerCase();

  return urgentKeywords.some((keyword) => text.includes(keyword));
}

// Calculates a priority score for an email (0-100)
export function calculateEmailPriority(
  fromEmail: string,
  subject: string,
  body: string,
  contacts: Contact[]
): number {
  let score = 0;

  // Known contact (+30)
  const matchingContact = contacts.find(
    (c) => c.email && c.email.toLowerCase() === fromEmail.toLowerCase()
  );
  if (matchingContact) {
    score += 30;
    if (matchingContact.priority === 'high') score += 20;
  }

  // Urgent keywords (+20)
  if (requiresAction(subject, body)) {
    score += 20;
  }

  // High-value keywords (+10 each, max 30)
  const highValueKeywords = ['partnership', 'sponsor', 'interested'];
  const text = `${subject} ${body}`.toLowerCase();
  const foundHighValue = highValueKeywords.filter((k) => text.includes(k));
  score += Math.min(foundHighValue.length * 10, 30);

  // Subject contains conference name (+10)
  if (
    subject.toLowerCase().includes('bitcoin conference') ||
    subject.toLowerCase().includes('btc conference')
  ) {
    score += 10;
  }

  return Math.min(score, 100);
}
