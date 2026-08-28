import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  parseTimeRange,
  isOpenNow,
  getMarketHours,
  hasHours,
  resolveHoursDisplay,
  sgMinutes,
  sgDayOfWeek,
  type MarketHours,
} from './market-hours.ts';

test('parseTimeRange — normal', () => {
  const r = parseTimeRange('6:00 am–10:00 pm');
  assert.ok(r && typeof r === 'object');
  assert.equal(r.open, 360);
  assert.equal(r.close, 1320);
});

test('parseTimeRange — with minutes', () => {
  const r = parseTimeRange('5:30 am–8:00 pm');
  assert.ok(r && typeof r === 'object');
  assert.equal(r.open, 330);
  assert.equal(r.close, 1200);
});

test('parseTimeRange — 24h', () => {
  assert.equal(parseTimeRange('Open 24 hours'), '24h');
});

test('parseTimeRange — closed', () => {
  assert.equal(parseTimeRange('Closed'), 'closed');
});

test('parseTimeRange — overnight', () => {
  const r = parseTimeRange('7:00 am–2:00 am');
  assert.ok(r && typeof r === 'object');
  assert.equal(r.open, 420);
  assert.equal(r.close, 120);
});

test('parseTimeRange — midnight close', () => {
  const r = parseTimeRange('6:00 am–12:00 am');
  assert.ok(r && typeof r === 'object');
  assert.equal(r.open, 360);
  assert.equal(r.close, 0);
});

test('parseTimeRange — noon start', () => {
  const r = parseTimeRange('12:00 pm–8:00 pm');
  assert.ok(r && typeof r === 'object');
  assert.equal(r.open, 720);
  assert.equal(r.close, 1200);
});

test('isOpenNow — normal range open', () => {
  const hours: MarketHours = { mon: '6:00 am–10:00 pm', tue: '6:00 am–10:00 pm', wed: '6:00 am–10:00 pm', thu: '6:00 am–10:00 pm', fri: '6:00 am–10:00 pm', sat: '6:00 am–10:00 pm', sun: '6:00 am–10:00 pm' };
  assert.equal(isOpenNow(hours, 3, 900), true);
});

test('isOpenNow — normal range closed (before open)', () => {
  const hours: MarketHours = { wed: '6:00 am–10:00 pm' };
  assert.equal(isOpenNow(hours, 3, 300), false);
});

test('isOpenNow — normal range closed (after close)', () => {
  const hours: MarketHours = { wed: '6:00 am–10:00 pm' };
  assert.equal(isOpenNow(hours, 3, 1321), false);
});

test('isOpenNow — 24h', () => {
  const hours: MarketHours = { wed: 'Open 24 hours' };
  assert.equal(isOpenNow(hours, 3, 0), true);
  assert.equal(isOpenNow(hours, 3, 720), true);
  assert.equal(isOpenNow(hours, 3, 1439), true);
});

test('isOpenNow — closed today', () => {
  const hours: MarketHours = { wed: 'Closed' };
  assert.equal(isOpenNow(hours, 3, 600), false);
});

test('isOpenNow — overnight, after open same day', () => {
  const hours: MarketHours = { wed: '7:00 am–2:00 am' };
  assert.equal(isOpenNow(hours, 3, 1200), true);
});

test('isOpenNow — overnight, before midnight same day', () => {
  const hours: MarketHours = { wed: '7:00 am–2:00 am' };
  assert.equal(isOpenNow(hours, 3, 1380), true);
});

test('isOpenNow — overnight, after midnight should check yesterday', () => {
  const hours: MarketHours = { wed: '7:00 am–2:00 am', tue: '6:00 am–10:00 pm' };
  assert.equal(isOpenNow(hours, 3, 60), false);
});

test('isOpenNow — overnight, after midnight with yesterday extension', () => {
  const hours: MarketHours = { wed: '7:00 am–2:00 am', tue: '7:00 am–2:00 am' };
  assert.equal(isOpenNow(hours, 3, 60), true);
});

test('isOpenNow — midnight close (00:00)', () => {
  const hours: MarketHours = { wed: '6:00 am–12:00 am' };
  assert.equal(isOpenNow(hours, 3, 1380), true);
  assert.equal(isOpenNow(hours, 3, 0), false);
});

test('isOpenNow — no data', () => {
  const hours: MarketHours = {};
  assert.equal(isOpenNow(hours, 3, 600), null);
});

test('isOpenNow — today closed but yesterday overnight extends', () => {
  const hours: MarketHours = { wed: 'Closed', tue: '7:00 am–2:00 am' };
  assert.equal(isOpenNow(hours, 3, 60), true);
  assert.equal(isOpenNow(hours, 3, 180), false);
});

test('getMarketHours — existing market', () => {
  const h = getMarketHours('Maxwell Food Centre (Kim Hua Market)');
  assert.ok(h);
  assert.equal(h!.wed, '8:00 am–10:00 pm');
});

test('getMarketHours — missing market', () => {
  assert.equal(getMarketHours('Nonexistent Market'), null);
});

test('hasHours', () => {
  assert.equal(hasHours('Maxwell Food Centre (Kim Hua Market)'), true);
  assert.equal(hasHours('Newton Food Centre'), false);
});

test('resolveHoursDisplay — open', () => {
  const d2 = resolveHoursDisplay('Maxwell Food Centre (Kim Hua Market)', 3, 720);
  assert.equal(d2.kind, 'open');
  assert.equal(d2.label, '8:00 am–10:00 pm');
});

test('resolveHoursDisplay — closed by hours', () => {
  const d = resolveHoursDisplay('Maxwell Food Centre (Kim Hua Market)', 3, 300);
  assert.equal(d.kind, 'closedByHours');
  assert.equal(d.opensAt, '8:00 am');
});

test('resolveHoursDisplay — opens soon within 1 hour', () => {
  const d = resolveHoursDisplay('Maxwell Food Centre (Kim Hua Market)', 3, 450);
  assert.equal(d.kind, 'opensSoon');
  assert.equal(d.opensAt, '8:00 am');
});

test('resolveHoursDisplay — closes soon within 1 hour', () => {
  // Maxwell closes at 22:00 (1320 min). At 21:30 (1290 min) → 30 min until close.
  const d = resolveHoursDisplay('Maxwell Food Centre (Kim Hua Market)', 3, 1290);
  assert.equal(d.kind, 'closesSoon');
  assert.equal(d.closesAt, '10:00 pm');
});

test('resolveHoursDisplay — 24h', () => {
  const d = resolveHoursDisplay('Boon Lay Place Blk 221A/B (Boon Lay Place Market and Food Village)', 3, 0);
  assert.equal(d.kind, 'open24h');
  assert.equal(d.label, 'Open 24 hours');
});

test('resolveHoursDisplay — no data', () => {
  const d = resolveHoursDisplay('Newton Food Centre', 3, 600);
  assert.equal(d.kind, 'noData');
});

test('resolveHoursDisplay — closed today', () => {
  const d = resolveHoursDisplay('Berseh Food Centre', 0, 600);
  assert.equal(d.kind, 'closedByHours');
  assert.equal(d.opensAt, null);
});

test('sgMinutes and sgDayOfWeek', () => {
  const now = new Date('2024-01-10T12:00:00Z');
  assert.equal(sgMinutes(now), 20 * 60);
  assert.equal(sgDayOfWeek(now), 3);
});

test('sgMinutes — midnight boundary', () => {
  const now = new Date('2024-01-10T16:00:00Z');
  assert.equal(sgMinutes(now), 0);
  assert.equal(sgDayOfWeek(now), 4);
});
