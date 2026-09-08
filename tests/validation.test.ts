import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  isValidISODate,
  isValidTime24,
  parseTriggerDate,
} from '../utils/validators';

describe('VULN-01: Date & Time Validation', () => {
  describe('isValidISODate', () => {
    it('accepts valid calendar dates in YYYY-MM-DD format', () => {
      assert.strictEqual(isValidISODate('2026-09-08'), true);
      assert.strictEqual(isValidISODate('2025-01-01'), true);
      assert.strictEqual(isValidISODate('2024-12-31'), true);
    });

    it('validates leap years accurately', () => {
      // 2024 is a leap year (Feb 29 exists)
      assert.strictEqual(isValidISODate('2024-02-29'), true);
      // 2025 is not a leap year (Feb 29 does not exist)
      assert.strictEqual(isValidISODate('2025-02-29'), false);
      assert.strictEqual(isValidISODate('2026-02-29'), false);
    });

    it('rejects invalid day values for specific months', () => {
      // April only has 30 days
      assert.strictEqual(isValidISODate('2026-04-31'), false);
      // June only has 30 days
      assert.strictEqual(isValidISODate('2026-06-31'), false);
      // February non-leap year
      assert.strictEqual(isValidISODate('2026-02-30'), false);
    });

    it('rejects malformed formats and non-date strings', () => {
      assert.strictEqual(isValidISODate('2026/09/08'), false);
      assert.strictEqual(isValidISODate('08-09-2026'), false);
      assert.strictEqual(isValidISODate('2026-9-8'), false);
      assert.strictEqual(isValidISODate('invalid-date'), false);
      assert.strictEqual(isValidISODate(''), false);
      assert.strictEqual(isValidISODate(null as unknown as string), false);
    });
  });

  describe('isValidTime24', () => {
    it('accepts valid 24-hour times from 00:00 to 23:59', () => {
      assert.strictEqual(isValidTime24('00:00'), true);
      assert.strictEqual(isValidTime24('09:30'), true);
      assert.strictEqual(isValidTime24('14:45'), true);
      assert.strictEqual(isValidTime24('23:59'), true);
    });

    it('rejects hours >= 24', () => {
      assert.strictEqual(isValidTime24('24:00'), false);
      assert.strictEqual(isValidTime24('25:30'), false);
      assert.strictEqual(isValidTime24('99:00'), false);
    });

    it('rejects minutes >= 60', () => {
      assert.strictEqual(isValidTime24('12:60'), false);
      assert.strictEqual(isValidTime24('14:99'), false);
    });

    it('rejects non-standard formats and 12-hour AM/PM notation', () => {
      assert.strictEqual(isValidTime24('2:30 PM'), false);
      assert.strictEqual(isValidTime24('9:30'), false); // needs leading zero
      assert.strictEqual(isValidTime24('abc'), false);
      assert.strictEqual(isValidTime24(''), false);
      assert.strictEqual(isValidTime24(undefined as unknown as string), false);
    });
  });

  describe('parseTriggerDate', () => {
    it('safely parses valid date and time into a Date object', () => {
      const parsed = parseTriggerDate('2026-09-08', '14:30');
      assert.notStrictEqual(parsed, null);
      assert.strictEqual(parsed instanceof Date, true);
      assert.strictEqual(isNaN(parsed!.getTime()), false);
      assert.strictEqual(parsed!.getFullYear(), 2026);
      assert.strictEqual(parsed!.getMonth(), 8); // 0-indexed: 8 = September
      assert.strictEqual(parsed!.getDate(), 8);
      assert.strictEqual(parsed!.getHours(), 14);
      assert.strictEqual(parsed!.getMinutes(), 30);
    });

    it('returns null on invalid date or time, preventing NaN propagation', () => {
      assert.strictEqual(parseTriggerDate('invalid', '14:30'), null);
      assert.strictEqual(parseTriggerDate('2026-02-31', '14:30'), null);
      assert.strictEqual(parseTriggerDate('2026-09-08', '25:00'), null);
      assert.strictEqual(parseTriggerDate('2026-09-08', 'invalid'), null);
      assert.strictEqual(parseTriggerDate('', ''), null);
    });
  });
});
