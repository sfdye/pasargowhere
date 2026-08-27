import type { ConfigContext, ExpoConfig } from 'expo/config';

/**
 * `app.json` stays the base and the only place plugin config lives; this file exists solely to give
 * the dev build its own identity. Under `APP_VARIANT=development` the ids, name and scheme all
 * change, so the dev and release apps sit side by side instead of overwriting each other.
 *
 * `slug` and `extra.eas.projectId` deliberately do not change: both variants are the same EAS
 * project, so builds and credentials stay in one place.
 */
export default ({ config }: ConfigContext): ExpoConfig => {
  if (process.env.APP_VARIANT !== 'development') return config as ExpoConfig;

  const id = `${config.ios?.bundleIdentifier}.dev`;

  return {
    ...config,
    name: 'PasarGuru Dev',
    // Dropped so the dev build keeps its English name on a Chinese phone: `app.json`'s localised
    // label would otherwise make both apps read 巴刹通 on the home screen.
    locales: undefined,
    // Derived, so it cannot drift from `app.json`. A scheme of its own matters: sharing the release
    // one would leave iOS to pick whichever app it liked for a deep link.
    scheme: `${config.scheme}dev`,
    // Spread, not replaced, so `app.json`'s icon variants reach the dev app too.
    ios: { ...config.ios, bundleIdentifier: id },
    android: { ...config.android, package: id },
  } as ExpoConfig;
};
