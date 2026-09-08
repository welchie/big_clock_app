import { describe, it } from 'node:test';
import assert from 'node:assert';
import { INPUT_LIMITS, sanitizeInputLength } from '../constants/inputLimits';

describe('VULN-03: Input Length Limits & Sanitization Defense', () => {
  it('defines appropriate maximum length boundaries', () => {
    assert.strictEqual(INPUT_LIMITS.TITLE_MAX_LENGTH, 120);
    assert.strictEqual(INPUT_LIMITS.NOTES_MAX_LENGTH, 1000);
    assert.strictEqual(INPUT_LIMITS.DATE_MAX_LENGTH, 10);
    assert.strictEqual(INPUT_LIMITS.TIME_MAX_LENGTH, 5);
  });

  describe('sanitizeInputLength', () => {
    it('truncates oversized title strings to maximum length', () => {
      const hugeTitle = 'A'.repeat(500);
      const sanitized = sanitizeInputLength(hugeTitle, INPUT_LIMITS.TITLE_MAX_LENGTH);
      assert.strictEqual(sanitized.length, 120);
      assert.strictEqual(sanitized, 'A'.repeat(120));
    });

    it('truncates oversized notes strings to maximum length', () => {
      const hugeNotes = 'B'.repeat(5000);
      const sanitized = sanitizeInputLength(hugeNotes, INPUT_LIMITS.NOTES_MAX_LENGTH);
      assert.strictEqual(sanitized.length, 1000);
    });

    it('preserves strings that are within boundary limits', () => {
      const normalTitle = 'Team Standup';
      assert.strictEqual(
        sanitizeInputLength(normalTitle, INPUT_LIMITS.TITLE_MAX_LENGTH),
        'Team Standup'
      );

      const normalDate = '2026-09-08';
      assert.strictEqual(
        sanitizeInputLength(normalDate, INPUT_LIMITS.DATE_MAX_LENGTH),
        '2026-09-08'
      );
    });

    it('handles empty, null, or undefined inputs gracefully without throwing', () => {
      assert.strictEqual(sanitizeInputLength('', 100), '');
      assert.strictEqual(sanitizeInputLength(null, 100), '');
      assert.strictEqual(sanitizeInputLength(undefined, 100), '');
      assert.strictEqual(sanitizeInputLength(12345 as unknown as string, 100), '');
    });
  });
});
