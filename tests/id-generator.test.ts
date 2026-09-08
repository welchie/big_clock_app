import { describe, it } from 'node:test';
import assert from 'node:assert';
import { generateUniqueId } from '../utils/idGenerator';

describe('VULN-05: Collision-Resistant ID Generation', () => {
  it('generates IDs conforming to expected format', () => {
    const id = generateUniqueId('rem');
    assert.strictEqual(id.startsWith('rem-'), true);
    const parts = id.split('-');
    assert.strictEqual(parts.length, 4);
    assert.strictEqual(parts[0], 'rem');
    assert.strictEqual(parts[1].length > 0, true); // timestamp
    assert.strictEqual(parts[2].length, 4); // 4-digit base36 counter
    assert.strictEqual(parts[3].length, 6); // 6-char random entropy
  });

  it('uses default prefix if none is specified', () => {
    const id = generateUniqueId();
    assert.strictEqual(id.startsWith('id-'), true);
  });

  it('generates 10,000 unique IDs without any collisions', () => {
    const iterations = 10000;
    const generated = new Set<string>();

    for (let i = 0; i < iterations; i++) {
      const id = generateUniqueId('test');
      assert.strictEqual(
        generated.has(id),
        false,
        `Collision detected for generated ID: ${id}`
      );
      generated.add(id);
    }

    assert.strictEqual(generated.size, iterations);
  });

  it('contains no undefined, null, or NaN substrings', () => {
    for (let i = 0; i < 100; i++) {
      const id = generateUniqueId('rem');
      assert.strictEqual(id.includes('undefined'), false);
      assert.strictEqual(id.includes('null'), false);
      assert.strictEqual(id.includes('NaN'), false);
    }
  });
});
