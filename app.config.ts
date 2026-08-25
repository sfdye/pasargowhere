import type { ConfigContext, ExpoConfig } from 'expo/config';

/**
 * `app.json` stays the base and the only place plugin config lives; this file exists solely to give
 * the dev build its own identity.
 *
 * A dev client sharing `com.sfdye.pasargowhere` overwrites the TestFlight app — same bundle
 * identifier, same slot on the device — so installing one used to mean losing the other. Under
 * `APP_VARIANT=development` the ids, name and scheme all change, and the two apps sit side by side.
 *
 * `slug` and `extra.eas.projectId` deliberately do not change: both variants are the same EAS
 * project, so builds and credentials stay in one place.
 */
export default ({ config }: ConfigContext): ExpoConfig => {
  const base = config as ExpoConfig;

  // OneMap routing API token — set via env var at build time (EAS secret or local .env).
  // Free registration at onemap.gov.sg. Token has a 3-day TTL; see lib/onemap-routing.ts.
  const extra = {
    ...base.extra,
    onemapToken: process.env.ONEMAP_TOKEN,
  };

  if (process.env.APP_VARIANT !== 'development') {
    return { ...base, extra };
  }

  const id = `${base.ios?.bundleIdentifier}.dev`;

  return {
    ...base,
    extra,
    // Truncates to "PasarGoWhe…" on the home screen, which still reads as distinct from the
    // release app; every other surface that shows an app name has room for it in full.
    name: 'PasarGoWhere Dev',
    // Dropped so the dev build keeps that name on a Chinese phone: `app.json`'s localised label
    // would otherwise make both apps read 巴刹GoWhere on the home screen.
    locales: undefined,
    // Derived, so it cannot drift from `app.json`. A scheme of its own matters: sharing the release
    // one would leave iOS to pick whichever app it liked for a deep link.
    scheme: `${base.scheme}dev`,
    // Spread, not replaced, so `app.json`'s icon variants reach the dev app too.
    ios: { ...base.ios, bundleIdentifier: id },
    android: { ...base.android, package: id },
  } as ExpoConfig;
};
