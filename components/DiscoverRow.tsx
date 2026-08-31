import { memo } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Icon, Text } from './ui';
import { parseMarketName } from '../lib/core/market-logic';
import { sgMinutes } from '../lib/core/market-hours';
import { getDisplayStatus, type DisplayTone } from '../lib/core/display-status';
import type { Market } from '../lib/core/market-logic';
import { statusLabel } from '../lib/status';
import type { Lang } from '../lib/i18n';
import { formatDistance, getDisplayName, getMarketDistance } from '../lib/markets';
import { useT, useToday } from '../lib/store';
import type { Coords } from '../lib/useLocation';
import { radius, space, useTheme } from '../lib/theme';

const THUMB_SIZE = 56;

const TEXT_TONE: Record<DisplayTone, 'accent' | 'danger' | 'warning'> = {
  open: 'accent',
  warning: 'warning',
  closed: 'danger',
  soon: 'warning',
};

function DiscoverRowInner({
  market,
  lang,
  coords,
}: {
  market: Market;
  lang: Lang;
  coords: Coords | null;
}) {
  const router = useRouter();
  const theme = useTheme();
  const t = useT();
  const today = useToday();

  const parsed = parseMarketName(market.name);
  const displayName = getDisplayName(parsed, lang);
  const dist = getMarketDistance(market, coords?.lat ?? null, coords?.lng ?? null);

  const { hours, tone } = getDisplayStatus(market, today, sgMinutes());
  const showStatus = !(tone === 'open' && (!hours || hours.kind === 'noData'));
  const label = statusLabel(tone, t, hours);

  return (
    <Pressable
      onPress={() => router.push({ pathname: '/market/[name]', params: { name: market.name } })}
      accessibilityRole="button"
      testID="discover-row"
      accessibilityLabel={[displayName, dist !== null ? formatDistance(dist) : '', showStatus ? label : '']
        .filter(Boolean)
        .join('. ')}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: pressed ? theme.colors.borderLight : theme.colors.surface },
      ]}
    >
      <Image
        source={market.photourl ? { uri: market.photourl } : undefined}
        style={[styles.thumb, { backgroundColor: theme.colors.borderLight }]}
        contentFit="cover"
        cachePolicy="memory-disk"
        transition={150}
        accessible={false}
      />
      <View style={styles.info}>
        <Text variant="headline" numberOfLines={1}>
          {displayName}
        </Text>
        {!!parsed.street && (
          <Text variant="subhead" tone="muted" numberOfLines={1}>
            {parsed.street}
          </Text>
        )}
        {(dist !== null || showStatus) && (
          <View style={styles.metaRow}>
            {dist !== null && (
              <Text variant="subhead" tone="muted">
                {formatDistance(dist)}
              </Text>
            )}
            {showStatus && (
              <>
                {dist !== null && (
                  <Text variant="subhead" tone="muted"> · </Text>
                )}
                <Text variant="subhead" tone={TEXT_TONE[tone]}>
                  {label}
                </Text>
              </>
            )}
          </View>
        )}
      </View>
      <Icon name="chevron" size={18} color="textFaint" />
    </Pressable>
  );
}

export default memo(DiscoverRowInner);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingLeft: space.lg,
    paddingRight: Platform.OS === 'ios' ? space.xl : space.lg,
    paddingVertical: space.md,
    minHeight: 76,
  },
  thumb: { width: THUMB_SIZE, height: THUMB_SIZE, borderRadius: radius.thumb },
  info: { flex: 1, gap: 2, minWidth: 0 },
  metaRow: { flexDirection: 'row', alignItems: 'center' },
});
