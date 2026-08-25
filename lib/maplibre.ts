import { LogManager, type StyleSpecification } from '@maplibre/maplibre-react-native';
import { SG_BOUNDS } from './core/map-bounds';
import { darkColors, lightColors, type Palette } from './theme';

/**
 * Silence the tile failures the coastline produces — each one is a LogBox red box for a gap the
 * map's background colour already covers. Restricting the source to `SG_BOUNDS` is not enough by
 * itself: a tile straddling the boundary still intersects the box, so it is still requested, and
 * the one in the original report (13/6457/4060, spanning 1.538°N to 1.582°N) is exactly that case.
 *
 * Dev-only, because the red box is: a release build has nothing listening to `console.error`. Worth
 * knowing while debugging a blank map — this also swallows what a dead network or a OneMap outage
 * would log, so comment it out before concluding the tiles are fine. `LogManager` keeps one
 * handler, so a second caller anywhere would replace this one rather than add to it.
 */
export function configureMapLogging(): void {
  if (!__DEV__) return;
  LogManager.onLog(
    ({ level, message }) => level === 'error' && message.includes('Failed to load tile'),
  );
}

/** OneMap raster tiles, the same source the web app fed to Leaflet. No API key needed. */
export function buildMapStyle(colors: Palette, tileset: 'Default' | 'Night'): StyleSpecification {
  return {
    version: 8,
    sources: {
      onemap: {
        type: 'raster',
        tiles: [`https://www.onemap.gov.sg/maps/tiles/${tileset}/{z}/{x}/{y}.png`],
        tileSize: 256,
        minzoom: 11,
        maxzoom: 19,
        // OneMap serves nothing outside this box, and asking anyway costs a failed decode.
        bounds: SG_BOUNDS,
        attribution: 'OneMap © contributors | Singapore Land Authority',
      },
    },
    layers: [
      // Only visible in the gaps while tiles load, but a white flash in dark mode is jarring.
      { id: 'background', type: 'background', paint: { 'background-color': colors.mapBg } },
      { id: `onemap-${tileset.toLowerCase()}`, type: 'raster', source: 'onemap' },
    ],
  };
}

// Module constants: a style object rebuilt per render would reload the map every time.
// Dark mode swaps the Default tileset for OneMap's Night variant.
export const MAP_STYLES = {
  light: buildMapStyle(lightColors, 'Default'),
  dark: buildMapStyle(darkColors, 'Night'),
};
