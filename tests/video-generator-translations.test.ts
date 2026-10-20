import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

// Missing Paraglide keys compile into undefined function calls and crash SSR.
const files = [
  'src/components/sites/generator/VideoGeneratorForm.tsx',
  'src/components/sites/generator/VideoGeneratorPreview.tsx',
  'src/components/sites/generator/VideoGeneratorWorkspace.tsx',
];

for (const locale of ['en', 'zh']) {
  test(`video workspace messages exist in ${locale}`, () => {
    const messages = JSON.parse(
      readFileSync(`messages/${locale}.json`, 'utf8')
    );
    for (const file of files) {
      const source = readFileSync(file, 'utf8');
      for (const [, key] of source.matchAll(/m\['([^']+)'\]/g)) {
        assert.equal(typeof messages[key], 'string', `${file}: missing ${key}`);
        assert.ok(messages[key].trim(), `${locale}: empty ${key}`);
      }
    }
  });
}
