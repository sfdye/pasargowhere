export interface RoutePoint {
  lat: number;
  lng: number;
}

export type RouteType = 'walk' | 'pt';

export type TransitMode = 'WALK' | 'BUS' | 'SUBWAY' | 'RAIL';

export interface TransitLeg {
  mode: string;
  route: string;
  durationSeconds: number;
  stopCount: number;
  fromName: string;
  toName: string;
}

export interface Route {
  coordinates: [number, number][];
  distanceMeters: number;
  durationSeconds: number;
  legs?: TransitLeg[];
}

/** Walk route — kept as an alias so existing imports don't break. */
export type WalkRoute = Route;

const ONEMAP_BASE = 'https://www.onemap.gov.sg/api';

export function onemapAuthUrl(): string {
  return `${ONEMAP_BASE}/auth/post/getToken`;
}

export function formatPtDateTime(date: Date): { date: string; time: string } {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return { date: `${m}-${d}-${y}`, time: `${h}:${min}:00` };
}

export function onemapRouteUrl(
  from: RoutePoint,
  to: RoutePoint,
  type: RouteType = 'walk',
  when?: { date: string; time: string }
): string {
  const base = `${ONEMAP_BASE}/public/routingsvc/route?start=${from.lat},${from.lng}&end=${to.lat},${to.lng}&routeType=${type}`;
  if (type === 'pt' && when) {
    return `${base}&date=${when.date}&time=${when.time}&mode=TRANSIT&maxWalkDistance=500`;
  }
  return base;
}

export function parseOnemapToken(json: unknown): string | null {
  if (typeof json !== 'object' || json === null) return null;
  const token = (json as Record<string, unknown>).access_token;
  return typeof token === 'string' ? token : null;
}

export function decodePolyline(encoded: string): [number, number][] {
  const coordinates: [number, number][] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let result = 0;
    let shift = 0;
    let byte: number;
    do {
      byte = encoded.charCodeAt(index) - 63;
      index++;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    const dLat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dLat;

    result = 0;
    shift = 0;
    do {
      byte = encoded.charCodeAt(index) - 63;
      index++;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    const dLng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dLng;

    coordinates.push([lng * 1e-5, lat * 1e-5]);
  }

  return coordinates;
}

export function parseOnemapRoute(json: unknown): Route | null {
  if (typeof json !== 'object' || json === null) return null;
  const obj = json as Record<string, unknown>;
  const geometry = obj.route_geometry;
  if (typeof geometry !== 'string' || geometry.length === 0) return null;
  const coordinates = decodePolyline(geometry);
  if (coordinates.length < 2) return null;
  const summary = obj.route_summary as Record<string, unknown> | undefined;
  return {
    coordinates,
    distanceMeters: typeof summary?.total_distance === 'number' ? summary.total_distance : 0,
    durationSeconds: typeof summary?.total_time === 'number' ? summary.total_time : 0,
  };
}

export function parseOnemapPtRoute(json: unknown): Route | null {
  if (typeof json !== 'object' || json === null) return null;
  const plan = (json as Record<string, unknown>).plan as Record<string, unknown> | undefined;
  if (!plan || !Array.isArray(plan.itineraries) || plan.itineraries.length === 0) return null;
  const itin = plan.itineraries[0] as Record<string, unknown>;
  const rawLegs = itin.legs;
  if (!Array.isArray(rawLegs) || rawLegs.length === 0) return null;

  const coordinates: [number, number][] = [];
  const legs: TransitLeg[] = [];

  for (const leg of rawLegs as Record<string, unknown>[]) {
    const geom = leg.legGeometry as Record<string, unknown> | undefined;
    const points = geom?.points;
    if (typeof points === 'string') {
      const decoded = decodePolyline(points);
      if (coordinates.length > 0 && decoded.length > 0) {
        decoded.shift();
      }
      coordinates.push(...decoded);
    }

    const mode = typeof leg.mode === 'string' ? leg.mode : 'WALK';
    const route = typeof leg.route === 'string' ? leg.route : '';
    const fromName = (leg.from as Record<string, unknown> | undefined)?.name;
    const toName = (leg.to as Record<string, unknown> | undefined)?.name;
    const stops = leg.intermediateStops;
    legs.push({
      mode,
      route,
      durationSeconds: typeof leg.duration === 'number' ? leg.duration : 0,
      stopCount: Array.isArray(stops) ? stops.length : 0,
      fromName: typeof fromName === 'string' ? fromName : '',
      toName: typeof toName === 'string' ? toName : '',
    });
  }

  if (coordinates.length < 2) return null;

  return {
    coordinates,
    distanceMeters: typeof itin.walkDistance === 'number' ? itin.walkDistance : 0,
    durationSeconds: typeof itin.duration === 'number' ? itin.duration : 0,
    legs,
  };
}

export function parseRoute(json: unknown, _type: RouteType): Route | null {
  return parseOnemapRoute(json) ?? parseOnemapPtRoute(json);
}

export function formatWalkMinutes(seconds: number): number {
  return Math.max(1, Math.round(seconds / 60));
}
