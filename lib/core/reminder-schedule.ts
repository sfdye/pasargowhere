import { getMarketStatus, getUpcomingClosures, parseMarketName } from './market-logic.ts';
import type { ClosureReason, Lang, Market } from './market-logic.ts';
import { REASON_WORDS } from './reason-words.ts';
import { zhNames } from './zh-names.ts';

export type { Lang };

export interface DateGroup {
  /** Civil date of the closure — local Y/M/D match Singapore's. */
  date: Date;
  /** Display names of every favourite closed on that date, in the user's language. */
  names: string[];
  /** The same markets by their raw NEA name, which is what a lookup needs. */
  rawNames: string[];
  reasons: ClosureReason[];
}

export interface ScheduleEntry {
  identifier: string;
  title: string;
  body: string;
  /** The instant to fire, as a real point in time. */
  at: Date;
  /** Civil date of the closure being reminded about — a day after `at` for the evening reminder. */
  date: Date;
  markets: string[];
  /** Raw NEA names, so a notification tap can open the market it is about. */
  rawNames: string[];
  reasons: ClosureReason[];
}

// Singapore has been a fixed UTC+8 with no DST since 1982, so a constant offset is exact.
const SGT_OFFSET_MS = 8 * 60 * 60 * 1000;

// Far enough ahead to cover the next quarterly cleaning window, short enough that
// per-date grouping keeps us clear of iOS's ~64 pending-request ceiling.
export const HORIZON_DAYS = 90;

/**
 * How many pending requests `rescheduleAll` will hand to the OS. iOS silently keeps only the ~64
 * soonest per app and drops the rest, and the limit is undocumented, so we stay a few short of it.
 * Nothing is lost by truncating: the daily background task reschedules from scratch, topping the
 * queue back up as the near ones fire.
 *
 * Here rather than in `lib/notifications.ts` so it sits with the other two numbers that share the
 * budget — `HORIZON_DAYS` and `MAX_FAVORITES` — and so the schedule tests can assert against the
 * bound the app really applies instead of the raw ceiling.
 */
export const MAX_SCHEDULED_REMINDERS = 56;

/**
 * Closures at or below this many days get a reminder pair for each day (a 3-day cleaning
 * fires six notifications). Longer closures — renovations, multi-month other works — notify
 * only on their genuine first day: the user learned the market is shut on day 1 and doesn't
 * need a daily "still closed" ping for the next 90.
 *
 * The dataset has a hard cliff at 5 days (every cleaning is ≤5; other works are either ≤5 or
 * ≥15), so any threshold from 6–14 behaves identically. 7 is the one-week boundary.
 */
export const LONG_CLOSURE_DAYS = 7;

// Two reminders per closure date, in SGT: after dinner the evening before, and early enough
// the next morning to catch someone before they set out.
const EVENING_BEFORE_HOUR = 19;
const MORNING_OF_HOUR = 6;

/**
 * Today's Singapore calendar date as a Date whose *local* Y/M/D match Singapore's.
 * market-logic.ts reads dates with local getters and parses DD/MM/YYYY into local
 * midnight, so feeding it these "civil" dates keeps status correct in any device timezone.
 */
export function sgToday(now?: Date): Date {
  const sgt = new Date((now || new Date()).getTime() + SGT_OFFSET_MS);
  return new Date(sgt.getUTCFullYear(), sgt.getUTCMonth(), sgt.getUTCDate());
}

/** The real instant of `hour`:00 Singapore time on the given civil date. */
export function sgInstant(civil: Date, hour: number): Date {
  const utc = Date.UTC(civil.getFullYear(), civil.getMonth(), civil.getDate(), hour);
  return new Date(utc - SGT_OFFSET_MS);
}

/** Stable `YYYY-M-D` key for collapsing closures that fall on the same civil date. */
export function civilKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

/**
 * A market's name as it reads in a notification: the parenthesised part when present, and its
 * Chinese name when the app is in Chinese. Notifications used to be half-translated — the copy
 * was Chinese but the names stayed English — because this went through the raw name.
 */
export function displayName(rawName: string, lang: Lang): string {
  const { friendly } = parseMarketName(rawName);
  return lang === 'zh' ? (zhNames[friendly] ?? friendly) : friendly;
}

function findMarket(markets: Market[], name: string): Market | null {
  for (const market of markets) {
    if (market.name === name) return market;
  }
  return null;
}

/**
 * Closures across all favourites over the next HORIZON_DAYS days, collapsed to one entry
 * per date so five favourites closing the same day become one notification.
 *
 * Monday warnings never reach this function — `getUpcomingClosures` returns only verified
 * closures — so the schedule is always confirmed dates only.
 */
export function groupClosuresByDate(
  favorites: string[],
  markets: Market[],
  today: Date,
  lang: Lang
): DateGroup[] {
  const groups = new Map<string, DateGroup>();

  for (const favorite of favorites) {
    const market = findMarket(markets, favorite);
    if (!market) continue;

    for (const closure of getUpcomingClosures(market, HORIZON_DAYS, today)) {
      const end = closure.endDate ?? closure.date;
      const span = Math.round((end.getTime() - closure.date.getTime()) / 86400000) + 1;

      // Long closures notify only on the genuine first day. `getUpcomingClosures` starts
      // scanning the day after today, so an in-progress renovation reappears every rebuild
      // with `closure.date` = tomorrow — probe the previous day: if it was also closed,
      // the genuine start has already passed and the user was notified then (or favourited
      // the market mid-renovation and can see the status in-app).
      let effectiveEnd = end;
      if (span > LONG_CLOSURE_DAYS) {
        const dayBefore = new Date(
          closure.date.getFullYear(),
          closure.date.getMonth(),
          closure.date.getDate() - 1
        );
        if (getMarketStatus(market, dayBefore).status === 'closed') continue;
        effectiveEnd = closure.date;
      }

      for (let d = new Date(closure.date); d <= effectiveEnd; d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)) {
        const key = civilKey(d);
        let group = groups.get(key);
        if (!group) {
          group = { date: new Date(d), names: [], rawNames: [], reasons: [] };
          groups.set(key, group);
        }
        if (!group.rawNames.includes(favorite)) {
          group.rawNames.push(favorite);
          group.names.push(displayName(favorite, lang));
        }
        if (!group.reasons.includes(closure.reason)) group.reasons.push(closure.reason);
      }
    }
  }

  return [...groups.values()].sort((a, b) => a.date.getTime() - b.date.getTime());
}

interface NotificationCopy {
  title(when: 'today' | 'tomorrow', why: string): string;
  body(names: string, when: 'today' | 'tomorrow'): string;
}

const NOTIFICATION_COPY: Record<Lang, NotificationCopy> = {
  en: {
    title: (when, why) =>
      when === 'today' ? `🚫 Closed today ${why}` : `⚠️ Closed tomorrow ${why}`,
    body: (names, when) =>
      when === 'today'
        ? `${names} is closed — don't make the trip!`
        : `${names} is closed tomorrow — plan another day.`,
  },
  zh: {
    title: (when, why) =>
      when === 'today' ? `🚫 今天不营业（${why}）` : `⚠️ 明天不营业（${why}）`,
    body: (names, when) =>
      when === 'today'
        ? `${names} 今天不营业 — 别白跑一趟！`
        : `${names} 明天不营业 — 请改天再去。`,
  },
};

export function notificationCopy(
  group: Pick<DateGroup, 'names' | 'reasons'>,
  isToday: boolean,
  lang: Lang
): { title: string; body: string } {
  const names = group.names.join(', ');
  const cleaningOnly = group.reasons.length === 1 && group.reasons[0] === 'cleaning';
  const why = REASON_WORDS[lang][cleaningOnly ? 'cleaning' : 'other_works'].phrase;
  const when = isToday ? 'today' : 'tomorrow';

  return {
    title: NOTIFICATION_COPY[lang].title(when, why),
    body: NOTIFICATION_COPY[lang].body(names, when),
  };
}

/**
 * The full set of reminders to queue: two per closure date, 7pm the evening before and
 * 6am the morning of, skipping any instant already in the past. Pure — the caller hands
 * these to expo-notifications.
 */
export function buildSchedule(
  favorites: string[],
  markets: Market[],
  lang: Lang,
  now?: Date
): ScheduleEntry[] {
  const at = now || new Date();
  const groups = groupClosuresByDate(favorites, markets, sgToday(at), lang);
  const entries: ScheduleEntry[] = [];

  for (const group of groups) {
    const d = group.date;
    const dayBefore = new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1);
    const slots = [
      { slot: 'eve', when: sgInstant(dayBefore, EVENING_BEFORE_HOUR), isToday: false },
      { slot: 'morn', when: sgInstant(d, MORNING_OF_HOUR), isToday: true },
    ];

    for (const { slot, when, isToday } of slots) {
      if (when.getTime() <= at.getTime()) continue;
      const copy = notificationCopy(group, isToday, lang);
      entries.push({
        identifier: `oa-${civilKey(d)}-${slot}`,
        title: copy.title,
        body: copy.body,
        at: when,
        date: d,
        markets: group.names.slice(),
        rawNames: group.rawNames.slice(),
        reasons: group.reasons.slice(),
      });
    }
  }

  return entries;
}
