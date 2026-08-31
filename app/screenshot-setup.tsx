import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Text } from '../components/ui';
import { saveFavorites, saveScreenshotDate } from '../lib/storage';
import { space, useTheme } from '../lib/theme';

export default function ScreenshotSetupScreen() {
  const { date, favorites } = useLocalSearchParams<{ date?: string; favorites?: string }>();
  const theme = useTheme();
  const [status, setStatus] = useState('Setting up...');

  useEffect(() => {
    if (!date) {
      setStatus('Missing date parameter');
      return;
    }
    void (async () => {
      await saveScreenshotDate(date);
      if (favorites) {
        const names = favorites.split('|').filter(Boolean);
        await saveFavorites(names);
      }
      setStatus(`Screenshot date set to ${date}. Relaunch the app to apply.`);
    })();
  }, [date, favorites]);

  return (
    <>
      <Stack.Screen options={{ title: 'Screenshot Setup' }} />
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: space.xl, backgroundColor: theme.colors.bg }}>
        <Text variant="body">{status}</Text>
      </View>
    </>
  );
}
