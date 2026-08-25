import Constants from 'expo-constants';
import {
  formatPtDateTime,
  onemapRouteUrl,
  parseRoute,
  type RoutePoint,
  type Route,
  type RouteType,
} from './core/onemap-routing';

function getToken(): string | null {
  const extra = Constants.expoConfig?.extra as Record<string, string> | undefined;
  const token = extra?.onemapToken;
  return typeof token === 'string' && token.length > 0 ? token : null;
}

export async function fetchRoute(
  from: RoutePoint,
  to: RoutePoint,
  type: RouteType
): Promise<Route | null> {
  const token = getToken();
  if (!token) return null;
  const when = type === 'pt' ? formatPtDateTime(new Date()) : undefined;
  try {
    const res = await fetch(onemapRouteUrl(from, to, type, when), {
      headers: { Authorization: token },
    });
    const json = await res.json();
    return parseRoute(json, type);
  } catch {
    return null;
  }
}

export function hasOnemapCredentials(): boolean {
  return getToken() !== null;
}
