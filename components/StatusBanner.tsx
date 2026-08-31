import { StyleSheet, View } from 'react-native';
import { Text } from './ui';
import type { MarketStatus } from '../lib/core/market-logic';
import type { DisplayTone } from '../lib/core/display-status';
import { getMarketHours, getTodayHoursLabel, type DayKey, type HoursDisplay } from '../lib/core/market-hours';
import { DOW_SHORT, formatDate } from '../lib/date';
import { reasonText, statusLabel } from '../lib/status';
import { useLang, useT } from '../lib/store';
import { radius, space, useTheme } from '../lib/theme';

const FILL: Record<DisplayTone, 'statusOpen' | 'statusWarn' | 'statusSoon' | 'statusClosed'> = {
  open: 'statusOpen',
  warning: 'statusWarn',
  soon: 'statusSoon',
  closed: 'statusClosed',
};

/** The one thing the detail screen has to answer: is it open today, and if not, why. */
export default function StatusBanner({
  status,
  tone,
  nextOpen,
  hoursDisplay,
  marketName,
}: {
  status: MarketStatus;
  tone: DisplayTone;
  nextOpen: Date | null;
  hoursDisplay?: HoursDisplay | null;
  marketName?: string;
}) {
  const theme = useTheme();
  const lang = useLang();
  const t = useT();

  const reason = reasonText(status, t);
  const label = statusLabel(tone, t, hoursDisplay);

  const DAY_KEY_TO_DOW: Record<string, number> = {
    sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6,
  };

  const subtitle =
    hoursDisplay?.kind === 'open' && hoursDisplay.closesAt
      ? t('closesAt', { time: hoursDisplay.closesAt })
      : hoursDisplay?.kind === 'closesSoon' && hoursDisplay.closesAt
        ? t('closesSoon', { time: hoursDisplay.closesAt })
        : hoursDisplay?.kind === 'opensSoon' && hoursDisplay.opensAt
          ? t('opensSoon', { time: hoursDisplay.opensAt })
          : hoursDisplay?.kind === 'closedByHours' && hoursDisplay.opensAt
            ? t('opensAt', {
                time: hoursDisplay.opensAt,
                day: hoursDisplay.opensAtDay
                  ? lang === 'zh'
                    ? DOW_SHORT.zh[DAY_KEY_TO_DOW[hoursDisplay.opensAtDay]]
                    : ' ' + DOW_SHORT.en[DAY_KEY_TO_DOW[hoursDisplay.opensAtDay]]
                  : '',
              })
            : null;

  return (
    <View style={[styles.banner, { backgroundColor: theme.colors[FILL[tone]] }]}>
      <Text variant="title" tone="onStatus" style={styles.centered}>
        {label}
      </Text>
      {!!subtitle && (
        <Text variant="subhead" tone="onStatus" style={[styles.centered, styles.dim]}>
          {subtitle}
        </Text>
      )}
      {!!reason && !subtitle && (
        <Text variant="subhead" tone="onStatus" style={styles.centered}>
          {reason}
        </Text>
      )}
      {!!nextOpen && tone === 'closed' && !subtitle && (() => {
        const hours = marketName ? getMarketHours(marketName) : null;
        const openTime = hours ? getTodayHoursLabel(hours, nextOpen.getDay()) : null;
        const timeStr = openTime ? openTime.split(/[–-]/)[0]?.trim() : null;
        const dayStr = DOW_SHORT[lang][nextOpen.getDay()];
        const dateStr = formatDate(nextOpen, lang);
        return (
          <Text variant="subhead" tone="onStatus" style={[styles.centered, styles.dim]}>
            {t('opensAgain', { time: timeStr ?? '', day: dayStr, date: dateStr })}
          </Text>
        );
      })()}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { gap: space.xs, padding: space.lg, borderRadius: radius.banner },
  centered: { textAlign: 'center' },
  dim: { opacity: 0.9 },
});
