import { memo } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import StatusPill from './StatusPill';
import { Icon, Text } from './ui';
import { getMarketStatus, parseMarketName } from '../lib/core/market-logic';
import type { Market } from '../lib/core/market-logic';
import type { Lang } from '../lib/i18n';
import { formatDistance, getDisplayName, getMarketDistance } from '../lib/markets';
import { statusLabel, statusTone } from '../lib/status';
import type { Coords } from '../lib/useLocation';
import { useT, useToday } from '../lib/store';
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
  const today = useToday();
  const t = useT();

  const parsed = parseMarketName(market.name);
  const displayName = getDisplayName(parsed, lang);
  const status = getMarketStatus(market, today);
  const tone = statusTone(status);
  const label = statusLabel(tone, t);
  const dist = getMarketDistance(market, coords?.lat ?? null, coords?.lng ?? null);

  return (
    <Pressable
      onPress={() => router.push({ pathname: '/market/[name]', params: { name: market.name } })}
      accessibilityRole="button"
      testID="discover-row"
      accessibilityLabel={[displayName, label, dist !== null ? formatDistance(dist) : '']
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
        {dist !== null && (
          <Text variant="subhead" tone="muted">
            {formatDistance(dist)}
          </Text>
        )}
      </View>
      <View style={styles.trailing}>
        <StatusPill tone={tone} label={label} compact style={styles.pill} />
        <Icon name="chevron" size={18} color="textFaint" />
      </View>
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
  trailing: { flexDirection: 'row', alignItems: 'center', gap: space.sm, flexShrink: 0 },
  pill: { maxWidth: 132 },
});
