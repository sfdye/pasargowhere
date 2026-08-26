import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { getMarketCategories } from './market-category.ts';
import type { Market } from './market-logic.ts';

const mk = (m?: string, f?: string): Market => ({
  name: 'x',
  no_of_market_stalls: m,
  no_of_food_stalls: f,
});

describe('getMarketCategories', () => {
  test('both categories when both stall types present', () => {
    assert.deepEqual(getMarketCategories(mk('80', '20')), ['wet', 'food']);
    assert.deepEqual(getMarketCategories(mk('10', '90')), ['wet', 'food']);
    assert.deepEqual(getMarketCategories(mk('50', '50')), ['wet', 'food']);
    assert.deepEqual(getMarketCategories(mk('55', '45')), ['wet', 'food']);
    assert.deepEqual(getMarketCategories(mk('1', '134')), ['wet', 'food']);
  });

  test('food only when zero market stalls', () => {
    assert.deepEqual(getMarketCategories(mk('0', '40')), ['food']);
  });

  test('wet only when zero food stalls', () => {
    assert.deepEqual(getMarketCategories(mk('30', '0')), ['wet']);
  });

  test('empty when both counts are missing', () => {
    assert.deepEqual(getMarketCategories(mk(undefined, undefined)), []);
  });

  test('empty when both counts are zero', () => {
    assert.deepEqual(getMarketCategories(mk('0', '0')), []);
  });

  test('empty on non-numeric strings', () => {
    assert.deepEqual(getMarketCategories(mk('abc', '10')), []);
  });
});
