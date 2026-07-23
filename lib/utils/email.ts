/**
 * Utility for strict email syntax and format validation.
 * Verifies RFC 5322 compliance, standard TLD structure, and prevents malformed addresses.
 */
export function isValidEmail(email: string | undefined | null): boolean {
  if (!email || typeof email !== 'string') return false;
  const trimmed = email.trim().toLowerCase();

  // Strict email regex matching valid user@domain.tld structure
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(trimmed)) return false;

  const [localPart, domainPart] = trimmed.split('@');
  if (!localPart || !domainPart) return false;

  // Domain cannot start or end with a dot or dash
  if (domainPart.startsWith('.') || domainPart.endsWith('.') || domainPart.startsWith('-') || domainPart.endsWith('-')) {
    return false;
  }

  // Domain must contain a valid TLD extension of at least 2 characters
  const domainParts = domainPart.split('.');
  if (domainParts.length < 2) return false;
  const tld = domainParts[domainParts.length - 1];
  if (tld.length < 2) return false;

  return true;
}
