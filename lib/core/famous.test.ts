import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { FAMOUS_PASARS, isFamous, famousBlurb } from './famous.ts';

describe('famous pasars', () => {
  test('has a reasonable curated list', () => {
    assert.ok(FAMOUS_PASARS.length >= 8 && FAMOUS_PASARS.length <= 15);
  });

  test('all entries have non-empty names', () => {
    for (const entry of FAMOUS_PASARS) {
      assert.ok(typeof entry.name === 'string' && entry.name.length > 0, `bad name: ${entry}`);
    }
  });

  test('no duplicate names', () => {
    const names = FAMOUS_PASARS.map((f) => f.name);
    assert.equal(new Set(names).size, names.length);
  });

  test('every entry has non-empty blurbs in both languages', () => {
    for (const entry of FAMOUS_PASARS) {
      assert.ok(entry.blurb.en.length > 0, `missing en blurb: ${entry.name}`);
      assert.ok(entry.blurb.zh.length > 0, `missing zh blurb: ${entry.name}`);
    }
  });

  test('isFamous matches by friendly name', () => {
    assert.equal(isFamous('Kim Hua Market'), true);
    assert.equal(isFamous('Chinatown Complex Market'), true);
  });

  test('isFamous returns false for unknown names', () => {
    assert.equal(isFamous('Some Random Market'), false);
    assert.equal(isFamous(''), false);
  });

  test('famousBlurb returns the right language', () => {
    const en = famousBlurb('Kim Hua Market', 'en');
    const zh = famousBlurb('Kim Hua Market', 'zh');
    assert.ok(en && en.length > 0);
    assert.ok(zh && zh.length > 0);
    assert.notEqual(en, zh);
  });

  test('famousBlurb returns null for unknown names', () => {
    assert.equal(famousBlurb('Some Random Market', 'en'), null);
  });
});
