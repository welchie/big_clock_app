import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  isValidReminder,
  validateRemindersArray,
  validateSettingsObject,
  DEFAULT_SETTINGS,
} from '../services/storage';

describe('VULN-02: Storage Schema Validation & Deserialization Defense', () => {
  describe('isValidReminder', () => {
    it('accepts well-formed Reminder objects', () => {
      const valid = {
        id: 'rem-123',
        title: 'Meeting',
        notes: 'Project review',
        date: '2026-09-08',
        time: '14:00',
        category: 'work',
        isCompleted: false,
        hasNotification: true,
        createdAt: 1725800000000,
      };
      assert.strictEqual(isValidReminder(valid), true);
    });

    it('rejects objects missing required fields', () => {
      assert.strictEqual(isValidReminder({ id: 'rem-1', title: 'Test' }), false);
      assert.strictEqual(isValidReminder({ title: 'No ID', date: '2026-09-08' }), false);
      assert.strictEqual(isValidReminder({ id: '', title: 'Empty ID', date: '2026-09-08', time: '12:00' }), false);
    });

    it('rejects objects with invalid property types', () => {
      assert.strictEqual(
        isValidReminder({
          id: 'rem-1',
          title: 'Test',
          date: '2026-09-08',
          time: '12:00',
          category: 'work',
          isCompleted: 'not-a-bool', // invalid type
          hasNotification: true,
          createdAt: 1725800000000,
        }),
        false
      );

      assert.strictEqual(
        isValidReminder({
          id: 'rem-1',
          title: 'Test',
          date: '2026-09-08',
          time: '12:00',
          category: 'work',
          isCompleted: false,
          hasNotification: true,
          createdAt: 'not-a-number', // invalid type
        }),
        false
      );
    });

    it('rejects primitives, null, and undefined', () => {
      assert.strictEqual(isValidReminder(null), false);
      assert.strictEqual(isValidReminder(undefined), false);
      assert.strictEqual(isValidReminder('string'), false);
      assert.strictEqual(isValidReminder(42), false);
      assert.strictEqual(isValidReminder([]), false);
    });
  });

  describe('validateRemindersArray', () => {
    it('returns empty array when passed non-array inputs', () => {
      assert.deepStrictEqual(validateRemindersArray(null), []);
      assert.deepStrictEqual(validateRemindersArray(undefined), []);
      assert.deepStrictEqual(validateRemindersArray({ foo: 'bar' }), []);
      assert.deepStrictEqual(validateRemindersArray('corrupted-string'), []);
      assert.deepStrictEqual(validateRemindersArray(12345), []);
    });

    it('filters out corrupt or malformed entries from array', () => {
      const mixed = [
        {
          id: 'valid-1',
          title: 'Valid Reminder',
          date: '2026-09-08',
          time: '10:00',
          category: 'work',
          isCompleted: false,
          hasNotification: true,
          createdAt: 1725800000000,
        },
        null,
        'random-junk',
        { incomplete: 'object' },
        {
          id: 'valid-2',
          title: 'Second Valid',
          date: '2026-09-09',
          time: '11:00',
          category: 'health',
          isCompleted: true,
          hasNotification: false,
          createdAt: 1725800001000,
        },
      ];

      const result = validateRemindersArray(mixed);
      assert.strictEqual(result.length, 2);
      assert.strictEqual(result[0].id, 'valid-1');
      assert.strictEqual(result[1].id, 'valid-2');
    });
  });

  describe('validateSettingsObject', () => {
    it('returns default settings when given null, primitives, or arrays', () => {
      assert.deepStrictEqual(validateSettingsObject(null), DEFAULT_SETTINGS);
      assert.deepStrictEqual(validateSettingsObject(undefined), DEFAULT_SETTINGS);
      assert.deepStrictEqual(validateSettingsObject([]), DEFAULT_SETTINGS);
      assert.deepStrictEqual(validateSettingsObject('invalid'), DEFAULT_SETTINGS);
    });

    it('fills missing or invalid settings keys with defaults', () => {
      const partial = {
        themeId: 'emerald-forest',
        showSeconds: false,
      };

      const validated = validateSettingsObject(partial);
      assert.strictEqual(validated.themeId, 'emerald-forest');
      assert.strictEqual(validated.showSeconds, false);
      assert.strictEqual(validated.timeFormat12h, DEFAULT_SETTINGS.timeFormat12h);
      assert.strictEqual(validated.keepAwake, DEFAULT_SETTINGS.keepAwake);
      assert.strictEqual(validated.clockFontSize, DEFAULT_SETTINGS.clockFontSize);
    });

    it('sanitizes unknown clock font sizes back to default', () => {
      const invalidFontSize = {
        clockFontSize: 'super-massive-gigantic',
      };
      const validated = validateSettingsObject(invalidFontSize);
      assert.strictEqual(validated.clockFontSize, DEFAULT_SETTINGS.clockFontSize);
    });

    it('validates brightness level within bounds (0.0 to 1.0)', () => {
      const outOfBounds = {
        brightnessLevel: 5.5,
      };
      const validated = validateSettingsObject(outOfBounds);
      assert.strictEqual(validated.brightnessLevel, DEFAULT_SETTINGS.brightnessLevel);
    });
  });
});
