import { memo } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Icon, Text } from './ui';
import { parseMarketName } from '../lib/core/market-logic';
import { resolveHoursDisplay, sgMinutes } from '../lib/core/market-hours';
import type { Market } from '../lib/core/market-logic';
import type { Lang } from '../lib/i18n';
import { formatDistance, getDisplayName, getMarketDistance } from '../lib/markets';
import type { Coords } from '../lib/useLocation';
import { radius, space, useTheme } from '../lib/theme';

const THUMB_SIZE = 56;

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

  const parsed = parseMarketName(market.name);
  const displayName = getDisplayName(parsed, lang);
  const dist = getMarketDistance(market, coords?.lat ?? null, coords?.lng ?? null);

  const hoursDisplay = resolveHoursDisplay(market.name, new Date().getDay(), sgMinutes());
  const isOpen = hoursDisplay.kind === 'open' || hoursDisplay.kind === 'open24h';
  const isSoon = hoursDisplay.kind === 'opensSoon' || hoursDisplay.kind === 'closesSoon';
  const showStatus = hoursDisplay.kind !== 'noData';
  const statusLabel = isSoon
    ? lang === 'zh'
      ? (hoursDisplay.kind === 'opensSoon' ? '即将开始营业' : '即将结束营业')
      : (hoursDisplay.kind === 'opensSoon' ? 'Opens soon' : 'Closes soon')
    : isOpen
      ? lang === 'zh' ? '正在营业' : 'Open'
      : lang === 'zh' ? '已结束营业' : 'Closed';

  return (
    <Pressable
      onPress={() => router.push({ pathname: '/market/[name]', params: { name: market.name } })}
      accessibilityRole="button"
      testID="discover-row"
      accessibilityLabel={[displayName, dist !== null ? formatDistance(dist) : '']
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
                <Text variant="subhead" tone={isSoon ? 'warning' : isOpen ? 'accent' : 'danger'}>
                  {statusLabel}
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
