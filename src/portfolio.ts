/**
 * Portfolio — collection tracking, valuation, and allocation for the Hydra TCG Platform.
 */

import type { Card, CardGame, Rarity } from "./card";
import { bestVariantPrice, adjustedPrice } from "./card";
import type { EntitlementSubject } from "./subscription";
import {
  getCatalogingLimits,
  hasEntitlement,
  requireEntitlement,
} from "./subscription";

export interface PortfolioEntry {
  card: Card;
  quantity: number;
  purchase_price?: number;
  added_at: Date;
}

export interface Portfolio {
  owner_id: string;
  entries: Map<string, PortfolioEntry>;
  created_at: Date;
}

export interface AllocationBreakdown {
  game: CardGame;
  value: number;
  percentage: number;
}

export interface PortfolioStats {
  total_cards: number;
  total_value: number;
  daily_pnl?: number;
  allocations: AllocationBreakdown[];
}

export interface PortfolioPositionAnalytics {
  card_id: string;
  card_name: string;
  quantity: number;
  market_value: number;
  cost_basis: number;
  unrealized_pnl: number;
  weight_percentage: number;
}

export interface AdvancedPortfolioAnalytics {
  total_cards: number;
  total_value: number;
  total_cost_basis: number;
  unrealized_pnl: number;
  unrealized_pnl_percentage: number;
  concentration_score: number;
  concentration_risk: "low" | "medium" | "high";
  largest_position?: PortfolioPositionAnalytics;
  positions: PortfolioPositionAnalytics[];
}

export interface CatalogingDecision {
  allowed: boolean;
  current_cards: number;
  requested_cards: number;
  max_cards: number;
  requires_pro: boolean;
}

/**
 * Create a new empty portfolio.
 */
export function createPortfolio(owner_id: string): Portfolio {
  return {
    owner_id,
    entries: new Map(),
    created_at: new Date(),
  };
}

/**
 * Add a card to the portfolio. If the card already exists, increment quantity.
 */
export function addCard(
  portfolio: Portfolio,
  card: Card,
  quantity: number = 1,
  purchase_price?: number
): Portfolio {
  if (quantity <= 0) {
    throw new Error("Quantity must be positive");
  }

  const existing = portfolio.entries.get(card.card_id);
  if (existing) {
    existing.quantity += quantity;
  } else {
    portfolio.entries.set(card.card_id, {
      card,
      quantity,
      purchase_price,
      added_at: new Date(),
    });
  }

  return portfolio;
}

/**
 * Remove a card (or reduce quantity) from the portfolio.
 */
export function removeCard(
  portfolio: Portfolio,
  card_id: string,
  quantity: number = 1
): Portfolio {
  const entry = portfolio.entries.get(card_id);
  if (!entry) {
    throw new Error(`Card ${card_id} not found in portfolio`);
  }

  if (quantity <= 0) {
    throw new Error("Quantity must be positive");
  }

  if (quantity >= entry.quantity) {
    portfolio.entries.delete(card_id);
  } else {
    entry.quantity -= quantity;
  }

  return portfolio;
}

/**
 * Calculate total portfolio value based on best variant prices and condition.
 */
export function portfolioValue(portfolio: Portfolio): number {
  let total = 0;
  for (const entry of portfolio.entries.values()) {
    const base = bestVariantPrice(entry.card);
    const adjusted = adjustedPrice(base, entry.card.condition);
    total += adjusted * entry.quantity;
  }
  return Math.round(total * 100) / 100;
}

/**
 * Calculate asset allocation breakdown by game.
 */
export function getAllocations(portfolio: Portfolio): AllocationBreakdown[] {
  const gameValues = new Map<CardGame, number>();

  for (const entry of portfolio.entries.values()) {
    const base = bestVariantPrice(entry.card);
    const adjusted = adjustedPrice(base, entry.card.condition);
    const value = adjusted * entry.quantity;
    const current = gameValues.get(entry.card.game) ?? 0;
    gameValues.set(entry.card.game, current + value);
  }

  const total = portfolioValue(portfolio);
  const allocations: AllocationBreakdown[] = [];

  for (const [game, value] of gameValues.entries()) {
    allocations.push({
      game,
      value: Math.round(value * 100) / 100,
      percentage: total > 0 ? Math.round((value / total) * 10000) / 100 : 0,
    });
  }

  return allocations.sort((a, b) => b.value - a.value);
}

/**
 * Get portfolio statistics.
 */
export function getStats(portfolio: Portfolio): PortfolioStats {
  return {
    total_cards: totalCards(portfolio),
    total_value: portfolioValue(portfolio),
    allocations: getAllocations(portfolio),
  };
}

/**
 * Calculate Pro-only portfolio analytics: cost basis, unrealized P&L,
 * position weights, and concentration risk.
 */
export function getAdvancedAnalytics(
  portfolio: Portfolio,
  subscription: EntitlementSubject,
  now: Date = new Date()
): AdvancedPortfolioAnalytics {
  requireEntitlement(subscription, "portfolio.analytics.advanced", now);

  const total_value = portfolioValue(portfolio);
  const positions: PortfolioPositionAnalytics[] = [];
  let total_cost_basis = 0;

  for (const entry of portfolio.entries.values()) {
    const marketValue = entryMarketValue(entry);
    const costBasis = (entry.purchase_price ?? marketValue / entry.quantity) * entry.quantity;
    total_cost_basis += costBasis;

    positions.push({
      card_id: entry.card.card_id,
      card_name: entry.card.name,
      quantity: entry.quantity,
      market_value: roundCurrency(marketValue),
      cost_basis: roundCurrency(costBasis),
      unrealized_pnl: roundCurrency(marketValue - costBasis),
      weight_percentage:
        total_value > 0 ? roundPercentage((marketValue / total_value) * 100) : 0,
    });
  }

  positions.sort((a, b) => b.market_value - a.market_value);

  const concentration_score = roundPercentage(
    positions.reduce((sum, position) => {
      const weight = position.weight_percentage / 100;
      return sum + weight * weight;
    }, 0)
  );

  const unrealized_pnl = total_value - total_cost_basis;

  return {
    total_cards: totalCards(portfolio),
    total_value,
    total_cost_basis: roundCurrency(total_cost_basis),
    unrealized_pnl: roundCurrency(unrealized_pnl),
    unrealized_pnl_percentage:
      total_cost_basis > 0 ? roundPercentage((unrealized_pnl / total_cost_basis) * 100) : 0,
    concentration_score,
    concentration_risk: concentrationRisk(concentration_score),
    largest_position: positions[0],
    positions,
  };
}

/**
 * Evaluate whether a user can catalog additional cards under the current tier.
 */
export function canCatalogCards(
  portfolio: Portfolio,
  subscription: EntitlementSubject,
  requested_cards: number = 1,
  now: Date = new Date()
): CatalogingDecision {
  if (!Number.isInteger(requested_cards) || requested_cards <= 0) {
    throw new Error("Requested cards must be a positive integer");
  }

  const limits = getCatalogingLimits(subscription, now);
  const current_cards = totalCards(portfolio);
  const projected = current_cards + requested_cards;
  const allowed = projected <= limits.max_cards;

  return {
    allowed,
    current_cards,
    requested_cards,
    max_cards: limits.max_cards,
    requires_pro: !allowed && !hasEntitlement(subscription, "portfolio.catalog.unlimited", now),
  };
}

export function assertCanCatalogCards(
  portfolio: Portfolio,
  subscription: EntitlementSubject,
  requested_cards: number = 1,
  now: Date = new Date()
): void {
  const decision = canCatalogCards(portfolio, subscription, requested_cards, now);
  if (!decision.allowed) {
    requireEntitlement(subscription, "portfolio.catalog.unlimited", now);
  }
}

/**
 * Search portfolio entries by card name (case-insensitive substring match).
 */
export function searchCards(portfolio: Portfolio, query: string): PortfolioEntry[] {
  const lower = query.toLowerCase();
  const results: PortfolioEntry[] = [];
  for (const entry of portfolio.entries.values()) {
    if (entry.card.name.toLowerCase().includes(lower)) {
      results.push(entry);
    }
  }
  return results;
}

/**
 * Filter portfolio by rarity.
 */
export function filterByRarity(portfolio: Portfolio, rarity: Rarity): PortfolioEntry[] {
  const results: PortfolioEntry[] = [];
  for (const entry of portfolio.entries.values()) {
    if (entry.card.rarity === rarity) {
      results.push(entry);
    }
  }
  return results;
}

function totalCards(portfolio: Portfolio): number {
  let total = 0;
  for (const entry of portfolio.entries.values()) {
    total += entry.quantity;
  }
  return total;
}

function entryMarketValue(entry: PortfolioEntry): number {
  const base = bestVariantPrice(entry.card);
  const adjusted = adjustedPrice(base, entry.card.condition);
  return adjusted * entry.quantity;
}

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

function roundPercentage(value: number): number {
  return Math.round(value * 100) / 100;
}

function concentrationRisk(score: number): "low" | "medium" | "high" {
  if (score >= 0.5) return "high";
  if (score >= 0.25) return "medium";
  return "low";
}
