let monotonicCounter = 0;

/**
 * Generates a unique, collision-resistant identifier.
 * Combines high-resolution timestamp, a monotonic sequential counter,
 * and high-entropy random characters. Replaces deprecated String.prototype.substr.
 */
export function generateUniqueId(prefix = 'id'): string {
  monotonicCounter = (monotonicCounter + 1) % 1000000;
  const timestamp = Date.now().toString(36);
  const counterStr = monotonicCounter.toString(36).padStart(4, '0');
  const randomEntropy = Math.random().toString(36).substring(2, 8);

  return `${prefix}-${timestamp}-${counterStr}-${randomEntropy}`;
}
