import {
  createCard,
  generateTicker,
  getConditionMultiplier,
  adjustedPrice,
  bestVariantPrice,
  findVariant,
} from "../src/card";
import type { Card, CardVariant } from "../src/card";

describe("generateTicker", () => {
  it("should generate uppercase ticker from game, set, name", () => {
    expect(generateTicker("mtg", "BLK", "Black Lotus")).toBe("MTG-BLK-BLACKLOTUS");
  });

  it("should strip non-alphanumeric characters", () => {
    expect(generateTicker("pokemon", "BS", "Charizard's Fire")).toBe(
      "POKEMON-BS-CHARIZARDS"
    );
  });

  it("should truncate long names to 10 chars", () => {
    expect(generateTicker("yugioh", "LOB", "Blue-Eyes White Dragon")).toBe(
      "YUGIOH-LOB-BLUEEYESWH"
    );
  });
});

describe("getConditionMultiplier", () => {
  it("should return 1.0 for mint", () => {
    expect(getConditionMultiplier("mint")).toBe(1.0);
  });

  it("should return 0.25 for damaged", () => {
    expect(getConditionMultiplier("damaged")).toBe(0.25);
  });

  it("should return decreasing values for worse conditions", () => {
    const conditions = [
      "mint",
      "near_mint",
      "lightly_played",
      "moderately_played",
      "heavily_played",
      "damaged",
    ] as const;
    for (let i = 1; i < conditions.length; i++) {
      expect(getConditionMultiplier(conditions[i])).toBeLessThan(
        getConditionMultiplier(conditions[i - 1])
      );
    }
  });
});

describe("adjustedPrice", () => {
  it("should return full price for mint condition", () => {
    expect(adjustedPrice(100, "mint")).toBe(100);
  });

  it("should apply condition multiplier", () => {
    expect(adjustedPrice(100, "near_mint")).toBe(90);
  });

  it("should round to 2 decimal places", () => {
    expect(adjustedPrice(33.33, "near_mint")).toBe(30);
  });
});

describe("createCard", () => {
  it("should create a card with auto-generated ticker", () => {
    const card = createCard({
      card_id: "c1",
      name: "Black Lotus",
      game: "mtg",
      set_code: "LEA",
      set_name: "Limited Edition Alpha",
      rarity: "mythic",
      condition: "near_mint",
    });

    expect(card.card_id).toBe("c1");
    expect(card.name).toBe("Black Lotus");
    expect(card.ticker).toBe("MTG-LEA-BLACKLOTUS");
    expect(card.variants).toEqual([]);
    expect(card.created_at).toBeInstanceOf(Date);
  });

  it("should include provided variants", () => {
    const variants: CardVariant[] = [
      { variant_id: "v1", label: "Standard", finish: "standard", market_price: 100 },
    ];
    const card = createCard({
      card_id: "c2",
      name: "Sol Ring",
      game: "mtg",
      set_code: "CMD",
      set_name: "Commander",
      rarity: "uncommon",
      condition: "mint",
      variants,
    });

    expect(card.variants).toHaveLength(1);
    expect(card.variants[0].market_price).toBe(100);
  });

  it("should preserve optional metadata fields", () => {
    const card = createCard({
      card_id: "c3",
      name: "Pikachu",
      game: "pokemon",
      set_code: "BS",
      set_name: "Base Set",
      rarity: "common",
      condition: "lightly_played",
      collector_number: "58/102",
      image_uri: "https://images.example.test/pikachu.png",
    });

    expect(card.collector_number).toBe("58/102");
    expect(card.image_uri).toBe("https://images.example.test/pikachu.png");
    expect(card.updated_at).toBe(card.created_at);
  });
});

describe("bestVariantPrice", () => {
  it("should return 0 for a card with no variants", () => {
    const card = createCard({
      card_id: "c1",
      name: "Test",
      game: "mtg",
      set_code: "TST",
      set_name: "Test Set",
      rarity: "common",
      condition: "mint",
    });
    expect(bestVariantPrice(card)).toBe(0);
  });

  it("should return the highest variant price", () => {
    const card = createCard({
      card_id: "c1",
      name: "Test",
      game: "mtg",
      set_code: "TST",
      set_name: "Test Set",
      rarity: "rare",
      condition: "mint",
      variants: [
        { variant_id: "v1", label: "Standard", finish: "standard", market_price: 50 },
        { variant_id: "v2", label: "Foil", finish: "foil", market_price: 150 },
        { variant_id: "v3", label: "Etched", finish: "etched", market_price: 80 },
      ],
    });
    expect(bestVariantPrice(card)).toBe(150);
  });
});

describe("findVariant", () => {
  const card = createCard({
    card_id: "c1",
    name: "Test",
    game: "mtg",
    set_code: "TST",
    set_name: "Test",
    rarity: "rare",
    condition: "mint",
    variants: [
      { variant_id: "v1", label: "Standard", finish: "standard", market_price: 50 },
      { variant_id: "v2", label: "Foil", finish: "foil", market_price: 150 },
    ],
  });

  it("should find variant by label (case-insensitive)", () => {
    expect(findVariant(card, "foil")?.variant_id).toBe("v2");
    expect(findVariant(card, "FOIL")?.variant_id).toBe("v2");
  });

  it("should return undefined for unknown variant", () => {
    expect(findVariant(card, "borderless")).toBeUndefined();
  });
});
