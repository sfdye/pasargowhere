import { Linking, StyleSheet, View } from 'react-native';
import { Button, Icon, Text } from './ui';
import { useT } from '../lib/store';
import { useLocation } from '../lib/useLocation';
import { radius, space, useTheme } from '../lib/theme';

/**
 * The permission card on Discover and Add Markets: explains the value before the ask, shows the
 * system dialog only on the button tap, and routes a blocked permission to Settings instead.
 * Renders nothing until the mount probe has settled, so an existing grant never flashes it.
 */
export default function LocationPrompt() {
  const theme = useTheme();
  const t = useT();
  const { status, probed, request } = useLocation();

  if (!probed || (status !== 'idle' && status !== 'denied')) return null;
  const denied = status === 'denied';

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.colors.noticeBg, borderColor: theme.colors.noticeBorder },
      ]}
    >
      <View style={styles.heading}>
        <Icon name="locate" size={22} color="statusWarn" />
        <Text variant="bodyStrong" style={styles.title}>
          {t('locationCardTitle')}
        </Text>
      </View>
      <Text variant="subhead" tone="muted">
        {denied ? t('locationDeniedDesc') : t('locationCardDesc')}
      </Text>
      <Button
        title={denied ? t('openSettings') : t('locationEnable')}
        icon={denied ? 'settings' : 'locate'}
        onPress={() => (denied ? void Linking.openSettings() : void request())}
        testID="enable-location"
        block={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: space.sm, padding: space.lg, borderWidth: 1, borderRadius: radius.card },
  heading: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  title: { flex: 1 },
});
