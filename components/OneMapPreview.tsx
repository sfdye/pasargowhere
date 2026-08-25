import { useEffect, useMemo, useRef, useState } from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';
import {
  Camera,
  type CameraRef,
  GeoJSONSource,
  Layer,
  Map,
} from '@maplibre/maplibre-react-native';
import MapAttribution from './MapAttribution';
import { Icon, Segmented, Text, type IconName } from './ui';
import { onemapUrl } from '../lib/core/onemap';
import {
  formatWalkMinutes,
  type Route,
  type RouteType,
  type TransitLeg,
} from '../lib/core/onemap-routing';
import { fetchRoute } from '../lib/onemap-routing';
import { configureMapLogging, MAP_STYLES } from '../lib/maplibre';
import { useT } from '../lib/store';
import type { Translate } from '../lib/store/state';
import { space, useTheme } from '../lib/theme';
import { useLocation } from '../lib/useLocation';

configureMapLogging();

const PIN_HEIGHT = 200;
const ROUTE_HEIGHT = 280;
const PIN_ZOOM = 17;
const ROUTE_PAD = 0.004;

type RouteState =
  | { status: 'idle' }
  | { status: 'fetching' }
  | { status: 'ready'; route: Route }
  | { status: 'error' };

interface OneMapPreviewProps {
  coords: { lat: number; lng: number };
  label: string;
}

function legIconName(mode: string): IconName {
  if (mode === 'BUS') return 'bus';
  if (mode === 'SUBWAY' || mode === 'RAIL') return 'train';
  return 'walk';
}

function legLabel(leg: TransitLeg, t: Translate): string {
  const min = formatWalkMinutes(leg.durationSeconds);
  if (leg.mode === 'WALK') return t('legWalk', { min });
  if (leg.mode === 'BUS') {
    return leg.stopCount > 0
      ? t('legBus', { route: leg.route || '?', stops: leg.stopCount, min })
      : t('legBusNoStops', { route: leg.route || '?', min });
  }
  // SUBWAY / RAIL
  return leg.stopCount > 0
    ? t('legTrain', { route: leg.route || '?', stops: leg.stopCount, min })
    : t('legTrainNoStops', { route: leg.route || '?', min });
}

export default function OneMapPreview({ coords, label }: OneMapPreviewProps) {
  const theme = useTheme();
  const t = useT();
  const { coords: userCoords, status: locStatus } = useLocation();
  const camera = useRef<CameraRef>(null);
  const [routeType, setRouteType] = useState<RouteType>('walk');
  const [routeState, setRouteState] = useState<RouteState>({ status: 'idle' });

  const hasUserPoint = !!userCoords && locStatus === 'granted';

  useEffect(() => {
    if (!hasUserPoint || !userCoords) {
      setRouteState({ status: 'idle' });
      return;
    }
    let alive = true;
    setRouteState({ status: 'fetching' });
    void fetchRoute(userCoords, coords, routeType).then((route) => {
      if (!alive) return;
      setRouteState(route ? { status: 'ready', route } : { status: 'error' });
    });
    return () => {
      alive = false;
    };
  }, [hasUserPoint, userCoords, coords, routeType]);

  const hasRoute = routeState.status === 'ready';
  const mapHeight = hasRoute ? ROUTE_HEIGHT : PIN_HEIGHT;

  const marketFeature = useMemo<GeoJSON.Feature<GeoJSON.Point>>(
    () => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [coords.lng, coords.lat] },
      properties: { kind: 'market' },
    }),
    [coords]
  );

  const userFeature = useMemo<GeoJSON.Feature<GeoJSON.Point> | null>(
    () =>
      userCoords
        ? {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [userCoords.lng, userCoords.lat] },
            properties: { kind: 'user' },
          }
        : null,
    [userCoords]
  );

  const pointCollection = useMemo<GeoJSON.FeatureCollection<GeoJSON.Point>>(() => {
    const features: GeoJSON.Feature<GeoJSON.Point>[] = [marketFeature];
    if (userFeature) features.push(userFeature);
    return { type: 'FeatureCollection', features };
  }, [marketFeature, userFeature]);

  const routeFeature = useMemo<GeoJSON.Feature<GeoJSON.LineString> | null>(() => {
    if (routeState.status !== 'ready') return null;
    return {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: routeState.route.coordinates,
      },
      properties: {},
    };
  }, [routeState]);

  useEffect(() => {
    if (!hasRoute || !userCoords) return;
    const lngs = [coords.lng, userCoords.lng];
    const lats = [coords.lat, userCoords.lat];
    const bounds: [number, number, number, number] = [
      Math.min(...lngs) - ROUTE_PAD,
      Math.min(...lats) - ROUTE_PAD,
      Math.max(...lngs) + ROUTE_PAD,
      Math.max(...lats) + ROUTE_PAD,
    ];
    camera.current?.fitBounds(bounds, { padding: { top: 20, right: 20, bottom: 20, left: 20 } });
  }, [hasRoute, userCoords, coords]);

  const openDirections = () => {
    void Linking.openURL(onemapUrl(coords));
  };

  const routeMinutes =
    routeState.status === 'ready' ? formatWalkMinutes(routeState.route.durationSeconds) : null;

  const routeLabel =
    routeType === 'walk'
      ? t('walkTime', { min: routeMinutes ?? 0 })
      : t('transitTime', { min: routeMinutes ?? 0 });

  const transitLegs = routeState.status === 'ready' ? routeState.route.legs : null;

  return (
    <View>
      <View style={[styles.preview, { backgroundColor: theme.colors.borderLight, height: mapHeight }]}>
        <Map
          style={styles.map}
          mapStyle={MAP_STYLES[theme.scheme]}
          logo={false}
          attribution={false}
          compass={false}
          scaleBar={false}
          testID="onemap-preview"
        >
          <Camera
            ref={camera}
            initialViewState={{
              center: [coords.lng, coords.lat],
              zoom: PIN_ZOOM,
            }}
          />
          {!!routeFeature && (
            <GeoJSONSource id="route-line" data={routeFeature}>
              <Layer
                id="route-casing"
                type="line"
                paint={{
                  'line-width': 7,
                  'line-color': theme.colors.accentBorder,
                  'line-opacity': 0.4,
                }}
              />
              <Layer
                id="route-main"
                type="line"
                paint={{
                  'line-width': 4,
                  'line-color': theme.colors.accent,
                }}
              />
            </GeoJSONSource>
          )}
          <GeoJSONSource id="map-points" data={pointCollection}>
            <Layer
              id="user-marker"
              type="circle"
              filter={['==', ['get', 'kind'], 'user']}
              paint={{
                'circle-radius': 8,
                'circle-color': '#3b82f6',
                'circle-stroke-width': 2.5,
                'circle-stroke-color': '#ffffff',
              }}
            />
            <Layer
              id="market-marker"
              type="circle"
              filter={['==', ['get', 'kind'], 'market']}
              paint={{
                'circle-radius': 10,
                'circle-color': theme.colors.mapFavFill,
                'circle-stroke-width': 2.5,
                'circle-stroke-color': theme.colors.mapFavStroke,
              }}
            />
          </GeoJSONSource>
        </Map>
        <MapAttribution />
      </View>

      {hasRoute && routeMinutes !== null && (
        <View style={styles.routeInfo}>
          <Icon name="directions" size={16} color="accent" />
          <Text variant="footnote" tone="muted">
            {routeLabel}
          </Text>
        </View>
      )}

      {hasUserPoint && (
        <View style={styles.segmentedWrap}>
          <Segmented<RouteType>
            value={routeType}
            onChange={setRouteType}
            options={[
              { value: 'walk', label: t('modeWalk') },
              { value: 'pt', label: t('modeTransit') },
            ]}
          />
        </View>
      )}

      {!!transitLegs && transitLegs.length > 1 && (
        <View style={styles.itinerary}>
          {transitLegs.map((leg, i) => (
            <View key={i} style={styles.legRow}>
              <Icon name={legIconName(leg.mode)} size={18} color="textMuted" />
              <Text variant="footnote" tone="muted" style={styles.legLabel}>
                {legLabel(leg, t)}
              </Text>
            </View>
          ))}
        </View>
      )}

      {routeState.status === 'fetching' && hasUserPoint && (
        <Text variant="footnote" tone="faint" style={styles.fetching}>
          {routeType === 'walk' ? t('modeWalk') : t('modeTransit')}…
        </Text>
      )}

      {routeState.status === 'error' && hasUserPoint && (
        <Text variant="footnote" tone="faint" style={styles.fetching}>
          —
        </Text>
      )}

      {locStatus === 'denied' && (
        <Pressable
          onPress={() => void Linking.openSettings()}
          testID="enable-location-route"
          accessibilityRole="link"
          accessibilityLabel={t('enableLocationRoute')}
          style={({ pressed }) => [
            styles.directionsRow,
            pressed && { backgroundColor: theme.colors.borderLight },
          ]}
        >
          <Icon name="locate" color="textMuted" />
          <Text variant="subhead" tone="muted" style={styles.directionsLabel}>
            {t('enableLocationRoute')}
          </Text>
        </Pressable>
      )}

      <Pressable
        onPress={openDirections}
        testID="directions-row"
        accessibilityRole="link"
        accessibilityLabel={t('directions')}
        style={({ pressed }) => [
          styles.directionsRow,
          pressed && { backgroundColor: theme.colors.borderLight },
        ]}
      >
        <Icon name="directions" color="textMuted" />
        <Text variant="subhead" tone="muted" style={styles.directionsLabel}>
          {t('directions')}
        </Text>
        <Icon name="external" size={16} color="textFaint" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  preview: {
    overflow: 'hidden',
  },
  map: {
    flex: 1,
    opacity: 0.99,
    overflow: 'hidden',
  },
  routeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
  },
  segmentedWrap: {
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
  },
  itinerary: {
    paddingHorizontal: space.lg,
    paddingVertical: space.xs,
    gap: space.xs,
  },
  legRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
  legLabel: { flex: 1 },
  fetching: {
    paddingHorizontal: space.lg,
    paddingBottom: space.sm,
  },
  directionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    padding: space.lg,
  },
  directionsLabel: { flex: 1 },
});
