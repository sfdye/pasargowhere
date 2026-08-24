import { Tabs } from 'expo-router/js-tabs';
import { Icon } from '../../components/ui';
import { useT } from '../../lib/store';

export default function TabsLayout() {
  const t = useT();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="(discover)"
        options={{
          title: t('tabDiscover'),
          tabBarButtonTestID: 'tab-discover',
          tabBarIcon: ({ focused, color }) => (
            <Icon name={focused ? 'discover' : 'discoverOutline'} size={26} color={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="(map)"
        options={{
          title: t('tabMap'),
          tabBarButtonTestID: 'tab-map',
          tabBarIcon: ({ focused, color }) => (
            <Icon name={focused ? 'map' : 'mapOutline'} size={26} color={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="(mypasars)"
        options={{
          title: t('tabMyPasars'),
          tabBarButtonTestID: 'tab-mypasars',
          tabBarIcon: ({ focused, color }) => (
            <Icon name={focused ? 'today' : 'todayOutline'} size={26} color={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="(settings)"
        options={{
          title: t('tabSettings'),
          tabBarButtonTestID: 'tab-settings',
          tabBarIcon: ({ focused, color }) => (
            <Icon
              name={focused ? 'settings' : 'settingsOutline'}
              size={26}
              color={color as string}
            />
          ),
        }}
      />
    </Tabs>
  );
}
