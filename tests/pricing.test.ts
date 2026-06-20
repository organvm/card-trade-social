import {
  createPriceHistory,
  recordPrice,
  calculateHydraPrice,
  getRecentPoints,
  filterOutliers,
  detectArbitrage,
  detectArbitrageWithGate,
  FREE_ARBITRAGE_ALERT_LIMIT,
  requireUnlimitedArbitrageAlerts,
  calculatePriceChanges,
} from "../src/pricing";
import type { PricePoint, PriceSource } from "../src/pricing";
import { createFreeSubscription } from "../src/subscription";
import type { SubscriptionState } from "../src/subscription";

function makePoint(
  source: PriceSource,
  price: number,
  daysAgo = 0,
  is_sold = true
): PricePoint {
  return {
    source,
    price,
    is_sold,
    timestamp: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
  };
}

function activePro(): SubscriptionState {
  return {
    user_id: "user-1",
    tier: "pro",
    status: "active",
    cancel_at_period_end: false,
    updated_at: new Date(),
  };
}

describe("createPriceHistory", () => {
  it("should create empty price history", () => {
    const h = createPriceHistory("c1");
    expect(h.card_id).toBe("c1");
    expect(h.points).toHaveLength(0);
  });
});

describe("recordPrice", () => {
  it("should add a price point", () => {
    const h = createPriceHistory("c1");
    recordPrice(h, "tcgplayer", 100, true);
    expect(h.points).toHaveLength(1);
    expect(h.points[0].source).toBe("tcgplayer");
    expect(h.points[0].is_sold).toBe(true);
  });

  it("should reject negative prices", () => {
    const h = createPriceHistory("c1");
    expect(() => recordPrice(h, "ebay", -5, false)).toThrow("cannot be negative");
  });
});

describe("calculateHydraPrice", () => {
  it("should return 0 for empty history", () => {
    const h = createPriceHistory("c1");
    const result = calculateHydraPrice(h);
    expect(result.price).toBe(0);
    expect(result.confidence).toBe(0);
  });

  it("should weight sold listings higher than active", () => {
    const h = createPriceHistory("c1");
    // 2 sold at $100, 1 listed at $200
    recordPrice(h, "tcgplayer", 100, true);
    recordPrice(h, "tcgplayer", 100, true);
    recordPrice(h, "ebay", 200, false);

    const result = calculateHydraPrice(h);
    // Weighted: (100*2 + 100*2 + 200*1) / (2+2+1) = 600/5 = 120
    expect(result.price).toBe(120);
    expect(result.sources_used).toBe(2);
  });

  it("should have higher confidence with more data points and sources", () => {
    const h = createPriceHistory("c1");
    for (let i = 0; i < 10; i++) {
      recordPrice(h, "tcgplayer", 100, true);
    }
    for (let i = 0; i < 10; i++) {
      recordPrice(h, "ebay", 105, true);
    }

    const result = calculateHydraPrice(h);
    expect(result.confidence).toBe(1);
  });

  it("should ignore stale data when calculating the current price", () => {
    const h = createPriceHistory("c1");
    h.points.push(
      makePoint("tcgplayer", 1_000, 45),
      makePoint("tcgplayer", 100),
      makePoint("ebay", 110)
    );

    const result = calculateHydraPrice(h);

    expect(result.price).toBe(105);
    expect(result.sources_used).toBe(2);
  });

  it("should calculate from filtered points after dropping an outlier", () => {
    const h = createPriceHistory("c1");
    h.points.push(
      makePoint("tcgplayer", 95),
      makePoint("tcgplayer", 100),
      makePoint("ebay", 100),
      makePoint("ebay", 105),
      makePoint("private_auction", 10_000, 0, false)
    );

    const result = calculateHydraPrice(h);

    expect(result.price).toBe(100);
    expect(result.sources_used).toBe(2);
  });

  it("should return zero when only stale points are available", () => {
    const h = createPriceHistory("c1");
    h.points.push(makePoint("tcgplayer", 100, 31), makePoint("ebay", 105, 60));

    const result = calculateHydraPrice(h);

    expect(result.price).toBe(0);
    expect(result.confidence).toBe(0);
    expect(result.sources_used).toBe(0);
  });
});

describe("getRecentPoints", () => {
  it("should filter by recency", () => {
    const h = createPriceHistory("c1");
    // Add an old point
    const oldPoint: PricePoint = {
      source: "tcgplayer",
      price: 50,
      is_sold: true,
      timestamp: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
    };
    h.points.push(oldPoint);
    recordPrice(h, "tcgplayer", 100, true); // recent

    expect(getRecentPoints(h, 30)).toHaveLength(1);
    expect(getRecentPoints(h, 90)).toHaveLength(2);
  });
});

describe("filterOutliers", () => {
  it("should return all points if fewer than 4", () => {
    const points: PricePoint[] = [
      { source: "tcgplayer", price: 100, is_sold: true, timestamp: new Date() },
      { source: "ebay", price: 1000, is_sold: true, timestamp: new Date() },
    ];
    expect(filterOutliers(points)).toHaveLength(2);
  });

  it("should remove extreme outliers", () => {
    const now = new Date();
    const points: PricePoint[] = [
      { source: "tcgplayer", price: 98, is_sold: true, timestamp: now },
      { source: "tcgplayer", price: 100, is_sold: true, timestamp: now },
      { source: "ebay", price: 102, is_sold: true, timestamp: now },
      { source: "ebay", price: 99, is_sold: true, timestamp: now },
      { source: "cardkingdom", price: 101, is_sold: true, timestamp: now },
      { source: "ebay", price: 5000, is_sold: false, timestamp: now }, // outlier
    ];

    const filtered = filterOutliers(points);
    expect(filtered.length).toBeLessThan(points.length);
    expect(filtered.every((p) => p.price < 5000)).toBe(true);
  });

  it("should preserve points inside the IQR fences", () => {
    const points = [
      makePoint("tcgplayer", 90),
      makePoint("tcgplayer", 95),
      makePoint("ebay", 100),
      makePoint("ebay", 105),
      makePoint("cardkingdom", 110),
    ];

    expect(filterOutliers(points)).toEqual(points);
  });
});

describe("detectArbitrage", () => {
  it("should detect price discrepancies between sources", () => {
    const h = createPriceHistory("c1");
    const now = new Date();
    h.points.push(
      { source: "tcgplayer", price: 20, is_sold: true, timestamp: now },
      { source: "tcgplayer", price: 22, is_sold: true, timestamp: now },
      { source: "ebay", price: 35, is_sold: true, timestamp: now },
      { source: "ebay", price: 37, is_sold: true, timestamp: now }
    );

    const alerts = detectArbitrage([
      { card_id: "c1", card_name: "Test Card", history: h },
    ]);

    expect(alerts).toHaveLength(1);
    expect(alerts[0].low_source).toBe("tcgplayer");
    expect(alerts[0].high_source).toBe("ebay");
    expect(alerts[0].spread_percentage).toBeGreaterThan(15);
  });

  it("should return empty for small spreads", () => {
    const h = createPriceHistory("c1");
    const now = new Date();
    h.points.push(
      { source: "tcgplayer", price: 100, is_sold: true, timestamp: now },
      { source: "ebay", price: 102, is_sold: true, timestamp: now }
    );

    const alerts = detectArbitrage([
      { card_id: "c1", card_name: "Test Card", history: h },
    ]);

    expect(alerts).toHaveLength(0);
  });

  it("should honor a custom minimum spread threshold", () => {
    const h = createPriceHistory("c1");
    h.points.push(makePoint("tcgplayer", 100), makePoint("ebay", 120));

    const alerts = detectArbitrage(
      [{ card_id: "c1", card_name: "Test Card", history: h }],
      25
    );

    expect(alerts).toHaveLength(0);
  });

  it("should sort alerts by spread percentage descending", () => {
    const smallerSpread = createPriceHistory("c1");
    smallerSpread.points.push(makePoint("tcgplayer", 100), makePoint("ebay", 150));

    const largerSpread = createPriceHistory("c2");
    largerSpread.points.push(makePoint("tcgplayer", 10), makePoint("ebay", 25));

    const alerts = detectArbitrage([
      { card_id: "c1", card_name: "Smaller Spread", history: smallerSpread },
      { card_id: "c2", card_name: "Larger Spread", history: largerSpread },
    ]);

    expect(alerts).toHaveLength(2);
    expect(alerts[0].card_id).toBe("c2");
    expect(alerts[0].spread_percentage).toBeGreaterThan(alerts[1].spread_percentage);
  });

  it("should skip cards without two recent pricing sources", () => {
    const h = createPriceHistory("c1");
    h.points.push(
      makePoint("tcgplayer", 100),
      makePoint("tcgplayer", 105),
      makePoint("ebay", 200, 10)
    );

    const alerts = detectArbitrage([
      { card_id: "c1", card_name: "Single Source", history: h },
    ]);

    expect(alerts).toHaveLength(0);
  });

  it("should cap arbitrage alerts for free users", () => {
    const entries = Array.from({ length: FREE_ARBITRAGE_ALERT_LIMIT + 2 }, (_, index) => {
      const history = createPriceHistory(`c${index}`);
      history.points.push(makePoint("tcgplayer", 10 + index));
      history.points.push(makePoint("ebay", 30 + index * 2));

      return {
        card_id: `c${index}`,
        card_name: `Alert Card ${index}`,
        history,
      };
    });

    const result = detectArbitrageWithGate(
      entries,
      createFreeSubscription("user-1")
    );

    expect(result.total_alerts).toBe(FREE_ARBITRAGE_ALERT_LIMIT + 2);
    expect(result.alerts).toHaveLength(FREE_ARBITRAGE_ALERT_LIMIT);
    expect(result.truncated).toBe(true);
    expect(result.requires_pro).toBe(true);
  });

  it("should allow unlimited arbitrage alerts for Pro users", () => {
    const entries = Array.from({ length: FREE_ARBITRAGE_ALERT_LIMIT + 2 }, (_, index) => {
      const history = createPriceHistory(`c${index}`);
      history.points.push(makePoint("tcgplayer", 10 + index));
      history.points.push(makePoint("ebay", 30 + index * 2));

      return {
        card_id: `c${index}`,
        card_name: `Alert Card ${index}`,
        history,
      };
    });

    const result = detectArbitrageWithGate(entries, activePro());

    expect(result.total_alerts).toBe(FREE_ARBITRAGE_ALERT_LIMIT + 2);
    expect(result.alerts).toHaveLength(FREE_ARBITRAGE_ALERT_LIMIT + 2);
    expect(result.truncated).toBe(false);
    expect(result.requires_pro).toBe(false);
    expect(() => requireUnlimitedArbitrageAlerts(activePro())).not.toThrow();
    expect(() =>
      requireUnlimitedArbitrageAlerts(createFreeSubscription("user-1"))
    ).toThrow("Hydra Pro is required");
  });

  it("should reject invalid free alert limits", () => {
    expect(() =>
      detectArbitrageWithGate([], createFreeSubscription("user-1"), {
        free_alert_limit: -1,
      })
    ).toThrow("non-negative integer");
  });
});

describe("calculatePriceChanges", () => {
  it("should calculate price changes between periods", () => {
    const h = createPriceHistory("c1");
    const now = Date.now();

    // Old points (3 days ago)
    h.points.push({
      source: "tcgplayer",
      price: 100,
      is_sold: true,
      timestamp: new Date(now - 3 * 24 * 60 * 60 * 1000),
    });

    // Recent points (now)
    h.points.push({
      source: "tcgplayer",
      price: 120,
      is_sold: true,
      timestamp: new Date(now),
    });

    const changes = calculatePriceChanges(
      [{ card_id: "c1", card_name: "Test Card", history: h }],
      7,
      1
    );

    expect(changes).toHaveLength(1);
    expect(changes[0].change).toBe(20);
    expect(changes[0].change_percentage).toBe(20);
  });

  it("should skip entries missing a previous or current period", () => {
    const currentOnly = createPriceHistory("c1");
    currentOnly.points.push(makePoint("tcgplayer", 120));

    const previousOnly = createPriceHistory("c2");
    previousOnly.points.push(makePoint("tcgplayer", 80, 3));

    const changes = calculatePriceChanges([
      { card_id: "c1", card_name: "Current Only", history: currentOnly },
      { card_id: "c2", card_name: "Previous Only", history: previousOnly },
    ]);

    expect(changes).toHaveLength(0);
  });

  it("should sort changes by absolute percentage and handle zero previous average", () => {
    const decline = createPriceHistory("c1");
    decline.points.push(makePoint("tcgplayer", 100, 3), makePoint("tcgplayer", 50));

    const fromZero = createPriceHistory("c2");
    fromZero.points.push(makePoint("ebay", 0, 3), makePoint("ebay", 10));

    const changes = calculatePriceChanges([
      { card_id: "c1", card_name: "Decline", history: decline },
      { card_id: "c2", card_name: "From Zero", history: fromZero },
    ]);

    expect(changes).toHaveLength(2);
    expect(changes[0]).toMatchObject({
      card_id: "c1",
      change: -50,
      change_percentage: -50,
    });
    expect(changes[1]).toMatchObject({
      card_id: "c2",
      previous_price: 0,
      current_price: 10,
      change_percentage: 0,
    });
  });
});
