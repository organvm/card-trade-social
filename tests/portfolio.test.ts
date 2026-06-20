import {
  createPortfolio,
  addCard,
  removeCard,
  portfolioValue,
  getAllocations,
  getStats,
  searchCards,
  filterByRarity,
  getAdvancedAnalytics,
  canCatalogCards,
  assertCanCatalogCards,
} from "../src/portfolio";
import { createCard } from "../src/card";
import type { Card, CardVariant } from "../src/card";
import { createFreeSubscription } from "../src/subscription";
import type { LicenseState, SubscriptionState } from "../src/subscription";

function makeCard(overrides: Partial<Parameters<typeof createCard>[0]> = {}): Card {
  return createCard({
    card_id: overrides.card_id ?? "c1",
    name: overrides.name ?? "Test Card",
    game: overrides.game ?? "mtg",
    set_code: overrides.set_code ?? "TST",
    set_name: overrides.set_name ?? "Test Set",
    rarity: overrides.rarity ?? "rare",
    condition: overrides.condition ?? "near_mint",
    variants: overrides.variants ?? [
      { variant_id: "v1", label: "Standard", finish: "standard" as const, market_price: 100 },
    ],
    ...overrides,
  });
}

describe("createPortfolio", () => {
  it("should create an empty portfolio", () => {
    const p = createPortfolio("user-1");
    expect(p.owner_id).toBe("user-1");
    expect(p.entries.size).toBe(0);
  });
});

describe("addCard", () => {
  it("should add a card to the portfolio", () => {
    const p = createPortfolio("user-1");
    const card = makeCard();
    addCard(p, card, 1);
    expect(p.entries.size).toBe(1);
    expect(p.entries.get("c1")?.quantity).toBe(1);
  });

  it("should increment quantity for existing card", () => {
    const p = createPortfolio("user-1");
    const card = makeCard();
    addCard(p, card, 2);
    addCard(p, card, 3);
    expect(p.entries.get("c1")?.quantity).toBe(5);
  });

  it("should throw for non-positive quantity", () => {
    const p = createPortfolio("user-1");
    expect(() => addCard(p, makeCard(), 0)).toThrow("Quantity must be positive");
  });
});

describe("removeCard", () => {
  it("should reduce quantity", () => {
    const p = createPortfolio("user-1");
    addCard(p, makeCard(), 3);
    removeCard(p, "c1", 1);
    expect(p.entries.get("c1")?.quantity).toBe(2);
  });

  it("should remove entry when quantity reaches zero", () => {
    const p = createPortfolio("user-1");
    addCard(p, makeCard(), 2);
    removeCard(p, "c1", 2);
    expect(p.entries.size).toBe(0);
  });

  it("should remove entry when quantity exceeds current", () => {
    const p = createPortfolio("user-1");
    addCard(p, makeCard(), 1);
    removeCard(p, "c1", 5);
    expect(p.entries.size).toBe(0);
  });

  it("should throw for unknown card", () => {
    const p = createPortfolio("user-1");
    expect(() => removeCard(p, "unknown")).toThrow("not found in portfolio");
  });

  it("should throw for non-positive quantity", () => {
    const p = createPortfolio("user-1");
    addCard(p, makeCard(), 1);
    expect(() => removeCard(p, "c1", -1)).toThrow("Quantity must be positive");
  });
});

describe("portfolioValue", () => {
  it("should return 0 for empty portfolio", () => {
    expect(portfolioValue(createPortfolio("u"))).toBe(0);
  });

  it("should calculate value with condition adjustment", () => {
    const p = createPortfolio("user-1");
    addCard(p, makeCard({ condition: "near_mint" }), 2);
    // Base price 100 * 0.9 (near_mint) * 2 = 180
    expect(portfolioValue(p)).toBe(180);
  });
});

describe("getAllocations", () => {
  it("should break down by game", () => {
    const p = createPortfolio("user-1");
    addCard(p, makeCard({ card_id: "c1", game: "mtg" }), 1);
    addCard(
      p,
      makeCard({
        card_id: "c2",
        game: "pokemon",
        variants: [
          { variant_id: "v1", label: "Standard", finish: "standard" as const, market_price: 200 },
        ],
      }),
      1
    );

    const allocs = getAllocations(p);
    expect(allocs).toHaveLength(2);
    expect(allocs[0].game).toBe("pokemon"); // Higher value first
  });

  it("should report zero percentages for zero-value holdings", () => {
    const p = createPortfolio("user-1");
    addCard(p, makeCard({ variants: [] }), 2);

    const allocs = getAllocations(p);

    expect(allocs).toEqual([{ game: "mtg", value: 0, percentage: 0 }]);
  });
});

describe("getStats", () => {
  it("should return correct stats", () => {
    const p = createPortfolio("user-1");
    addCard(p, makeCard(), 3);
    const stats = getStats(p);
    expect(stats.total_cards).toBe(3);
    expect(stats.total_value).toBeGreaterThan(0);
    expect(stats.allocations).toHaveLength(1);
  });
});

describe("searchCards", () => {
  it("should find cards by name substring", () => {
    const p = createPortfolio("user-1");
    addCard(p, makeCard({ card_id: "c1", name: "Black Lotus" }), 1);
    addCard(p, makeCard({ card_id: "c2", name: "Sol Ring" }), 1);
    addCard(p, makeCard({ card_id: "c3", name: "Black Vise" }), 1);

    const results = searchCards(p, "black");
    expect(results).toHaveLength(2);
  });

  it("should return empty for no match", () => {
    const p = createPortfolio("user-1");
    addCard(p, makeCard(), 1);
    expect(searchCards(p, "nonexistent")).toHaveLength(0);
  });
});

describe("filterByRarity", () => {
  it("should filter by rarity", () => {
    const p = createPortfolio("user-1");
    addCard(p, makeCard({ card_id: "c1", rarity: "rare" }), 1);
    addCard(p, makeCard({ card_id: "c2", rarity: "common" }), 1);
    addCard(p, makeCard({ card_id: "c3", rarity: "rare" }), 1);

    expect(filterByRarity(p, "rare")).toHaveLength(2);
    expect(filterByRarity(p, "common")).toHaveLength(1);
    expect(filterByRarity(p, "mythic")).toHaveLength(0);
  });
});

describe("getAdvancedAnalytics", () => {
  const activePro = (user_id: string): SubscriptionState => ({
    user_id,
    tier: "pro",
    status: "active",
    current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    cancel_at_period_end: false,
    updated_at: new Date(),
  });

  it("should require a Pro entitlement", () => {
    const p = createPortfolio("user-1");
    addCard(p, makeCard(), 1, 80);

    expect(() => getAdvancedAnalytics(p, createFreeSubscription("user-1"))).toThrow(
      "Hydra Pro is required"
    );
  });

  it("should calculate Pro-only analytics", () => {
    const p = createPortfolio("user-1");
    addCard(p, makeCard({ card_id: "c1", name: "Black Lotus" }), 2, 70);
    addCard(
      p,
      makeCard({
        card_id: "c2",
        name: "Sol Ring",
        variants: [
          { variant_id: "v1", label: "Standard", finish: "standard" as const, market_price: 50 },
        ],
      }),
      1,
      60
    );

    const analytics = getAdvancedAnalytics(p, activePro("user-1"));

    expect(analytics.total_cards).toBe(3);
    expect(analytics.total_value).toBe(225);
    expect(analytics.total_cost_basis).toBe(200);
    expect(analytics.unrealized_pnl).toBe(25);
    expect(analytics.unrealized_pnl_percentage).toBe(12.5);
    expect(analytics.largest_position?.card_name).toBe("Black Lotus");
    expect(analytics.positions[0].weight_percentage).toBe(80);
  });

  it("should allow Pro license holders to use advanced analytics", () => {
    const p = createPortfolio("user-1");
    addCard(p, makeCard({ card_id: "c1", condition: "mint" }), 1, 80);
    const license: LicenseState = {
      user_id: "user-1",
      tier: "pro",
      provider: "lemon_squeezy",
      status: "active",
      license_key_id: "license-1",
      updated_at: new Date(),
    };

    const analytics = getAdvancedAnalytics(p, license);

    expect(analytics.total_value).toBe(100);
    expect(analytics.unrealized_pnl).toBe(20);
  });

  it("should return empty analytics for an empty Pro portfolio", () => {
    const analytics = getAdvancedAnalytics(
      createPortfolio("user-1"),
      activePro("user-1")
    );

    expect(analytics).toMatchObject({
      total_cards: 0,
      total_value: 0,
      total_cost_basis: 0,
      unrealized_pnl: 0,
      unrealized_pnl_percentage: 0,
      concentration_score: 0,
      concentration_risk: "low",
      positions: [],
    });
    expect(analytics.largest_position).toBeUndefined();
  });

  it("should default missing purchase price to current market value", () => {
    const p = createPortfolio("user-1");
    addCard(p, makeCard({ card_id: "c1", condition: "mint" }), 3);

    const analytics = getAdvancedAnalytics(p, activePro("user-1"));

    expect(analytics.total_value).toBe(300);
    expect(analytics.total_cost_basis).toBe(300);
    expect(analytics.unrealized_pnl).toBe(0);
    expect(analytics.positions[0]).toMatchObject({
      card_id: "c1",
      market_value: 300,
      cost_basis: 300,
      unrealized_pnl: 0,
      weight_percentage: 100,
    });
  });

  it("should classify medium concentration risk across balanced positions", () => {
    const p = createPortfolio("user-1");
    addCard(p, makeCard({ card_id: "c1", condition: "mint" }), 1);
    addCard(p, makeCard({ card_id: "c2", condition: "mint" }), 1);
    addCard(p, makeCard({ card_id: "c3", condition: "mint" }), 1);

    const analytics = getAdvancedAnalytics(p, activePro("user-1"));

    expect(analytics.concentration_score).toBe(0.33);
    expect(analytics.concentration_risk).toBe("medium");
  });
});

describe("cataloging gates", () => {
  it("should allow free users under the cataloging limit", () => {
    const p = createPortfolio("user-1");

    const decision = canCatalogCards(p, createFreeSubscription("user-1"), 25);

    expect(decision.allowed).toBe(true);
    expect(decision.requires_pro).toBe(false);
    expect(decision.max_cards).toBe(100);
  });

  it("should require Pro when free users exceed the cataloging limit", () => {
    const p = createPortfolio("user-1");
    addCard(p, makeCard(), 100);

    const decision = canCatalogCards(p, createFreeSubscription("user-1"), 1);

    expect(decision.allowed).toBe(false);
    expect(decision.requires_pro).toBe(true);
    expect(() => assertCanCatalogCards(p, createFreeSubscription("user-1"), 1)).toThrow(
      "Hydra Pro is required"
    );
  });

  it("should allow active Pro users unlimited cataloging", () => {
    const p = createPortfolio("user-1");
    addCard(p, makeCard(), 100);
    const subscription: SubscriptionState = {
      user_id: "user-1",
      tier: "pro",
      status: "active",
      cancel_at_period_end: false,
      updated_at: new Date(),
    };

    expect(canCatalogCards(p, subscription, 1000).allowed).toBe(true);
    expect(() => assertCanCatalogCards(p, subscription, 1000)).not.toThrow();
  });

  it("should reject non-integer or non-positive requested card counts", () => {
    const p = createPortfolio("user-1");
    const subscription = createFreeSubscription("user-1");

    expect(() => canCatalogCards(p, subscription, 0)).toThrow(
      "Requested cards must be a positive integer"
    );
    expect(() => canCatalogCards(p, subscription, 1.5)).toThrow(
      "Requested cards must be a positive integer"
    );
  });

  it("should fall back to free limits for expired Pro users", () => {
    const p = createPortfolio("user-1");
    addCard(p, makeCard(), 100);
    const subscription: SubscriptionState = {
      user_id: "user-1",
      tier: "pro",
      status: "active",
      current_period_end: new Date(Date.now() - 1_000),
      cancel_at_period_end: false,
      updated_at: new Date(),
    };

    const decision = canCatalogCards(p, subscription, 1);

    expect(decision.allowed).toBe(false);
    expect(decision.max_cards).toBe(100);
    expect(decision.requires_pro).toBe(true);
  });
});
