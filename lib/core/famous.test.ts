import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { FAMOUS_PASARS, isFamous } from './famous.ts';

describe('famous pasars', () => {
  test('has a reasonable curated list', () => {
    assert.ok(FAMOUS_PASARS.length >= 8 && FAMOUS_PASARS.length <= 15);
  });

  test('all entries are non-empty strings', () => {
    for (const name of FAMOUS_PASARS) {
      assert.ok(typeof name === 'string' && name.length > 0, `bad entry: ${name}`);
    }
  });

  test('no duplicates', () => {
    assert.equal(new Set(FAMOUS_PASARS).size, FAMOUS_PASARS.length);
  });

  test('isFamous matches by friendly name', () => {
    assert.equal(isFamous('Maxwell Food Centre'), true);
    assert.equal(isFamous('Maxwell Food Centre'), true);
  });

  test('isFamous returns false for unknown names', () => {
    assert.equal(isFamous('Some Random Market'), false);
    assert.equal(isFamous(''), false);
  });
});
