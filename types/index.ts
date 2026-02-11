export type ContactStatus = 'new' | 'contacted' | 'responded' | 'interested' | 'accepted' | 'declined';
export type ContactPriority = 'low' | 'medium' | 'high';
export type CommunicationType = 'email' | 'call' | 'meeting';
export type CommunicationDirection = 'inbound' | 'outbound';
export type CommsChannel = 'x' | 'instagram' | 'telegram' | 'email' | 'whatsapp' | 'messages';

export interface Contact {
  id: string;
  email?: string; // Made optional - can use twitter_handle instead
  twitter_handle?: string; // Twitter/X handle without @ symbol
  name: string;
  company?: string;
  phone?: string;
  website?: string;
  status: ContactStatus;
  priority: ContactPriority;
  follower_count?: number; // Twitter/X follower count
  comms?: CommsChannel; // Preferred communication channel
  first_contact_date?: string;
  last_contact_date?: string;
  next_followup_date?: string;
  sheets_row_id?: number;
  notes?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface Communication {
  id: string;
  contact_id: string;
  type: CommunicationType;
  direction?: CommunicationDirection;
  gmail_message_id?: string;
  calendar_event_id?: string;
  subject?: string;
  body?: string;
  scheduled_for?: string;
  created_at: string;
}

export interface CalendarEvent {
  id: string;
  google_event_id: string;
  summary?: string;
  description?: string;
  start_time: string;
  end_time: string;
  related_contact_ids?: string[];
  created_at: string;
  updated_at: string;
}

export interface FlaggedEmail {
  id: string;
  gmail_message_id: string;
  from_email: string;
  subject?: string;
  snippet?: string;
  contact_id?: string;
  is_read: boolean;
  action_required: boolean;
  received_at: string;
  created_at: string;
}

export interface Setting {
  key: string;
  value: string;
  created_at: string;
  updated_at: string;
}

export interface AutomationLog {
  id: string;
  job_name: string;
  status: 'running' | 'success' | 'failed';
  message?: string;
  execution_time_ms?: number;
  created_at: string;
}
