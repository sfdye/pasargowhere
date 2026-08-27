import type { Lang } from './market-logic.ts';

/**
 * Display-name overrides for NEA friendly names that don't match what people actually call the
 * place. The raw `name` string is market identity (favourites, route params), so the fix is
 * display-only — `getDisplayName` consults this map before falling back to `zhNames` or the
 * friendly name itself.
 *
 * Keys are the *friendly* name as it appears in the NEA dataset. Both languages are required so a
 * missing translation fails typecheck, same guarantee as `zh-names.ts`.
 */
export const NAME_OVERRIDES: Readonly<Record<string, Record<Lang, string>>> = {
  'Kim Hua Market': { en: 'Maxwell Food Centre', zh: '麦士威熟食中心' },
  'Telok Ayer Food Centre': { en: 'Amoy Street Food Centre', zh: '厦门街熟食中心' },
};

export function resolveDisplayName(friendly: string, lang: Lang): string | null {
  const override = NAME_OVERRIDES[friendly];
  return override ? override[lang] : null;
}
