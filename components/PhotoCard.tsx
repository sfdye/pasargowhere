import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import StatusPill from './StatusPill';
import { Text } from './ui';
import { getMarketStatus, parseMarketName } from '../lib/core/market-logic';
import type { Market } from '../lib/core/market-logic';
import type { Lang } from '../lib/i18n';
import { formatDistance, getDisplayName, getMarketDistance } from '../lib/markets';
import { statusLabel, statusTone } from '../lib/status';
import type { Coords } from '../lib/useLocation';
import { useT, useToday } from '../lib/store';
import { radius, space, useTheme } from '../lib/theme';

const CARD_W = 200;
const CARD_H = 140;

function PhotoCardInner({
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
      testID="photo-card"
      accessibilityLabel={[displayName, label, dist !== null ? formatDistance(dist) : '']
        .filter(Boolean)
        .join('. ')}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: pressed ? theme.colors.borderLight : theme.colors.surface },
      ]}
    >
      <Image
        source={market.photourl ? { uri: market.photourl } : undefined}
        style={[styles.image, { backgroundColor: theme.colors.borderLight }]}
        contentFit="cover"
        cachePolicy="memory-disk"
        transition={150}
        accessible={false}
      />
      <View style={styles.body}>
        <Text variant="bodyStrong" numberOfLines={1}>
          {displayName}
        </Text>
        <View style={styles.meta}>
          <StatusPill tone={tone} label={label} compact />
          {dist !== null && (
            <Text variant="footnote" tone="muted">
              {formatDistance(dist)}
            </Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}

export default memo(PhotoCardInner);

const styles = StyleSheet.create({
  card: {
    width: CARD_W,
    borderRadius: radius.card,
    overflow: 'hidden',
  },
  image: { width: CARD_W, height: CARD_H },
  body: { padding: space.sm, gap: space.xs },
  meta: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
});
