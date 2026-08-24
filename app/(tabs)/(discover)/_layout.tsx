import { Stack } from 'expo-router';
import { useT } from '../../../lib/store';

export default function DiscoverLayout() {
  const t = useT();

  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: '' }} />
    </Stack>
  );
}
