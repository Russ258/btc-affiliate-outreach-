import { Contact } from '@/types';

// Calculates Levenshtein distance between two strings for name similarity matching
function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix: number[][] = [];

  if (len1 === 0) return len2;
  if (len2 === 0) return len1;

  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[len1][len2];
}

// Normalizes phone number by removing all non-digit characters for comparison
function normalizePhone(phone: string | undefined): string {
  if (!phone) return '';
  return phone.replace(/\D/g, '');
}

// Extracts domain from email address for domain-based duplicate detection
function getEmailDomain(email: string): string {
  const parts = email.split('@');
  return parts.length > 1 ? parts[1].toLowerCase() : '';
}

// Normalizes company name by removing common suffixes and converting to lowercase
function normalizeCompanyName(company: string | undefined): string {
  if (!company) return '';
  return company
    .toLowerCase()
    .replace(/\b(inc|llc|ltd|corp|corporation|company|co)\b\.?/g, '')
    .trim();
}

export interface DuplicateMatch {
  existingContact: Contact;
  confidence: number;
  reasons: string[];
}

// Detects potential duplicate contacts based on email, phone, name similarity, and domain+company matching
export function findDuplicates(
  newContact: Partial<Contact>,
  existingContacts: Contact[]
): DuplicateMatch[] {
  const matches: DuplicateMatch[] = [];

  for (const existing of existingContacts) {
    const reasons: string[] = [];
    let confidence = 0;

    // 1. Exact email match (highest priority - 100% confidence)
    if (
      newContact.email &&
      existing.email &&
      newContact.email.toLowerCase() === existing.email.toLowerCase()
    ) {
      reasons.push('Exact email match');
      confidence = 100;
      matches.push({ existingContact: existing, confidence, reasons });
      continue; // No need to check other criteria
    }

    // 2. Phone number match (normalized - 90% confidence)
    if (newContact.phone && existing.phone) {
      const newPhone = normalizePhone(newContact.phone);
      const existingPhone = normalizePhone(existing.phone);
      if (newPhone && existingPhone && newPhone === existingPhone) {
        reasons.push('Phone number match');
        confidence = Math.max(confidence, 90);
      }
    }

    // 3. Name similarity (Levenshtein distance < 3 - 70-85% confidence)
    if (newContact.name && existing.name) {
      const distance = levenshteinDistance(
        newContact.name.toLowerCase(),
        existing.name.toLowerCase()
      );
      if (distance <= 2) {
        reasons.push(`Similar name (edit distance: ${distance})`);
        confidence = Math.max(confidence, 85 - distance * 5);
      }
    }

    // 4. Same domain + similar company name (80% confidence)
    if (newContact.email && existing.email && newContact.company && existing.company) {
      const newDomain = getEmailDomain(newContact.email);
      const existingDomain = getEmailDomain(existing.email);
      const newCompany = normalizeCompanyName(newContact.company);
      const existingCompany = normalizeCompanyName(existing.company);

      if (
        newDomain &&
        existingDomain &&
        newDomain === existingDomain &&
        newCompany &&
        existingCompany
      ) {
        const companyDistance = levenshteinDistance(newCompany, existingCompany);
        if (companyDistance <= 3) {
          reasons.push('Same email domain and similar company name');
          confidence = Math.max(confidence, 80);
        }
      }
    }

    // Add to matches if confidence is above threshold (70%)
    if (confidence >= 70 && reasons.length > 0) {
      matches.push({ existingContact: existing, confidence, reasons });
    }
  }

  // Sort by confidence (highest first)
  return matches.sort((a, b) => b.confidence - a.confidence);
}

// Merges two contact records by combining data from both with preference for newer data
export function mergeContacts(
  existing: Contact,
  newData: Partial<Contact>
): Partial<Contact> {
  return {
    // Keep existing ID
    id: existing.id,

    // Use new data if provided, otherwise keep existing
    name: newData.name || existing.name,
    email: newData.email || existing.email,
    company: newData.company || existing.company,
    phone: newData.phone || existing.phone,
    website: newData.website || existing.website,

    // Preserve status and priority from existing unless explicitly changed
    status: newData.status || existing.status,
    priority: newData.priority || existing.priority,

    // Merge notes (append new to existing)
    notes: newData.notes
      ? existing.notes
        ? `${existing.notes}\n\n---\n\n${newData.notes}`
        : newData.notes
      : existing.notes,

    // Merge tags (combine unique tags)
    tags: Array.from(
      new Set([...(existing.tags || []), ...(newData.tags || [])])
    ),

    // Keep earliest contact date
    first_contact_date:
      existing.first_contact_date ||
      newData.first_contact_date ||
      undefined,

    // Use latest contact date
    last_contact_date: newData.last_contact_date || existing.last_contact_date,

    // Use new follow-up date if provided
    next_followup_date:
      newData.next_followup_date || existing.next_followup_date,

    // Keep sheets row ID from new data
    sheets_row_id: newData.sheets_row_id || existing.sheets_row_id,
  };
}

// Returns statistics about duplicate detection results
export function getDedupeStats(matches: DuplicateMatch[]) {
  return {
    totalMatches: matches.length,
    highConfidence: matches.filter((m) => m.confidence >= 90).length,
    mediumConfidence: matches.filter(
      (m) => m.confidence >= 75 && m.confidence < 90
    ).length,
    lowConfidence: matches.filter((m) => m.confidence < 75).length,
  };
}
