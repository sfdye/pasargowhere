/**
 * Hand-curated famous pasars for the Discover tab. Keys are the *friendly* name — the
 * parenthesised part of the NEA `name` string (e.g. "Maxwell Food Centre" from
 * "108 Maxwell Rd (Maxwell Food Centre)"). The list is resolved at runtime against the
 * loaded dataset, so a name that leaves the NEA data simply disappears from the collection
 * rather than crashing — same prune-by-existence pattern as favourites.
 *
 * OTA-updatable: this is plain JS, so `eas update` can refresh the list without a store build.
 * Edit the list here; the zh display name comes from `zh-names.ts` as it does everywhere else.
 */
export const FAMOUS_PASARS: readonly string[] = [
  'Maxwell Food Centre',
  'Amoy Street Food Centre',
  'Old Airport Road Food Centre',
  'Tiong Bahru Market',
  'Chinatown Complex Market',
  'Tekka Centre',
  'Adam Road Food Centre',
  'Hong Lim Food Centre',
  'Ghim Moh Market',
  'Whampoa Market',
];

export function isFamous(friendlyName: string): boolean {
  return FAMOUS_PASARS.includes(friendlyName);
}
