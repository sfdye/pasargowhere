import { getMarketStatus, type Market, type MarketStatus } from './market-logic.ts';
import { resolveHoursDisplay, type HoursDisplay } from './market-hours.ts';

export type DisplayTone = 'open' | 'warning' | 'closed' | 'soon';

export interface DisplayStatus {
  status: MarketStatus;
  hours: HoursDisplay | null;
  tone: DisplayTone;
}

/**
 * The single derivation of what a row, card, or banner should show: NEA status first
 * (cleaning / other works / Monday warning), and only when the NEA status is `open` does
 * it consult operating-hours data for time-of-day tone overrides.
 *
 * `today` must be a civil date from `sgToday()` so `getDay()` returns the Singapore day of
 * week, not the device's local one.
 */
export function getDisplayStatus(market: Market, today: Date, minutes: number): DisplayStatus {
  const status = getMarketStatus(market, today);
  const hours = status.status === 'open'
    ? resolveHoursDisplay(market.name, today.getDay(), minutes)
    : null;
  const tone: DisplayTone =
    hours?.kind === 'closedByHours'
      ? 'closed'
      : hours?.kind === 'opensSoon' || hours?.kind === 'closesSoon'
        ? 'soon'
        : status.status === 'open'
          ? 'open'
          : status.status === 'warning'
            ? 'warning'
            : 'closed';
  return { status, hours, tone };
}
