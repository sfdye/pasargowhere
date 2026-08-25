/** One record from the NEA "Dates of Hawker Centres Closure" dataset. */
export interface Market {
  name: string;
  address_myenv?: string;
  photourl?: string;
  latitude_hc?: string;
  longitude_hc?: string;
  no_of_market_stalls?: string;
  no_of_food_stalls?: string;
  q1_cleaningstartdate?: string;
  q1_cleaningenddate?: string;
  q2_cleaningstartdate?: string;
  q2_cleaningenddate?: string;
  q3_cleaningstartdate?: string;
  q3_cleaningenddate?: string;
  q4_cleaningstartdate?: string;
  q4_cleaningenddate?: string;
  other_works_startdate?: string;
  other_works_enddate?: string;
  remarks_other_works?: string;
}

export const LANGS = ['en', 'zh'] as const;

export type Lang = (typeof LANGS)[number];

/**
 * The one membership test for a supported language, so adding a third has a single place to fail.
 * Both callers used to spell the set out themselves — an if-chain in `deviceLang()` and a
 * comparison in `loadLangPref` — and neither would have failed typecheck when `LANGS` grew.
 */
export function isLang(value: unknown): value is Lang {
  return typeof value === 'string' && (LANGS as readonly string[]).includes(value);
}

export type ClosureReason = 'cleaning' | 'other_works' | 'monday';

/** Every reason a notification can be about: Mondays are deliberately never notified. */
export type NotifiableReason = Exclude<ClosureReason, 'monday'>;

export type MarketStatus =
  | { status: 'open' }
  | { status: 'warning'; reason: 'monday' }
  | { status: 'closed'; reason: 'cleaning'; start: Date; end: Date }
  | { status: 'closed'; reason: 'other_works'; remarks: string; start: Date; end: Date };

export interface Closure {
  date: Date;
  /** Last day of this closure range, or `undefined` for a single-day closure. */
  endDate?: Date;
  reason: NotifiableReason;
  remarks?: string;
}

export interface ParsedMarketName {
  /** Street address portion, or '' when the raw name has no parenthesised part. */
  street: string;
  /** Human-facing name — the parenthesised part when present. */
  friendly: string;
}

/** Exported so callers building `${q}_cleaningstartdate` keys resolve to declared fields. */
export const QUARTERS = ['q1', 'q2', 'q3', 'q4'] as const;

/** Parses a `DD/MM/YYYY` string. Returns null for blank or malformed input. */
export function parseDateDMY(str: string | null | undefined): Date | null {
  if (!str || !str.trim()) return null;
  const parts = str.trim().split('/');
  if (parts.length !== 3) return null;
  const d = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  const y = parseInt(parts[2], 10);
  if (isNaN(d) || isNaN(m) || isNaN(y)) return null;
  return new Date(y, m - 1, d);
}

/** Midnight of `date` in the local timezone. */
export function stripTime(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function getMarketStatus(market: Market, date: Date): MarketStatus {
  const today = stripTime(date);

  for (const q of QUARTERS) {
    const start = parseDateDMY(market[`${q}_cleaningstartdate`]);
    const end = parseDateDMY(market[`${q}_cleaningenddate`]);
    if (start && end && today >= start && today <= end) {
      return { status: 'closed', reason: 'cleaning', start, end };
    }
  }

  const owStart = parseDateDMY(market.other_works_startdate);
  const owEnd = parseDateDMY(market.other_works_enddate);
  if (owStart && owEnd && today >= owStart && today <= owEnd) {
    return {
      status: 'closed',
      reason: 'other_works',
      remarks: market.remarks_other_works || '',
      start: owStart,
      end: owEnd,
    };
  }

  if (today.getDay() === 1) {
    return { status: 'warning', reason: 'monday' };
  }

  return { status: 'open' };
}

/**
 * Verified closures (cleaning, other works) over the next `days` days, starting the day after
 * `fromDate`. Monday warnings are excluded: the weekly rest day is a stallholder convention, not
 * an NEA-published closure, so listing it alongside confirmed dates would be unverified noise.
 *
 * Consecutive closed days with the same reason are coalesced into a single range entry
 * (`date` = first day, `endDate` = last day), so a multi-year renovation produces one row,
 * not 365.
 */
export function getUpcomingClosures(market: Market, days: number, fromDate: Date): Closure[] {
  const closures: Closure[] = [];
  const today = stripTime(fromDate);
  let current: Closure | null = null;
  for (let i = 1; i <= days; i++) {
    // Calendar arithmetic, not +86400000: adding fixed milliseconds slips an hour either
    // way across a DST boundary in the device's timezone, which can shift the calendar day.
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
    const result = getMarketStatus(market, date);
    if (result.status !== 'closed') {
      if (current) {
        closures.push(current);
        current = null;
      }
      continue;
    }
    const reason = result.reason;
    const remarks = 'remarks' in result ? result.remarks : undefined;
    if (current && current.reason === reason && current.remarks === remarks) {
      current.endDate = date;
    } else {
      if (current) closures.push(current);
      current = { date, reason, remarks };
    }
  }
  if (current) closures.push(current);
  return closures;
}

/**
 * Next day the market is open or on weekly rest. Checks the current closure's end date first
 * (so a multi-year renovation resolves instantly), then scans day-by-day up to 60 days out.
 */
export function getNextOpenDate(market: Market, fromDate: Date): Date | null {
  const start = stripTime(fromDate);
  const status = getMarketStatus(market, start);
  if (status.status === 'closed' && 'end' in status) {
    return new Date(status.end.getFullYear(), status.end.getMonth(), status.end.getDate() + 1);
  }
  for (let i = 1; i <= 60; i++) {
    const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    const s = getMarketStatus(market, date).status;
    if (s === 'open' || s === 'warning') {
      return date;
    }
  }
  return null;
}

/** Splits `"Blk 1 Foo Rd (Bar Market)"` into street + friendly name, decoding HTML entities. */
export function parseMarketName(rawName: string | null | undefined): ParsedMarketName {
  const name = (rawName || '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  const match = name.match(/^(.+?)\s*\((.+)\)\s*$/);
  if (match) {
    return { street: match[1].trim(), friendly: match[2].trim() };
  }
  return { street: '', friendly: name };
}

/**
 * Irons out the dataset's quirks in place, once, as it arrives — from the network or from the
 * cache — so no screen has to remember to do it.
 *
 * Today that means the photo URLs: NEA serves 88 of the 123 over plain `http://`, which App
 * Transport Security blocks outright, so the image never arrives and the market shows no photo at
 * all. The same paths serve fine over TLS, so upgrade the scheme rather than punch a hole in ATS.
 */
export function normalizeMarkets(markets: Market[]): Market[] {
  for (const market of markets) {
    const url = market.photourl?.trim();
    market.photourl = url ? url.replace(/^http:\/\//i, 'https://') : undefined;
  }
  return markets;
}
