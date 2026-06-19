import {
  createProposal,
  acceptTrade,
  rejectTrade,
  cancelTrade,
  counterTrade,
  isExpired,
  netTradeValue,
  createHistory,
  addToHistory,
  getUserTrades,
} from "../src/trade";
import { createCard } from "../src/card";

const cardA = createCard({
  card_id: "a",
  name: "Card A",
  game: "mtg",
  set_code: "TST",
  set_name: "Test",
  rarity: "rare",
  condition: "mint",
  variants: [{ variant_id: "v1", label: "Standard", finish: "standard", market_price: 100 }],
});

const cardB = createCard({
  card_id: "b",
  name: "Card B",
  game: "pokemon",
  set_code: "BS",
  set_name: "Base",
  rarity: "mythic",
  condition: "mint",
  variants: [{ variant_id: "v2", label: "Foil", finish: "foil", market_price: 200 }],
});

describe("createProposal", () => {
  it("should create a pending trade proposal", () => {
    const trade = createProposal({
      trade_id: "t1",
      proposer_id: "alice",
      receiver_id: "bob",
      offered_items: [{ card: cardA, quantity: 1 }],
      requested_items: [{ card: cardB, quantity: 1 }],
    });

    expect(trade.status).toBe("pending");
    expect(trade.proposer_id).toBe("alice");
    expect(trade.cash_adjustment).toBe(0);
    expect(trade.expires_at.getTime()).toBeGreaterThan(Date.now());
  });

  it("should preserve optional cash, message, and custom expiry", () => {
    const before = Date.now();
    const trade = createProposal({
      trade_id: "t1",
      proposer_id: "alice",
      receiver_id: "bob",
      offered_items: [{ card: cardA, quantity: 1 }],
      requested_items: [],
      cash_adjustment: -25,
      message: "Can add cash on pickup",
      expiry_hours: 2,
    });
    const after = Date.now();

    expect(trade.cash_adjustment).toBe(-25);
    expect(trade.message).toBe("Can add cash on pickup");
    expect(trade.expires_at.getTime()).toBeGreaterThanOrEqual(
      before + 2 * 60 * 60 * 1000
    );
    expect(trade.expires_at.getTime()).toBeLessThanOrEqual(
      after + 2 * 60 * 60 * 1000
    );
  });

  it("should reject self-trade", () => {
    expect(() =>
      createProposal({
        trade_id: "t1",
        proposer_id: "alice",
        receiver_id: "alice",
        offered_items: [{ card: cardA, quantity: 1 }],
        requested_items: [],
      })
    ).toThrow("Cannot trade with yourself");
  });

  it("should reject empty trade", () => {
    expect(() =>
      createProposal({
        trade_id: "t1",
        proposer_id: "alice",
        receiver_id: "bob",
        offered_items: [],
        requested_items: [],
      })
    ).toThrow("at least one item");
  });

  it("should reject non-positive quantity", () => {
    expect(() =>
      createProposal({
        trade_id: "t1",
        proposer_id: "alice",
        receiver_id: "bob",
        offered_items: [{ card: cardA, quantity: 0 }],
        requested_items: [],
      })
    ).toThrow("quantity must be positive");
  });
});

describe("acceptTrade", () => {
  it("should accept a pending trade", () => {
    const trade = createProposal({
      trade_id: "t1",
      proposer_id: "alice",
      receiver_id: "bob",
      offered_items: [{ card: cardA, quantity: 1 }],
      requested_items: [{ card: cardB, quantity: 1 }],
    });

    const accepted = acceptTrade(trade, "bob");
    expect(accepted.status).toBe("accepted");
  });

  it("should reject if not the receiver", () => {
    const trade = createProposal({
      trade_id: "t1",
      proposer_id: "alice",
      receiver_id: "bob",
      offered_items: [{ card: cardA, quantity: 1 }],
      requested_items: [],
    });

    expect(() => acceptTrade(trade, "alice")).toThrow("Only the receiver");
  });

  it("should reject if not pending", () => {
    const trade = createProposal({
      trade_id: "t1",
      proposer_id: "alice",
      receiver_id: "bob",
      offered_items: [{ card: cardA, quantity: 1 }],
      requested_items: [],
    });

    const accepted = acceptTrade(trade, "bob");
    expect(() => acceptTrade(accepted, "bob")).toThrow('status "accepted"');
  });
});

describe("rejectTrade", () => {
  it("should reject a pending trade", () => {
    const trade = createProposal({
      trade_id: "t1",
      proposer_id: "alice",
      receiver_id: "bob",
      offered_items: [{ card: cardA, quantity: 1 }],
      requested_items: [],
    });

    const rejected = rejectTrade(trade, "bob");
    expect(rejected.status).toBe("rejected");
  });

  it("should reject if not the receiver", () => {
    const trade = createProposal({
      trade_id: "t1",
      proposer_id: "alice",
      receiver_id: "bob",
      offered_items: [{ card: cardA, quantity: 1 }],
      requested_items: [],
    });

    expect(() => rejectTrade(trade, "alice")).toThrow("Only the receiver");
  });

  it("should reject if not pending", () => {
    const trade = createProposal({
      trade_id: "t1",
      proposer_id: "alice",
      receiver_id: "bob",
      offered_items: [{ card: cardA, quantity: 1 }],
      requested_items: [],
    });

    const rejected = rejectTrade(trade, "bob");
    expect(() => rejectTrade(rejected, "bob")).toThrow('status "rejected"');
  });
});

describe("cancelTrade", () => {
  it("should cancel a pending trade by proposer", () => {
    const trade = createProposal({
      trade_id: "t1",
      proposer_id: "alice",
      receiver_id: "bob",
      offered_items: [{ card: cardA, quantity: 1 }],
      requested_items: [],
    });

    const cancelled = cancelTrade(trade, "alice");
    expect(cancelled.status).toBe("cancelled");
  });

  it("should reject if not the proposer", () => {
    const trade = createProposal({
      trade_id: "t1",
      proposer_id: "alice",
      receiver_id: "bob",
      offered_items: [{ card: cardA, quantity: 1 }],
      requested_items: [],
    });

    expect(() => cancelTrade(trade, "bob")).toThrow("Only the proposer");
  });

  it("should reject cancellation if not pending", () => {
    const trade = createProposal({
      trade_id: "t1",
      proposer_id: "alice",
      receiver_id: "bob",
      offered_items: [{ card: cardA, quantity: 1 }],
      requested_items: [],
    });

    const cancelled = cancelTrade(trade, "alice");
    expect(() => cancelTrade(cancelled, "alice")).toThrow('status "cancelled"');
  });
});

describe("counterTrade", () => {
  it("should create counter and mark original as countered", () => {
    const original = createProposal({
      trade_id: "t1",
      proposer_id: "alice",
      receiver_id: "bob",
      offered_items: [{ card: cardA, quantity: 1 }],
      requested_items: [{ card: cardB, quantity: 1 }],
    });

    const { original: updated, counter } = counterTrade({
      new_trade_id: "t2",
      original,
      actor_id: "bob",
      offered_items: [{ card: cardB, quantity: 1 }],
      requested_items: [{ card: cardA, quantity: 2 }],
      cash_adjustment: 50,
    });

    expect(updated.status).toBe("countered");
    expect(counter.status).toBe("pending");
    expect(counter.parent_trade_id).toBe("t1");
    expect(counter.proposer_id).toBe("bob");
    expect(counter.receiver_id).toBe("alice");
    expect(counter.cash_adjustment).toBe(50);
  });

  it("should reject counters from anyone other than the receiver", () => {
    const original = createProposal({
      trade_id: "t1",
      proposer_id: "alice",
      receiver_id: "bob",
      offered_items: [{ card: cardA, quantity: 1 }],
      requested_items: [{ card: cardB, quantity: 1 }],
    });

    expect(() =>
      counterTrade({
        new_trade_id: "t2",
        original,
        actor_id: "alice",
        offered_items: [{ card: cardB, quantity: 1 }],
        requested_items: [{ card: cardA, quantity: 1 }],
      })
    ).toThrow("Only the receiver");
  });

  it("should reject counters for non-pending trades", () => {
    const original = createProposal({
      trade_id: "t1",
      proposer_id: "alice",
      receiver_id: "bob",
      offered_items: [{ card: cardA, quantity: 1 }],
      requested_items: [{ card: cardB, quantity: 1 }],
    });
    const accepted = acceptTrade(original, "bob");

    expect(() =>
      counterTrade({
        new_trade_id: "t2",
        original: accepted,
        actor_id: "bob",
        offered_items: [{ card: cardB, quantity: 1 }],
        requested_items: [{ card: cardA, quantity: 1 }],
      })
    ).toThrow('status "accepted"');
  });
});

describe("isExpired", () => {
  it("should return false for a fresh trade", () => {
    const trade = createProposal({
      trade_id: "t1",
      proposer_id: "alice",
      receiver_id: "bob",
      offered_items: [{ card: cardA, quantity: 1 }],
      requested_items: [],
    });

    expect(isExpired(trade)).toBe(false);
  });

  it("should return true for an expired trade", () => {
    const trade = createProposal({
      trade_id: "t1",
      proposer_id: "alice",
      receiver_id: "bob",
      offered_items: [{ card: cardA, quantity: 1 }],
      requested_items: [],
      expiry_hours: 0,
    });
    // Expiry is set to 0 hours from creation — already expired
    trade.expires_at = new Date(Date.now() - 1000);

    expect(isExpired(trade)).toBe(true);
  });

  it("should return false for non-pending trade", () => {
    const trade = createProposal({
      trade_id: "t1",
      proposer_id: "alice",
      receiver_id: "bob",
      offered_items: [{ card: cardA, quantity: 1 }],
      requested_items: [],
    });
    const accepted = acceptTrade(trade, "bob");
    accepted.expires_at = new Date(Date.now() - 1000);
    expect(isExpired(accepted)).toBe(false);
  });
});

describe("netTradeValue", () => {
  it("should calculate net value from proposer perspective", () => {
    const trade = createProposal({
      trade_id: "t1",
      proposer_id: "alice",
      receiver_id: "bob",
      offered_items: [{ card: cardA, quantity: 1 }],
      requested_items: [{ card: cardB, quantity: 1 }],
      cash_adjustment: 50,
    });

    const resolver = (card: any) => (card.card_id === "a" ? 100 : 200);
    // requested(200) - offered(100) + cash(50) = 150
    expect(netTradeValue(trade, resolver)).toBe(150);
  });

  it("should return negative values when the proposer receives more value", () => {
    const trade = createProposal({
      trade_id: "t1",
      proposer_id: "alice",
      receiver_id: "bob",
      offered_items: [{ card: cardB, quantity: 1 }],
      requested_items: [{ card: cardA, quantity: 1 }],
      cash_adjustment: -10.335,
    });

    const resolver = (card: any) => (card.card_id === "a" ? 100 : 200);

    expect(netTradeValue(trade, resolver)).toBe(-110.33);
  });
});

describe("TradeHistory", () => {
  it("should track trades and filter by user", () => {
    const history = createHistory();
    const t1 = createProposal({
      trade_id: "t1",
      proposer_id: "alice",
      receiver_id: "bob",
      offered_items: [{ card: cardA, quantity: 1 }],
      requested_items: [],
    });
    const t2 = createProposal({
      trade_id: "t2",
      proposer_id: "charlie",
      receiver_id: "dave",
      offered_items: [{ card: cardB, quantity: 1 }],
      requested_items: [],
    });

    addToHistory(history, t1);
    addToHistory(history, t2);

    expect(getUserTrades(history, "alice")).toHaveLength(1);
    expect(getUserTrades(history, "bob")).toHaveLength(1);
    expect(getUserTrades(history, "charlie")).toHaveLength(1);
    expect(getUserTrades(history, "eve")).toHaveLength(0);
  });
});
