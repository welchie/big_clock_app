/**
 * Input length boundaries to protect against memory exhaustion,
 * uncontrolled copy-paste payloads, and UI frame freezes.
 */

export const INPUT_LIMITS = {
  TITLE_MAX_LENGTH: 120,
  NOTES_MAX_LENGTH: 1000,
  DATE_MAX_LENGTH: 10, // YYYY-MM-DD
  TIME_MAX_LENGTH: 5,  // HH:mm
} as const;

/**
 * Ensures text string does not exceed maximum allowable length.
 */
export function sanitizeInputLength(input: string | undefined | null, maxLength: number): string {
  if (!input || typeof input !== 'string') return '';
  return input.slice(0, maxLength);
}
