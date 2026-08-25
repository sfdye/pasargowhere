import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  decodePolyline,
  formatPtDateTime,
  formatWalkMinutes,
  onemapAuthUrl,
  onemapRouteUrl,
  parseOnemapPtRoute,
  parseOnemapRoute,
  parseOnemapToken,
  parseRoute,
} from './onemap-routing.ts';

test('onemapAuthUrl returns the getToken endpoint', () => {
  assert.equal(onemapAuthUrl(), 'https://www.onemap.gov.sg/api/auth/post/getToken');
});

test('onemapRouteUrl builds a walk routing URL by default', () => {
  const url = onemapRouteUrl(
    { lat: 1.278, lng: 103.828 },
    { lat: 1.277, lng: 103.829 }
  );
  assert.equal(
    url,
    'https://www.onemap.gov.sg/api/public/routingsvc/route?start=1.278,103.828&end=1.277,103.829&routeType=walk'
  );
});

test('onemapRouteUrl builds a PT routing URL with date, time and mode', () => {
  const url = onemapRouteUrl(
    { lat: 1.278, lng: 103.828 },
    { lat: 1.277, lng: 103.829 },
    'pt',
    { date: '25-08-2026', time: '14:30' }
  );
  assert.equal(
    url,
    'https://www.onemap.gov.sg/api/public/routingsvc/route?start=1.278,103.828&end=1.277,103.829&routeType=pt&date=25-08-2026&time=14:30&mode=TRANSIT&maxWalkDistance=500'
  );
});

test('formatPtDateTime formats a Date into MM-DD-YYYY and HH:MM:SS', () => {
  const result = formatPtDateTime(new Date(2026, 7, 25, 14, 5));
  assert.equal(result.date, '08-25-2026');
  assert.equal(result.time, '14:05:00');
});

test('parseOnemapToken extracts the access_token string', () => {
  assert.equal(parseOnemapToken({ access_token: 'abc123' }), 'abc123');
  assert.equal(parseOnemapToken({ access_token: 42 }), null);
  assert.equal(parseOnemapToken(null), null);
});

test('decodePolyline returns empty for empty string', () => {
  assert.deepEqual(decodePolyline(''), []);
});

test('decodePolyline decodes a known Singapore polyline', () => {
  const coords = decodePolyline('qxaGqqxxRA{@eAA_ABm@Bg@Jc@JKBFGBBb@Kf@Kl@');
  assert.ok(coords.length > 2);
  for (const [lng, lat] of coords) {
    assert.ok(lat > 1.0 && lat < 1.5, `lat ${lat} out of SG range`);
    assert.ok(lng > 103.0 && lng < 104.5, `lng ${lng} out of SG range`);
  }
});

test('parseOnemapRoute extracts walk route from a routing response', () => {
  const route = parseOnemapRoute({
    route_geometry: 'qxaGqqxxRA{@eAA_ABm@Bg@Jc@JKBFGBBb@Kf@Kl@',
    route_summary: { total_time: 129, total_distance: 995 },
    status: 0,
  });
  assert.ok(route !== null);
  assert.ok(route!.coordinates.length > 2);
  assert.equal(route!.durationSeconds, 129);
  assert.equal(route!.distanceMeters, 995);
});

test('parseOnemapRoute returns null for malformed input', () => {
  assert.equal(parseOnemapRoute(null), null);
  assert.equal(parseOnemapRoute({}), null);
  assert.equal(parseOnemapRoute({ route_geometry: '' }), null);
  assert.equal(parseOnemapRoute({ route_geometry: 42 }), null);
});

test('parseOnemapPtRoute extracts transit route from a plan response', () => {
  const route = parseOnemapPtRoute({
    plan: {
      itineraries: [
        {
          duration: 1800,
          walkDistance: 500,
          legs: [
            {
              mode: 'WALK',
              route: '',
              duration: 300,
              from: { name: 'Origin' },
              to: { name: 'Bus stop' },
              legGeometry: { points: 'qxaGqqxxRA{@eAA_ABm@Bg@Jc@JKBFGBBb@Kf@Kl@' },
            },
            {
              mode: 'BUS',
              route: '139',
              duration: 1500,
              from: { name: 'Bus stop' },
              to: { name: 'Market' },
              intermediateStops: [{}, {}, {}],
              legGeometry: { points: 'qxaGqqxxRA{@eAA_ABm@Bg@Jc@JKBFGBBb@Kf@Kl@' },
            },
          ],
        },
      ],
    },
  });
  assert.ok(route !== null);
  assert.ok(route!.coordinates.length > 4);
  assert.equal(route!.durationSeconds, 1800);
  assert.equal(route!.distanceMeters, 500);
  assert.ok(route!.legs !== undefined);
  assert.equal(route!.legs!.length, 2);
  assert.equal(route!.legs![0].mode, 'WALK');
  assert.equal(route!.legs![1].mode, 'BUS');
  assert.equal(route!.legs![0].durationSeconds, 300);
  assert.equal(route!.legs![1].durationSeconds, 1500);
  assert.equal(route!.legs![1].route, '139');
  assert.equal(route!.legs![1].stopCount, 3);
});

test('parseOnemapPtRoute returns null for malformed input', () => {
  assert.equal(parseOnemapPtRoute(null), null);
  assert.equal(parseOnemapPtRoute({}), null);
  assert.equal(parseOnemapPtRoute({ plan: {} }), null);
  assert.equal(parseOnemapPtRoute({ plan: { itineraries: [] } }), null);
  assert.equal(
    parseOnemapPtRoute({ plan: { itineraries: [{ legs: [] }] } }),
    null
  );
});

test('parseRoute tries both parsers regardless of type', () => {
  const walkResponse = { route_geometry: 'qxaGqqxxRA{@eAA_ABm@Bg@Jc@JKBFGBBb@Kf@Kl@', route_summary: { total_time: 129, total_distance: 995 } };
  const ptResponse = { plan: { itineraries: [{ duration: 1800, walkDistance: 500, legs: [{ mode: 'WALK', legGeometry: { points: 'qxaGqqxxRA{@eAA_ABm@Bg@Jc@JKBFGBBb@Kf@Kl@' } }] }] } };

  assert.ok(parseRoute(walkResponse, 'walk') !== null);
  assert.ok(parseRoute(walkResponse, 'pt') !== null);
  assert.ok(parseRoute(ptResponse, 'pt') !== null);
  assert.ok(parseRoute(ptResponse, 'walk') !== null);
});

test('formatWalkMinutes rounds up to at least 1 minute', () => {
  assert.equal(formatWalkMinutes(0), 1);
  assert.equal(formatWalkMinutes(30), 1);
  assert.equal(formatWalkMinutes(90), 2);
  assert.equal(formatWalkMinutes(252), 4);
  assert.equal(formatWalkMinutes(3600), 60);
});
