import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { getDisplayStatus } from './display-status.ts';
import type { Market } from './market-logic.ts';

// Wednesday June 25, 2026 — a regular weekday with no NEA closure.
const wed = new Date(2026, 5, 25);
// Monday June 29, 2026 — the weekly rest day.
const mon = new Date(2026, 5, 29);

const marketWithHours: Market = {
  name: 'Maxwell Food Centre (Kim Hua Market)',
};

const marketNoHours: Market = {
  name: 'Newton Food Centre',
};

describe('getDisplayStatus — NEA status takes priority over hours', () => {
  test('Monday warning suppresses hours even when market would be open', () => {
    // Maxwell is open 8am–10pm on Mondays, but the NEA Monday warning must win.
    const d = getDisplayStatus(marketWithHours, mon, 720);
    assert.equal(d.status.status, 'warning');
    assert.equal(d.hours, null);
    assert.equal(d.tone, 'warning');
  });

  test('cleaning closure suppresses hours even when market would be open', () => {
    const market: Market = {
      name: 'Maxwell Food Centre (Kim Hua Market)',
      q2_cleaningstartdate: '25/6/2026',
      q2_cleaningenddate: '25/6/2026',
    };
    // Wednesday with hours data, but closed for cleaning → hours must not resolve.
    const d = getDisplayStatus(market, wed, 720);
    assert.equal(d.status.status, 'closed');
    assert.equal(d.hours, null);
    assert.equal(d.tone, 'closed');
  });
});

describe('getDisplayStatus — open status delegates to hours', () => {
  test('open within operating hours → tone open', () => {
    const d = getDisplayStatus(marketWithHours, wed, 720);
    assert.equal(d.status.status, 'open');
    assert.equal(d.hours?.kind, 'open');
    assert.equal(d.tone, 'open');
  });

  test('open but no hours data → tone open, hours noData', () => {
    const d = getDisplayStatus(marketNoHours, wed, 600);
    assert.equal(d.status.status, 'open');
    assert.equal(d.hours?.kind, 'noData');
    assert.equal(d.tone, 'open');
  });

  test('closed by hours → tone closed', () => {
    const d = getDisplayStatus(marketWithHours, wed, 300);
    assert.equal(d.status.status, 'open');
    assert.equal(d.hours?.kind, 'closedByHours');
    assert.equal(d.tone, 'closed');
  });

  test('opens soon → tone soon', () => {
    const d = getDisplayStatus(marketWithHours, wed, 450);
    assert.equal(d.hours?.kind, 'opensSoon');
    assert.equal(d.tone, 'soon');
  });

  test('closes soon → tone soon', () => {
    const d = getDisplayStatus(marketWithHours, wed, 1290);
    assert.equal(d.hours?.kind, 'closesSoon');
    assert.equal(d.tone, 'soon');
  });
});
