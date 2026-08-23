import { StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { radius } from '../lib/theme';

export default function MarketPhoto({ uri }: { uri: string }) {
  return (
    <Image
      source={{ uri }}
      style={styles.hero}
      contentFit="cover"
      cachePolicy="memory-disk"
      transition={200}
      accessible={false}
    />
  );
}

const styles = StyleSheet.create({
  hero: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: radius.card,
    backgroundColor: 'transparent',
  },
});
