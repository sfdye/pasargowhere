import type { MarketStatus, NotifiableReason } from './core/market-logic';
import type { HoursDisplay } from './core/market-hours';
import { decodeEntities } from './markets';
import type { Translate } from './store';

export type StatusTone = 'open' | 'warning' | 'closed' | 'soon';

export function statusTone(status: MarketStatus): StatusTone {
  return status.status === 'open' ? 'open' : status.status === 'warning' ? 'warning' : 'closed';
}

const LABELS = { open: 'openToday', warning: 'warningToday', closed: 'closedToday' } as const;
const TIME_LABELS = { open: 'openNow', closed: 'closedNow' } as const;

/**
 * The label on a pill or banner: OPEN / CLOSED / REST DAY.
 * When hours data is available, OPEN 24H replaces OPEN for 24-hour markets.
 */
export function statusLabel(
  tone: StatusTone,
  t: Translate,
  hoursDisplay?: HoursDisplay | null
): string {
  if (hoursDisplay?.kind === 'opensSoon') return t('closedNow');
  if (hoursDisplay?.kind === 'closesSoon') return t('openNow');
  if (tone === 'warning') return t(LABELS.warning);
  if (tone === 'closed') return t(LABELS.closed);
  // tone === 'open'
  if (hoursDisplay?.kind === 'open24h') return t('open24h');
  if (hoursDisplay && hoursDisplay.kind !== 'noData') return t(TIME_LABELS.open);
  return t(LABELS.open);
}

/** Why the market is in this state, one line. Empty when it is simply open. */
export function reasonText(status: MarketStatus, t: Translate): string {
  if (status.status === 'warning') return t('reasonMonday');
  if (status.status === 'closed') {
    if (status.reason === 'cleaning') return t('reasonCleaning');
    return status.remarks ? decodeEntities(status.remarks) : t('otherWorks');
  }
  return '';
}

/** The same thing for a row in the upcoming-closures list, where space is tight. */
export function closureReasonShort(
  reason: NotifiableReason,
  remarks: string | undefined,
  t: Translate
): string {
  if (reason === 'cleaning') return t('cleaning');
  return remarks ? decodeEntities(remarks) : t('otherWorks');
}
