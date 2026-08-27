import type { Lang } from './market-logic.ts';

/**
 * Hand-curated famous pasars for the Discover tab, backed by online features from the Michelin
 * Guide, Time Out Singapore, Forbes, and food blogs. Keys are the *friendly* name — the
 * parenthesised part of the NEA `name` string — and must match the live dataset exactly. The list
 * is resolved at runtime against the loaded dataset, so a name that leaves the NEA data simply
 * disappears from the collection rather than crashing — same prune-by-existence pattern as
 * favourites.
 *
 * Claim-to-fame blurbs are worded here in both languages, following the `reason-words.ts` pattern:
 * `Record<Lang, string>` per entry so a missing translation fails typecheck.
 *
 * OTA-updatable: this is plain JS, so `eas update` can refresh the list without a store build.
 * Order is the editorial ranking — the fallback when no location fix is available.
 */
export interface FamousPasar {
  /** Friendly name as it appears in the NEA dataset (after parseMarketName). */
  name: string;
  blurb: Record<Lang, string>;
}

export const FAMOUS_PASARS: readonly FamousPasar[] = [
  {
    name: 'Kim Hua Market',
    blurb: {
      en: 'Michelin-listed Tian Tian chicken rice',
      zh: '米其林推荐天天海南鸡饭',
    },
  },
  {
    name: 'Chinatown Complex Market',
    blurb: {
      en: "Largest hawker centre; first Michelin-starred stall",
      zh: '最大小贩中心；首家米其林一星摊位',
    },
  },
  {
    name: '51 Old Airport Road Food Centre and Shopping Mall',
    blurb: {
      en: 'Heritage favourite since the 1970s',
      zh: '1970年代至今的传承美味',
    },
  },
  {
    name: 'Tiong Bahru Market',
    blurb: {
      en: 'Beloved market in a historic estate',
      zh: '历史街区中的邻里巴刹',
    },
  },
  {
    name: 'Telok Ayer Food Centre',
    blurb: {
      en: 'Most Michelin-listed stalls in one centre',
      zh: '单座小贩中心最多米其林推荐摊位',
    },
  },
  {
    name: 'Tekka Centre/Zhu Jiao Market',
    blurb: {
      en: 'Little India landmark since pre-independence',
      zh: '独立前至今的小印度地标',
    },
  },
  {
    name: 'Hong Lim Food Centre and Market',
    blurb: {
      en: 'Michelin-starred Tai Wah pork noodle',
      zh: '米其林一星大华猪肉粿条面',
    },
  },
  {
    name: 'Newton Food Centre',
    blurb: {
      en: 'Featured in Crazy Rich Asians',
      zh: '《疯狂的亚洲富豪》取景地',
    },
  },
  {
    name: 'Adam Road Food Centre',
    blurb: {
      en: 'Famous for Selera Rasa nasi lemak',
      zh: '驰名 Selera Rasa 椰浆饭',
    },
  },
  {
    name: 'Golden Mile Food Centre',
    blurb: {
      en: "Time Out pick; 'Beach Road Army Market'",
      zh: 'Time Out 精选；"美芝路兵营巴刹"',
    },
  },
  {
    name: 'Chomp Chomp Food Centre',
    blurb: {
      en: 'Late-night Serangoon Gardens institution',
      zh: '实龙岗花园深夜美食圣地',
    },
  },
  {
    name: 'Whampoa Drive Makan Place/Whampoa Food Centre',
    blurb: {
      en: 'Famous soya beancurd and fish soup',
      zh: '驰名豆花与鱼汤',
    },
  },
  {
    name: 'Whampoa Drive Makan Place/Whampoa Market',
    blurb: {
      en: 'Heritage wet market with popular hawker stalls',
      zh: '传统湿巴刹与人气熟食摊位',
    },
  },
  {
    name: 'Ghim Moh Road Blk 20',
    blurb: {
      en: 'Old-school carrot cake and Bib Gourmand stalls',
      zh: '老字号菜头粿与必比登推荐摊位',
    },
  },
];

const FAMOUS_NAMES = new Set(FAMOUS_PASARS.map((f) => f.name));

export function isFamous(friendlyName: string): boolean {
  return FAMOUS_NAMES.has(friendlyName);
}

export function famousBlurb(friendlyName: string, lang: Lang): string | null {
  const entry = FAMOUS_PASARS.find((f) => f.name === friendlyName);
  return entry ? entry.blurb[lang] : null;
}
