/**
 * Input validators and safe parsing helpers to prevent invalid date/time injection,
 * unhandled NaN exceptions, and UI errors.
 */

const ISO_DATE_REGEX = /^\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])$/;
const TIME_24H_REGEX = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

/**
 * Validates that a string is in valid YYYY-MM-DD format and represents
 * a real calendar date (including leap year validation).
 */
export function isValidISODate(dateStr: string): boolean {
  if (!dateStr || typeof dateStr !== 'string') return false;
  if (!ISO_DATE_REGEX.test(dateStr)) return false;

  const [year, month, day] = dateStr.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);

  return (
    dateObj.getFullYear() === year &&
    dateObj.getMonth() === month - 1 &&
    dateObj.getDate() === day
  );
}

/**
 * Validates that a string is a valid 24-hour time format (HH:mm)
 * from 00:00 to 23:59.
 */
export function isValidTime24(timeStr: string): boolean {
  if (!timeStr || typeof timeStr !== 'string') return false;
  return TIME_24H_REGEX.test(timeStr);
}

/**
 * Safely parses a date and time string into a JavaScript Date object.
 * Returns null if either input is invalid or if the resulting Date is NaN.
 */
export function parseTriggerDate(dateStr: string, timeStr: string): Date | null {
  if (!isValidISODate(dateStr) || !isValidTime24(timeStr)) {
    return null;
  }

  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes] = timeStr.split(':').map(Number);

  const date = new Date(year, month - 1, day, hours, minutes, 0, 0);

  if (isNaN(date.getTime())) {
    return null;
  }

  return date;
}
