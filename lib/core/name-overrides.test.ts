import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { NAME_OVERRIDES, resolveDisplayName } from './name-overrides.ts';

describe('name overrides', () => {
  test('every override has both languages', () => {
    for (const [key, val] of Object.entries(NAME_OVERRIDES)) {
      assert.ok(val.en.length > 0, `missing en for ${key}`);
      assert.ok(val.zh.length > 0, `missing zh for ${key}`);
    }
  });

  test('resolveDisplayName returns the override', () => {
    assert.equal(resolveDisplayName('Kim Hua Market', 'en'), 'Maxwell Food Centre');
    assert.equal(resolveDisplayName('Kim Hua Market', 'zh'), '麦士威熟食中心');
    assert.equal(resolveDisplayName('Telok Ayer Food Centre', 'en'), 'Amoy Street Food Centre');
  });

  test('resolveDisplayName returns null for unoverridden names', () => {
    assert.equal(resolveDisplayName('Tiong Bahru Market', 'en'), null);
    assert.equal(resolveDisplayName('', 'en'), null);
  });
});
