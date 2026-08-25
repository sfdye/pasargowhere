import { test } from 'node:test';
import assert from 'node:assert/strict';
import { onemapAmmUrl, onemapUrl } from './onemap.ts';

test('onemapUrl builds a pin URL with lat and lng', () => {
  const url = onemapUrl({ lat: 1.2774384329049095, lng: 103.82919342938374 });
  assert.equal(url, 'https://www.onemap.gov.sg/?lat=1.2774384329049095&lng=103.82919342938374');
});

test('onemapUrl preserves full coordinate precision', () => {
  const url = onemapUrl({ lat: 1.28708278284998, lng: 103.841580109275 });
  assert.ok(url.includes('lat=1.28708278284998'));
  assert.ok(url.includes('lng=103.841580109275'));
});

test('onemapAmmUrl builds an embeddable AMM URL with a red marker', () => {
  const url = onemapAmmUrl({ lat: 1.277, lng: 103.829 }, false);
  assert.equal(
    url,
    'https://www.onemap.gov.sg/amm/amm.html?mapStyle=Default&zoomLevel=17&marker=latLng:1.277,103.829!colour:red&PopupWidth=200'
  );
});

test('onemapAmmUrl uses Night style in dark mode', () => {
  const url = onemapAmmUrl({ lat: 1.277, lng: 103.829 }, true);
  assert.ok(url.includes('mapStyle=Night'));
});

test('onemapAmmUrl uses Default style in light mode', () => {
  const url = onemapAmmUrl({ lat: 1.277, lng: 103.829 }, false);
  assert.ok(url.includes('mapStyle=Default'));
});
