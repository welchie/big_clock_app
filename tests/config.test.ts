import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

describe('VULN-04: Android Security & Backup Configuration', () => {
  it('explicitly disables allowBackup in app.json to protect local storage', () => {
    const appJsonPath = path.resolve(process.cwd(), 'app.json');
    const content = fs.readFileSync(appJsonPath, 'utf8');
    const parsed = JSON.parse(content);

    assert.strictEqual(
      parsed.expo?.android?.allowBackup,
      false,
      'expo.android.allowBackup must be explicitly set to false to prevent unencrypted ADB/cloud backup leaks'
    );
  });
});
