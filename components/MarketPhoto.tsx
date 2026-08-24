import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { radius, useTheme } from '../lib/theme';

export default function MarketPhoto({ uri }: { uri: string }) {
  const theme = useTheme();
  const [failed, setFailed] = useState(false);

  if (failed) return null;

  return (
    <Image
      source={{ uri }}
      style={[styles.hero, { backgroundColor: theme.colors.borderLight }]}
      contentFit="cover"
      cachePolicy="memory-disk"
      transition={200}
      onError={() => setFailed(true)}
      accessible={false}
    />
  );
}

const styles = StyleSheet.create({
  hero: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: radius.card,
  },
});
