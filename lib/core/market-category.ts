import type { Market } from './market-logic.ts';

export type MarketCategory = 'wet' | 'food';

export function getMarketCategories(market: Market): MarketCategory[] {
  const m = parseInt(market.no_of_market_stalls ?? '', 10);
  const f = parseInt(market.no_of_food_stalls ?? '', 10);
  if (!Number.isFinite(m) || !Number.isFinite(f) || m + f === 0) return [];
  const cats: MarketCategory[] = [];
  if (m > 0) cats.push('wet');
  if (f > 0) cats.push('food');
  return cats;
}
