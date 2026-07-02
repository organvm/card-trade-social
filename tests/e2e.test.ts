import {
  createCard,
  createPortfolio,
  addCard,
  removeCard,
  portfolioValue,
  createProposal,
  acceptTrade,
  rejectTrade,
  counterTrade,
  createHistory,
  addToHistory,
  getUserTrades,
  netTradeValue,
  bestVariantPrice,
  adjustedPrice,
  Card
} from "../src";

describe("E2E User Flow Integration Tests", () => {
  it("should complete a full trade lifecycle successfully", () => {
    // 1. Setup Users and Portfolios
    const aliceId = "user_alice";
    const bobId = "user_bob";

    let alicePortfolio = createPortfolio(aliceId);
    let bobPortfolio = createPortfolio(bobId);

    // 2. Setup Cards
    const charizard = createCard({
      card_id: "card_charizard_1",
      name: "Charizard",
      game: "pokemon",
      set_code: "BS",
      set_name: "Base Set",
      rarity: "rare",
      condition: "mint",
      variants: [
        {
          variant_id: "v1",
          label: "1st Edition",
          finish: "standard",
          market_price: 1000,
        },
      ],
    });

    const lotus = createCard({
      card_id: "card_lotus_1",
      name: "Black Lotus",
      game: "mtg",
      set_code: "LEA",
      set_name: "Alpha",
      rarity: "mythic",
      condition: "mint",
      variants: [
        {
          variant_id: "v2",
          label: "Standard",
          finish: "standard",
          market_price: 5000,
        },
      ],
    });

    // 3. Fund Portfolios
    alicePortfolio = addCard(alicePortfolio, charizard, 2);
    bobPortfolio = addCard(bobPortfolio, lotus, 1);

    expect(portfolioValue(alicePortfolio)).toBe(2000);
    expect(portfolioValue(bobPortfolio)).toBe(5000);

    // 4. Create Trade History
    let history = createHistory();

    // 5. Alice proposes a trade to Bob
    // She offers 1 Charizard and $4000 cash for Bob's 1 Black Lotus.
    let proposal = createProposal({
      trade_id: "trade_1",
      proposer_id: aliceId,
      receiver_id: bobId,
      offered_items: [{ card: charizard, quantity: 1 }],
      requested_items: [{ card: lotus, quantity: 1 }],
      cash_adjustment: -4000, // Alice pays $4000 (negative adjustment means proposer is offering cash)
      message: "My Charizard + $4000 for your Lotus",
    });

    history = addToHistory(history, proposal);

    expect(proposal.status).toBe("pending");
    expect(getUserTrades(history, aliceId)).toHaveLength(1);
    expect(getUserTrades(history, bobId)).toHaveLength(1);

    // 6. Check Net Trade Value (from Alice's perspective)
    // Custom price resolver taking condition into account
    const priceResolver = (c: Card) => adjustedPrice(bestVariantPrice(c), c.condition);
    const netValue = netTradeValue(proposal, priceResolver);
    
    // Requested (5000) - Offered (1000) + Cash Adjustment (-4000) = 0
    expect(netValue).toBe(0);

    // 7. Bob accepts the trade
    proposal = acceptTrade(proposal, bobId);
    expect(proposal.status).toBe("accepted");

    // 8. Execute Trade (transfer items)
    if (proposal.status === "accepted") {
      proposal.offered_items.forEach((item) => {
        alicePortfolio = removeCard(alicePortfolio, item.card.card_id, item.quantity);
        bobPortfolio = addCard(bobPortfolio, item.card, item.quantity);
      });

      proposal.requested_items.forEach((item) => {
        bobPortfolio = removeCard(bobPortfolio, item.card.card_id, item.quantity);
        alicePortfolio = addCard(alicePortfolio, item.card, item.quantity);
      });
    }

    // 9. Verify Post-Trade Portfolios
    // Alice had 2 Charizards, offered 1. Now has 1 Charizard + 1 Lotus.
    expect(alicePortfolio.entries.get(charizard.card_id)?.quantity).toBe(1);
    expect(alicePortfolio.entries.get(lotus.card_id)?.quantity).toBe(1);
    expect(portfolioValue(alicePortfolio)).toBe(6000); // 1000 + 5000

    // Bob had 1 Lotus, gave it. Received 1 Charizard.
    expect(bobPortfolio.entries.get(charizard.card_id)?.quantity).toBe(1);
    expect(bobPortfolio.entries.has(lotus.card_id)).toBe(false);
    expect(portfolioValue(bobPortfolio)).toBe(1000); // 1000
  });

  it("should handle a counter-trade workflow", () => {
    const charlieId = "user_charlie";
    const daveId = "user_dave";

    let charliePortfolio = createPortfolio(charlieId);
    let davePortfolio = createPortfolio(daveId);

    const pikachu = createCard({
      card_id: "card_pika",
      name: "Pikachu Illustrator",
      game: "pokemon",
      set_code: "PROMO",
      set_name: "Promo",
      rarity: "secret",
      condition: "near_mint", // 0.9 multiplier
      variants: [{ variant_id: "v1", label: "Promo", finish: "standard", market_price: 100000 }],
    });

    const mox = createCard({
      card_id: "card_mox",
      name: "Mox Sapphire",
      game: "mtg",
      set_code: "UNL",
      set_name: "Unlimited",
      rarity: "rare",
      condition: "lightly_played", // 0.75 multiplier
      variants: [{ variant_id: "v1", label: "Standard", finish: "standard", market_price: 4000 }],
    });

    charliePortfolio = addCard(charliePortfolio, pikachu, 1);
    davePortfolio = addCard(davePortfolio, mox, 3); // 3 Moxes

    let history = createHistory();

    // Charlie proposes 1 Pikachu for 3 Moxes
    let originalTrade = createProposal({
      trade_id: "trade_2",
      proposer_id: charlieId,
      receiver_id: daveId,
      offered_items: [{ card: pikachu, quantity: 1 }],
      requested_items: [{ card: mox, quantity: 3 }],
      message: "My Pikachu for 3 of your Moxes",
    });

    history = addToHistory(history, originalTrade);

    // Dave counters the trade: 2 Moxes instead of 3
    const { original: updatedOriginal, counter } = counterTrade({
      new_trade_id: "trade_3",
      original: originalTrade,
      actor_id: daveId,
      offered_items: [{ card: mox, quantity: 2 }],
      requested_items: [{ card: pikachu, quantity: 1 }],
      message: "I can only do 2 Moxes.",
    });

    expect(updatedOriginal.status).toBe("countered");
    expect(counter.status).toBe("pending");
    expect(counter.parent_trade_id).toBe(originalTrade.trade_id);

    history = addToHistory(history, counter);

    // Charlie decides to reject Dave's counter
    const rejectedCounter = rejectTrade(counter, charlieId);
    expect(rejectedCounter.status).toBe("rejected");

    // No items should be exchanged
    expect(charliePortfolio.entries.get(pikachu.card_id)?.quantity).toBe(1);
    expect(charliePortfolio.entries.has(mox.card_id)).toBe(false);

    expect(davePortfolio.entries.get(mox.card_id)?.quantity).toBe(3);
    expect(davePortfolio.entries.has(pikachu.card_id)).toBe(false);
  });
});
