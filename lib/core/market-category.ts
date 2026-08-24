import type { Market } from './market-logic.ts';

export type MarketCategory = 'wet' | 'food' | 'mixed';

export function getMarketCategory(market: Market): MarketCategory | null {
  const m = parseInt(market.no_of_market_stalls ?? '', 10);
  const f = parseInt(market.no_of_food_stalls ?? '', 10);
  if (!Number.isFinite(m) || !Number.isFinite(f) || m + f === 0) return null;
  if (m === 0 && f > 0) return 'food';
  if (f === 0 && m > 0) return 'wet';
  const ratio = m / (m + f);
  if (ratio >= 0.6) return 'wet';
  if (ratio <= 0.4) return 'food';
  return 'mixed';
}
