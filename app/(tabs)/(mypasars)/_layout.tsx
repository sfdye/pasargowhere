import { Stack } from 'expo-router';
import { useT } from '../../../lib/store';

export default function MyPasarsLayout() {
  const t = useT();

  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: t('tabMyPasars'), headerLargeTitle: true }} />
    </Stack>
  );
}
