import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { getMarketCategory } from './market-category.ts';
import type { Market } from './market-logic.ts';

const mk = (m?: string, f?: string): Market => ({
  name: 'x',
  no_of_market_stalls: m,
  no_of_food_stalls: f,
});

describe('getMarketCategory', () => {
  test('wet when market stalls dominate', () => {
    assert.equal(getMarketCategory(mk('80', '20')), 'wet');
  });

  test('food when food stalls dominate', () => {
    assert.equal(getMarketCategory(mk('10', '90')), 'food');
  });

  test('mixed at roughly even split', () => {
    assert.equal(getMarketCategory(mk('50', '50')), 'mixed');
    assert.equal(getMarketCategory(mk('55', '45')), 'mixed');
  });

  test('pure food centre with zero market stalls', () => {
    assert.equal(getMarketCategory(mk('0', '40')), 'food');
  });

  test('pure wet market with zero food stalls', () => {
    assert.equal(getMarketCategory(mk('30', '0')), 'wet');
  });

  test('null when both counts are missing', () => {
    assert.equal(getMarketCategory(mk(undefined, undefined)), null);
  });

  test('null when both counts are zero', () => {
    assert.equal(getMarketCategory(mk('0', '0')), null);
  });

  test('null on non-numeric strings', () => {
    assert.equal(getMarketCategory(mk('abc', '10')), null);
  });
});
