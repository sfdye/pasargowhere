import { useDeferredValue, useMemo, useState } from 'react';
import { FlatList, Linking, StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import PhotoCard from '../../../components/PhotoCard';
import DiscoverRow from '../../../components/DiscoverRow';
import { EmptyState, Row, Segmented, Text } from '../../../components/ui';
import { getMarketCategories } from '../../../lib/core/market-category';
import { FAMOUS_PASARS, famousBlurb } from '../../../lib/core/famous';
import { parseMarketName, type Market } from '../../../lib/core/market-logic';
import { getDisplayName, getMarketDistance, searchMarkets } from '../../../lib/markets';
import { useLang, useMarkets, useReady, useStale, useT } from '../../../lib/store';
import { space, useTheme } from '../../../lib/theme';
import { useLocation } from '../../../lib/useLocation';

type Filter = 'all' | 'wet' | 'food';

export default function DiscoverScreen() {
  const theme = useTheme();
  const t = useT();
  const lang = useLang();
  const ready = useReady();
  const markets = useMarkets();
  const stale = useStale();
  const { coords, status } = useLocation();
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const [filter, setFilter] = useState<Filter>('all');

  const byDistance = useMemo(() => {
    if (!coords) return null;
    return markets
      .slice()
      .sort((a, b) => {
        const da = getMarketDistance(a, coords.lat, coords.lng);
        const db = getMarketDistance(b, coords.lat, coords.lng);
        if (da === null && db === null) return 0;
        if (da === null) return 1;
        if (db === null) return -1;
        return da - db;
      });
  }, [markets, coords]);

  const nearYou = useMemo(() => (byDistance ?? []).slice(0, 10), [byDistance]);

  const famous = useMemo(() => {
    const byFriendly = new Map<string, Market>();
    for (const m of markets) {
      const { friendly } = parseMarketName(m.name);
      if (!byFriendly.has(friendly)) byFriendly.set(friendly, m);
    }
    const resolved = FAMOUS_PASARS.map((f) => byFriendly.get(f.name)).filter((m): m is Market => !!m);
    if (coords) {
      resolved.sort((a, b) => {
        const da = getMarketDistance(a, coords.lat, coords.lng);
        const db = getMarketDistance(b, coords.lat, coords.lng);
        if (da === null && db === null) return 0;
        if (da === null) return 1;
        if (db === null) return -1;
        return da - db;
      });
    }
    return resolved;
  }, [markets, coords]);

  const filtered = useMemo(() => {
    let list = searchMarkets(markets, deferredQuery);
    if (filter !== 'all') {
      list = list.filter((m) => getMarketCategories(m).includes(filter));
    }
    const sorted = list.slice();
    if (coords) {
      sorted.sort((a, b) => {
        const da = getMarketDistance(a, coords.lat, coords.lng);
        const db = getMarketDistance(b, coords.lat, coords.lng);
        if (da === null && db === null) return 0;
        if (da === null) return 1;
        if (db === null) return -1;
        return da - db;
      });
    } else {
      sorted.sort((a, b) => {
        const na = getDisplayName(parseMarketName(a.name), lang).toLowerCase();
        const nb = getDisplayName(parseMarketName(b.name), lang).toLowerCase();
        return na < nb ? -1 : na > nb ? 1 : 0;
      });
    }
    return sorted;
  }, [markets, deferredQuery, filter, coords, lang]);

  if (!ready) return null;

  return (
    <>
      <Stack.Screen
        options={{
          headerSearchBarOptions: {
            placeholder: t('search'),
            onChangeText: (e) => setQuery(e.nativeEvent.text),
            hideWhenScrolling: false,
            textColor: theme.colors.text,
            hintTextColor: theme.colors.textFaint,
            headerIconColor: theme.colors.textMuted,
          },
        }}
      />
      <FlatList
        data={filtered}
        keyExtractor={(m: Market) => m.name}
        renderItem={({ item }) => <DiscoverRow market={item} lang={lang} coords={coords} />}
        contentInsetAdjustmentBehavior="automatic"
        initialNumToRender={10}
        contentContainerStyle={styles.content}
        ItemSeparatorComponent={() => (
          <View style={[styles.separator, { backgroundColor: theme.colors.borderLight }]} />
        )}
        ListHeaderComponent={
          <View style={styles.header}>
            {stale && <Text variant="footnote" tone="muted">{t('offline')}</Text>}

            {coords && nearYou.length > 0 && !deferredQuery && (
              <View style={styles.section}>
                <Text variant="title">{t('discoverNearYou')}</Text>
                <FlatList
                  horizontal
                  data={nearYou}
                  keyExtractor={(m) => m.name}
                  renderItem={({ item }) => (
                    <PhotoCard market={item} lang={lang} coords={coords} />
                  )}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.rail}
                  ItemSeparatorComponent={() => <View style={{ width: space.md }} />}
                />
              </View>
            )}

            {famous.length > 0 && !deferredQuery && (
              <View style={styles.section}>
                <Text variant="title">{t('famousMarkets')}</Text>
                <FlatList
                  horizontal
                  data={famous}
                  keyExtractor={(m) => m.name}
                  renderItem={({ item }) => (
                    <PhotoCard
                      market={item}
                      lang={lang}
                      coords={coords}
                      blurb={famousBlurb(parseMarketName(item.name).friendly, lang) ?? undefined}
                    />
                  )}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.rail}
                  ItemSeparatorComponent={() => <View style={{ width: space.md }} />}
                />
              </View>
            )}

            {!deferredQuery && (
              <View style={styles.filters}>
                <Segmented<Filter>
                  options={[
                    { value: 'all', label: t('filterAll') },
                    { value: 'wet', label: t('filterWet') },
                    { value: 'food', label: t('filterFood') },
                  ]}
                  value={filter}
                  onChange={setFilter}
                />
              </View>
            )}

            {status === 'denied' && !deferredQuery && (
              <Row
                label={t('enableLocation')}
                icon="locate"
                chevron
                onPress={() => void Linking.openSettings()}
                last
              />
            )}
          </View>
        }
        ListEmptyComponent={
          markets.length > 0 ? <EmptyState icon="search" title={t('noResults')} /> : null
        }
      />
    </>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: space.xxl },
  header: { gap: space.lg, paddingVertical: space.md },
  section: { gap: space.sm, paddingHorizontal: space.lg },
  rail: { paddingHorizontal: space.lg },
  filters: { paddingHorizontal: space.lg },
  separator: { height: StyleSheet.hairlineWidth, marginLeft: space.lg },
});
