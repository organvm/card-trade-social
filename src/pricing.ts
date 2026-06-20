/**
 * Pricing engine for the Hydra TCG Platform.
 * Aggregates multi-source pricing data and calculates the "Hydra Price".
 */

import type { EntitlementSubject } from "./subscription";
import { hasEntitlement, requireEntitlement } from "./subscription";

export type PriceSource = "tcgplayer" | "cardkingdom" | "ebay" | "private_auction";

export interface PricePoint {
  source: PriceSource;
  price: number;
  is_sold: boolean;
  timestamp: Date;
}

export interface PriceHistory {
  card_id: string;
  points: PricePoint[];
}

export interface HydraPrice {
  card_id: string;
  price: number;
  confidence: number;
  sources_used: number;
  calculated_at: Date;
}

export interface ArbitrageAlert {
  card_id: string;
  card_name: string;
  low_source: PriceSource;
  low_price: number;
  high_source: PriceSource;
  high_price: number;
  spread: number;
  spread_percentage: number;
}

export interface GatedArbitrageOptions {
  min_spread_percentage?: number;
  free_alert_limit?: number;
  now?: Date;
}

export interface GatedArbitrageAlerts {
  alerts: ArbitrageAlert[];
  total_alerts: number;
  included_alerts: number;
  free_alert_limit: number;
  truncated: boolean;
  requires_pro: boolean;
}

export interface PriceChange {
  card_id: string;
  card_name: string;
  previous_price: number;
  current_price: number;
  change: number;
  change_percentage: number;
}

export const FREE_ARBITRAGE_ALERT_LIMIT = 3;

/**
 * Create a new price history tracker for a card.
 */
export function createPriceHistory(card_id: string): PriceHistory {
  return { card_id, points: [] };
}

/**
 * Record a price point.
 */
export function recordPrice(
  history: PriceHistory,
  source: PriceSource,
  price: number,
  is_sold: boolean
): PriceHistory {
  if (price < 0) {
    throw new Error("Price cannot be negative");
  }

  history.points.push({
    source,
    price,
    is_sold,
    timestamp: new Date(),
  });

  return history;
}

/**
 * Calculate the "Hydra Price" — a weighted average that favors sold listings
 * and filters outliers.
 */
export function calculateHydraPrice(history: PriceHistory): HydraPrice {
  const recentPoints = getRecentPoints(history, 30);

  if (recentPoints.length === 0) {
    return {
      card_id: history.card_id,
      price: 0,
      confidence: 0,
      sources_used: 0,
      calculated_at: new Date(),
    };
  }

  const filtered = filterOutliers(recentPoints);
  const sources = new Set(filtered.map((p) => p.source));

  const SOLD_WEIGHT = 2.0;
  const LISTED_WEIGHT = 1.0;

  let weightedSum = 0;
  let totalWeight = 0;

  for (const point of filtered) {
    const weight = point.is_sold ? SOLD_WEIGHT : LISTED_WEIGHT;
    weightedSum += point.price * weight;
    totalWeight += weight;
  }

  const price = totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 100) / 100 : 0;

  const confidence = Math.min(1, filtered.length / 10) * Math.min(1, sources.size / 2);

  return {
    card_id: history.card_id,
    price,
    confidence: Math.round(confidence * 100) / 100,
    sources_used: sources.size,
    calculated_at: new Date(),
  };
}

/**
 * Get price points from the last N days.
 */
export function getRecentPoints(history: PriceHistory, days: number): PricePoint[] {
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return history.points.filter((p) => p.timestamp >= cutoff);
}

/**
 * Filter outlier prices using IQR method.
 */
export function filterOutliers(points: PricePoint[]): PricePoint[] {
  if (points.length < 4) return points;

  const prices = points.map((p) => p.price).sort((a, b) => a - b);
  const q1 = prices[Math.floor(prices.length * 0.25)];
  const q3 = prices[Math.floor(prices.length * 0.75)];
  const iqr = q3 - q1;
  const lower = q1 - 1.5 * iqr;
  const upper = q3 + 1.5 * iqr;

  return points.filter((p) => p.price >= lower && p.price <= upper);
}

/**
 * Detect arbitrage opportunities across sources.
 */
export function detectArbitrage(
  histories: { card_id: string; card_name: string; history: PriceHistory }[],
  minSpreadPercentage: number = 15
): ArbitrageAlert[] {
  const alerts: ArbitrageAlert[] = [];

  for (const { card_id, card_name, history } of histories) {
    const recent = getRecentPoints(history, 7);
    if (recent.length < 2) continue;

    const bySource = new Map<PriceSource, number[]>();
    for (const point of recent) {
      const prices = bySource.get(point.source) ?? [];
      prices.push(point.price);
      bySource.set(point.source, prices);
    }

    const avgBySource: { source: PriceSource; avg: number }[] = [];
    for (const [source, prices] of bySource.entries()) {
      const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
      avgBySource.push({ source, avg });
    }

    if (avgBySource.length < 2) continue;

    avgBySource.sort((a, b) => a.avg - b.avg);
    const low = avgBySource[0];
    const high = avgBySource[avgBySource.length - 1];
    const spread = high.avg - low.avg;
    const spreadPercentage = (spread / low.avg) * 100;

    if (spreadPercentage >= minSpreadPercentage) {
      alerts.push({
        card_id,
        card_name,
        low_source: low.source,
        low_price: Math.round(low.avg * 100) / 100,
        high_source: high.source,
        high_price: Math.round(high.avg * 100) / 100,
        spread: Math.round(spread * 100) / 100,
        spread_percentage: Math.round(spreadPercentage * 100) / 100,
      });
    }
  }

  return alerts.sort((a, b) => b.spread_percentage - a.spread_percentage);
}

/**
 * Detect arbitrage alerts while preserving a limited free tier and gating
 * unlimited alerts behind Hydra Pro.
 */
export function detectArbitrageWithGate(
  histories: { card_id: string; card_name: string; history: PriceHistory }[],
  subscription: EntitlementSubject,
  options: GatedArbitrageOptions = {}
): GatedArbitrageAlerts {
  const alerts = detectArbitrage(
    histories,
    options.min_spread_percentage ?? 15
  );
  const freeLimit = options.free_alert_limit ?? FREE_ARBITRAGE_ALERT_LIMIT;
  if (!Number.isInteger(freeLimit) || freeLimit < 0) {
    throw new Error("Free alert limit must be a non-negative integer");
  }

  const unlimited = hasEntitlement(
    subscription,
    "portfolio.alerts.unlimited",
    options.now
  );
  const includedAlerts = unlimited ? alerts : alerts.slice(0, freeLimit);

  return {
    alerts: includedAlerts,
    total_alerts: alerts.length,
    included_alerts: includedAlerts.length,
    free_alert_limit: freeLimit,
    truncated: !unlimited && alerts.length > freeLimit,
    requires_pro: !unlimited && alerts.length > freeLimit,
  };
}

export function requireUnlimitedArbitrageAlerts(
  subscription: EntitlementSubject,
  now: Date = new Date()
): void {
  requireEntitlement(subscription, "portfolio.alerts.unlimited", now);
}

/**
 * Calculate price changes between two time periods.
 */
export function calculatePriceChanges(
  entries: { card_id: string; card_name: string; history: PriceHistory }[],
  previousDays: number = 7,
  currentDays: number = 1
): PriceChange[] {
  const changes: PriceChange[] = [];
  const now = Date.now();

  for (const { card_id, card_name, history } of entries) {
    const prevCutoff = new Date(now - previousDays * 24 * 60 * 60 * 1000);
    const currCutoff = new Date(now - currentDays * 24 * 60 * 60 * 1000);

    const prevPoints = history.points.filter(
      (p) => p.timestamp >= prevCutoff && p.timestamp < currCutoff
    );
    const currPoints = history.points.filter((p) => p.timestamp >= currCutoff);

    if (prevPoints.length === 0 || currPoints.length === 0) continue;

    const prevAvg = prevPoints.reduce((s, p) => s + p.price, 0) / prevPoints.length;
    const currAvg = currPoints.reduce((s, p) => s + p.price, 0) / currPoints.length;
    const change = currAvg - prevAvg;
    const changePercentage = prevAvg > 0 ? (change / prevAvg) * 100 : 0;

    changes.push({
      card_id,
      card_name,
      previous_price: Math.round(prevAvg * 100) / 100,
      current_price: Math.round(currAvg * 100) / 100,
      change: Math.round(change * 100) / 100,
      change_percentage: Math.round(changePercentage * 100) / 100,
    });
  }

  return changes.sort((a, b) => Math.abs(b.change_percentage) - Math.abs(a.change_percentage));
}
