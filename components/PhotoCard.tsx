import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Text } from './ui';
import { parseMarketName } from '../lib/core/market-logic';
import type { Market } from '../lib/core/market-logic';
import type { Lang } from '../lib/i18n';
import { formatDistance, getDisplayName, getMarketDistance } from '../lib/markets';
import type { Coords } from '../lib/useLocation';
import { radius, space, useTheme } from '../lib/theme';

const CARD_W = 200;
const CARD_W_FEATURED = 240;
const CARD_H = 140;

function PhotoCardInner({
  market,
  lang,
  coords,
  blurb,
}: {
  market: Market;
  lang: Lang;
  coords: Coords | null;
  blurb?: string;
}) {
  const router = useRouter();
  const theme = useTheme();

  const parsed = parseMarketName(market.name);
  const displayName = getDisplayName(parsed, lang);
  const dist = getMarketDistance(market, coords?.lat ?? null, coords?.lng ?? null);
  const cardW = blurb ? CARD_W_FEATURED : CARD_W;

  return (
    <Pressable
      onPress={() => router.push({ pathname: '/market/[name]', params: { name: market.name } })}
      accessibilityRole="button"
      testID="photo-card"
      accessibilityLabel={[displayName, dist !== null ? formatDistance(dist) : '', blurb]
        .filter(Boolean)
        .join('. ')}
      style={({ pressed }) => [
        styles.card,
        { width: cardW, backgroundColor: pressed ? theme.colors.borderLight : theme.colors.surface },
      ]}
    >
      <Image
        source={market.photourl ? { uri: market.photourl } : undefined}
        style={[styles.image, { width: cardW, backgroundColor: theme.colors.borderLight }]}
        contentFit="cover"
        cachePolicy="memory-disk"
        transition={150}
        accessible={false}
      />
      <View style={styles.body}>
        <Text variant="bodyStrong" numberOfLines={1}>
          {displayName}
        </Text>
        {blurb && (
          <Text variant="footnote" tone="muted" numberOfLines={2}>
            {blurb}
          </Text>
        )}
        {dist !== null && (
          <Text variant="footnote" tone="muted">
            {formatDistance(dist)}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

export default memo(PhotoCardInner);

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.card,
    overflow: 'hidden',
  },
  image: { height: CARD_H },
  body: { padding: space.sm, gap: space.xs },
});
