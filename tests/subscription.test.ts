import {
  canUsePremiumFeature,
  createFreeSubscription,
  createInAppPurchaseCheckoutSession,
  createInAppPurchaseBillingCheckoutSession,
  createLemonSqueezyInAppPurchaseCheckoutSession,
  createLemonSqueezyProCheckoutSession,
  createProBillingCheckoutSession,
  createProCheckoutSession,
  effectiveTier,
  getCatalogingLimits,
  hasEntitlement,
  inAppPurchaseReceiptFromCheckoutSession,
  isLicenseActive,
  isSubscriptionActive,
  licenseFromLemonSqueezySnapshot,
  requirePremiumFeature,
  requireEntitlement,
  subscriptionFromLemonSqueezySnapshot,
  subscriptionFromStripeSnapshot,
} from "../src/subscription";
import type { LicenseState, SubscriptionState } from "../src/subscription";

function activePro(overrides: Partial<SubscriptionState> = {}): SubscriptionState {
  return {
    user_id: "user-1",
    tier: "pro",
    status: "active",
    current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    cancel_at_period_end: false,
    updated_at: new Date(),
    ...overrides,
  };
}

describe("subscription entitlements", () => {
  it("should create a free subscription state", () => {
    const subscription = createFreeSubscription("user-1");

    expect(subscription.tier).toBe("free");
    expect(subscription.status).toBe("none");
    expect(hasEntitlement(subscription, "portfolio.analytics.basic")).toBe(true);
    expect(hasEntitlement(subscription, "portfolio.analytics.advanced")).toBe(false);
  });

  it("should grant Pro entitlements to active Pro users", () => {
    const subscription = activePro();

    expect(isSubscriptionActive(subscription)).toBe(true);
    expect(effectiveTier(subscription)).toBe("pro");
    expect(hasEntitlement(subscription, "portfolio.analytics.advanced")).toBe(true);
    expect(hasEntitlement(subscription, "portfolio.catalog.bulk_import")).toBe(true);
    expect(getCatalogingLimits(subscription).bulk_import).toBe(true);
  });

  it("should fall back to free when a Pro subscription is expired", () => {
    const subscription = activePro({
      current_period_end: new Date(Date.now() - 1000),
    });

    expect(isSubscriptionActive(subscription)).toBe(false);
    expect(effectiveTier(subscription)).toBe("free");
    expect(hasEntitlement(subscription, "portfolio.catalog.unlimited")).toBe(false);
  });

  it("should treat trialing Pro subscriptions without an end date as active", () => {
    const subscription = activePro({
      status: "trialing",
      current_period_end: undefined,
    });

    expect(isSubscriptionActive(subscription)).toBe(true);
    expect(effectiveTier(subscription)).toBe("pro");
  });

  it("should deny Pro entitlements for inactive Pro statuses", () => {
    const subscription = activePro({
      status: "past_due",
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    expect(isSubscriptionActive(subscription)).toBe(false);
    expect(effectiveTier(subscription)).toBe("free");
    expect(hasEntitlement(subscription, "portfolio.analytics.advanced")).toBe(false);
  });

  it("should enforce required entitlements", () => {
    expect(() =>
      requireEntitlement(
        createFreeSubscription("user-1"),
        "portfolio.analytics.advanced"
      )
    ).toThrow("Hydra Pro is required");

    expect(() =>
      requireEntitlement(activePro(), "portfolio.analytics.advanced")
    ).not.toThrow();
  });

  it("should grant premium gates to active Lemon Squeezy licenses", () => {
    const license: LicenseState = {
      user_id: "user-1",
      tier: "pro",
      provider: "lemon_squeezy",
      status: "active",
      license_key_id: "license-1",
      updated_at: new Date(),
    };

    expect(isLicenseActive(license)).toBe(true);
    expect(effectiveTier(license)).toBe("pro");
    expect(canUsePremiumFeature(license, "copy_trading")).toMatchObject({
      allowed: true,
      entitlement: "social.copy_trade",
      requires_pro: false,
    });
    expect(() =>
      requirePremiumFeature(license, "advanced_portfolio_analytics")
    ).not.toThrow();
  });

  it("should deny premium gates for inactive or expired licenses", () => {
    const license: LicenseState = {
      user_id: "user-1",
      tier: "pro",
      provider: "lemon_squeezy",
      status: "active",
      license_key_id: "license-1",
      expires_at: new Date(Date.now() - 1_000),
      updated_at: new Date(),
    };

    expect(isLicenseActive(license)).toBe(false);
    expect(effectiveTier(license)).toBe("free");
    expect(canUsePremiumFeature(license, "proxy_printing")).toMatchObject({
      allowed: false,
      entitlement: "genai.proxy_print",
      requires_pro: true,
    });
  });
});

describe("Stripe checkout scaffold", () => {
  it("should build a Pro subscription checkout request", () => {
    const checkout = createProCheckoutSession({
      user_id: "user-1",
      price_id: "price_pro_monthly",
      billing_interval: "month",
      success_url: "https://hydra.test/billing/success",
      cancel_url: "https://hydra.test/billing/cancel",
      customer_email: "collector@example.com",
    });

    expect(checkout.mode).toBe("subscription");
    expect(checkout.line_items).toEqual([{ price: "price_pro_monthly", quantity: 1 }]);
    expect(checkout.client_reference_id).toBe("user-1");
    expect(checkout.customer_email).toBe("collector@example.com");
    expect(checkout.metadata.tier).toBe("pro");
    expect(checkout.subscription_data?.metadata.product).toBe("hydra_pro");
  });

  it("should build an in-app purchase checkout request", () => {
    const checkout = createInAppPurchaseCheckoutSession({
      user_id: "user-1",
      product_id: "proxy_print_credit",
      price_id: "price_proxy_print_credit",
      quantity: 3,
      success_url: "https://hydra.test/purchase/success",
      cancel_url: "https://hydra.test/purchase/cancel",
      stripe_customer_id: "cus_123",
    });

    expect(checkout.mode).toBe("payment");
    expect(checkout.line_items).toEqual([
      { price: "price_proxy_print_credit", quantity: 3 },
    ]);
    expect(checkout.customer).toBe("cus_123");
    expect(checkout.customer_email).toBeUndefined();
    expect(checkout.metadata.product_id).toBe("proxy_print_credit");
    expect(checkout.metadata.quantity).toBe("3");
    expect(checkout.payment_intent_data?.metadata.product_kind).toBe("consumable");
  });

  it("should prefer an existing Stripe customer over customer email", () => {
    const checkout = createProCheckoutSession({
      user_id: "user-1",
      price_id: "price_pro_yearly",
      billing_interval: "year",
      success_url: "https://hydra.test/billing/success",
      cancel_url: "https://hydra.test/billing/cancel",
      stripe_customer_id: "cus_123",
      customer_email: "collector@example.com",
    });

    expect(checkout.customer).toBe("cus_123");
    expect(checkout.customer_email).toBeUndefined();
  });

  it("should default in-app purchase quantity to one", () => {
    const checkout = createInAppPurchaseCheckoutSession({
      user_id: "user-1",
      product_id: "guild_banner",
      price_id: "price_guild_banner",
      success_url: "https://hydra.test/purchase/success",
      cancel_url: "https://hydra.test/purchase/cancel",
      customer_email: "collector@example.com",
    });

    expect(checkout.line_items).toEqual([{ price: "price_guild_banner", quantity: 1 }]);
    expect(checkout.customer_email).toBe("collector@example.com");
    expect(checkout.metadata.quantity).toBe("1");
    expect(checkout.payment_intent_data?.metadata.product_kind).toBe("durable");
  });

  it("should reject invalid checkout quantities and URLs", () => {
    expect(() =>
      createInAppPurchaseCheckoutSession({
        user_id: "user-1",
        product_id: "avatar_skin",
        price_id: "price_avatar_skin",
        quantity: 0,
        success_url: "https://hydra.test/purchase/success",
        cancel_url: "https://hydra.test/purchase/cancel",
      })
    ).toThrow("Quantity must be a positive integer");

    expect(() =>
      createProCheckoutSession({
        user_id: "user-1",
        price_id: "price_pro_yearly",
        billing_interval: "year",
        success_url: "/billing/success",
        cancel_url: "https://hydra.test/billing/cancel",
      })
    ).toThrow("absolute HTTP URL");
  });

  it("should reject missing required checkout fields and unknown products", () => {
    expect(() =>
      createProCheckoutSession({
        user_id: " ",
        price_id: "price_pro_monthly",
        billing_interval: "month",
        success_url: "https://hydra.test/billing/success",
        cancel_url: "https://hydra.test/billing/cancel",
      })
    ).toThrow("user_id is required");

    expect(() =>
      createInAppPurchaseCheckoutSession({
        user_id: "user-1",
        product_id: "unknown" as never,
        price_id: "price_unknown",
        success_url: "https://hydra.test/purchase/success",
        cancel_url: "https://hydra.test/purchase/cancel",
      })
    ).toThrow("Unknown in-app product");
  });

  it("should build a Lemon Squeezy Pro checkout request", () => {
    const checkout = createLemonSqueezyProCheckoutSession({
      user_id: "user-1",
      store_id: 10,
      variant_id: 20,
      billing_interval: "year",
      success_url: "https://hydra.test/billing/success",
      cancel_url: "https://hydra.test/billing/cancel",
      customer_email: "collector@example.com",
      customer_name: "Collector One",
      test_mode: true,
    });

    expect(checkout.data.type).toBe("checkouts");
    expect(checkout.data.relationships.store.data).toEqual({
      type: "stores",
      id: "10",
    });
    expect(checkout.data.relationships.variant.data).toEqual({
      type: "variants",
      id: "20",
    });
    expect(checkout.data.attributes.product_options.redirect_url).toBe(
      "https://hydra.test/billing/success"
    );
    expect(checkout.data.attributes.product_options.enabled_variants).toEqual([20]);
    expect(checkout.data.attributes.checkout_data.email).toBe(
      "collector@example.com"
    );
    expect(checkout.data.attributes.checkout_data.custom).toMatchObject({
      user_id: "user-1",
      product: "hydra_pro",
      tier: "pro",
      billing_interval: "year",
      cancel_url: "https://hydra.test/billing/cancel",
    });
    expect(checkout.data.attributes.test_mode).toBe(true);
  });

  it("should build a Lemon Squeezy in-app purchase checkout request", () => {
    const checkout = createLemonSqueezyInAppPurchaseCheckoutSession({
      user_id: "user-1",
      store_id: "10",
      variant_id: "33",
      product_id: "proxy_print_credit",
      quantity: 2,
      success_url: "https://hydra.test/purchase/success",
    });

    expect(checkout.data.attributes.checkout_data.variant_quantities).toEqual([
      { variant_id: 33, quantity: 2 },
    ]);
    expect(checkout.data.attributes.checkout_data.custom).toMatchObject({
      user_id: "user-1",
      product_id: "proxy_print_credit",
      product_kind: "consumable",
      quantity: "2",
    });
  });

  it("should reject invalid Lemon Squeezy checkout identifiers", () => {
    expect(() =>
      createLemonSqueezyProCheckoutSession({
        user_id: "user-1",
        store_id: 10,
        variant_id: "variant_20",
        billing_interval: "month",
        success_url: "https://hydra.test/billing/success",
      })
    ).toThrow("variant_id must be a positive integer");
  });

  it("should dispatch checkout creation by billing provider", () => {
    const stripeCheckout = createProBillingCheckoutSession({
      provider: "stripe",
      user_id: "user-1",
      price_id: "price_pro_monthly",
      billing_interval: "month",
      success_url: "https://hydra.test/billing/success",
      cancel_url: "https://hydra.test/billing/cancel",
    });
    const lemonCheckout = createInAppPurchaseBillingCheckoutSession({
      provider: "lemon_squeezy",
      user_id: "user-1",
      store_id: 10,
      variant_id: 33,
      product_id: "avatar_skin",
      success_url: "https://hydra.test/purchase/success",
    });

    if (!("mode" in stripeCheckout)) {
      throw new Error("Expected Stripe checkout payload");
    }
    if (!("data" in lemonCheckout)) {
      throw new Error("Expected Lemon Squeezy checkout payload");
    }

    expect(stripeCheckout.mode).toBe("subscription");
    expect(lemonCheckout.data.type).toBe("checkouts");
  });
});

describe("subscriptionFromStripeSnapshot", () => {
  it("should map Stripe subscription snapshots to Pro state", () => {
    const subscription = subscriptionFromStripeSnapshot(
      "user-1",
      {
        id: "sub_123",
        customer: "cus_123",
        status: "active",
        current_period_end: 1_800_000_000,
        cancel_at_period_end: true,
        items: {
          data: [{ price: { id: "price_pro_monthly" } }],
        },
      },
      ["price_pro_monthly"]
    );

    expect(subscription.tier).toBe("pro");
    expect(subscription.stripe_customer_id).toBe("cus_123");
    expect(subscription.stripe_subscription_id).toBe("sub_123");
    expect(subscription.stripe_price_id).toBe("price_pro_monthly");
    expect(subscription.cancel_at_period_end).toBe(true);
    expect(subscription.current_period_end).toEqual(new Date(1_800_000_000 * 1000));
  });

  it("should use metadata tier when no price allowlist is supplied", () => {
    const subscription = subscriptionFromStripeSnapshot("user-1", {
      id: "sub_123",
      customer: "cus_123",
      status: "trialing",
      metadata: { tier: "pro" },
    });

    expect(subscription.tier).toBe("pro");
    expect(hasEntitlement(subscription, "portfolio.analytics.advanced")).toBe(true);
  });

  it("should keep subscriptions free for non-allowlisted prices", () => {
    const subscription = subscriptionFromStripeSnapshot(
      "user-1",
      {
        id: "sub_123",
        customer: "cus_123",
        status: "active",
        items: {
          data: [{ price: { id: "price_basic" } }],
        },
      },
      ["price_pro_monthly"]
    );

    expect(subscription.tier).toBe("free");
    expect(effectiveTier(subscription)).toBe("free");
    expect(subscription.stripe_price_id).toBe("price_basic");
  });

  it("should reject incomplete Stripe subscription snapshots", () => {
    expect(() =>
      subscriptionFromStripeSnapshot("user-1", {
        id: "",
        customer: "cus_123",
        status: "active",
      })
    ).toThrow("stripe_subscription_id is required");

    expect(() =>
      subscriptionFromStripeSnapshot("", {
        id: "sub_123",
        customer: "cus_123",
        status: "active",
      })
    ).toThrow("user_id is required");
  });
});

describe("Lemon Squeezy snapshots", () => {
  it("should map Lemon Squeezy subscriptions to Pro state", () => {
    const subscription = subscriptionFromLemonSqueezySnapshot(
      "user-1",
      {
        id: 123,
        attributes: {
          status: "on_trial",
          customer_id: 456,
          variant_id: 789,
          renews_at: "2026-03-01T00:00:00.000Z",
          cancelled: true,
        },
      },
      [789]
    );

    expect(subscription.provider).toBe("lemon_squeezy");
    expect(subscription.tier).toBe("pro");
    expect(subscription.status).toBe("trialing");
    expect(subscription.lemon_squeezy_customer_id).toBe("456");
    expect(subscription.lemon_squeezy_subscription_id).toBe("123");
    expect(subscription.lemon_squeezy_variant_id).toBe("789");
    expect(subscription.current_period_end).toEqual(
      new Date("2026-03-01T00:00:00.000Z")
    );
    expect(subscription.cancel_at_period_end).toBe(true);
  });

  it("should honor Lemon Squeezy custom tier metadata", () => {
    const subscription = subscriptionFromLemonSqueezySnapshot("user-1", {
      id: "sub-1",
      attributes: {
        status: "active",
        variant_id: "not-in-allowlist",
      },
      meta: {
        custom_data: {
          tier: "pro",
        },
      },
    });

    expect(subscription.tier).toBe("pro");
    expect(hasEntitlement(subscription, "social.copy_trade")).toBe(true);
  });

  it("should map activated Lemon Squeezy licenses to Pro access", () => {
    const license = licenseFromLemonSqueezySnapshot("user-1", {
      activated: true,
      error: null,
      license_key: {
        id: 1,
        status: "active",
        key: "38b1460a-5104-4067-a91d-77b872934d51",
        expires_at: "2026-04-01T00:00:00.000Z",
      },
      instance: {
        id: "instance-1",
        name: "Hydra Web",
        created_at: "2026-02-01T00:00:00.000Z",
      },
      meta: {
        customer_id: 6,
        customer_email: "collector@example.com",
        product_id: 4,
        product_name: "Hydra Pro",
        variant_id: 5,
        variant_name: "Yearly",
      },
    });

    expect(license.provider).toBe("lemon_squeezy");
    expect(license.tier).toBe("pro");
    expect(license.license_key_id).toBe("1");
    expect(license.license_key_last4).toBe("4d51");
    expect(license.instance_id).toBe("instance-1");
    expect(license.customer_id).toBe("6");
    expect(license.expires_at).toEqual(new Date("2026-04-01T00:00:00.000Z"));
    expect(effectiveTier(license, new Date("2026-03-01T00:00:00.000Z"))).toBe(
      "pro"
    );
  });

  it("should keep non-Pro Lemon Squeezy licenses on the free tier", () => {
    const license = licenseFromLemonSqueezySnapshot(
      "user-1",
      {
        valid: true,
        license_key: {
          id: "license-1",
          status: "active",
        },
        meta: {
          product_name: "Hydra Starter",
          variant_id: "starter",
        },
      },
      ["pro"]
    );

    expect(license.tier).toBe("free");
    expect(hasEntitlement(license, "portfolio.analytics.basic")).toBe(true);
    expect(hasEntitlement(license, "portfolio.analytics.advanced")).toBe(false);
  });

  it("should deny access when Lemon Squeezy rejects activation", () => {
    const license = licenseFromLemonSqueezySnapshot("user-1", {
      activated: false,
      error: "This license key has reached the activation limit.",
      license_key: {
        id: "license-1",
        status: "active",
      },
      meta: {
        product_name: "Hydra Pro",
      },
    });

    expect(license.status).toBe("inactive");
    expect(license.provider_error).toContain("activation limit");
    expect(effectiveTier(license)).toBe("free");
    expect(hasEntitlement(license, "social.copy_trade")).toBe(false);
  });

  it("should reject malformed Lemon Squeezy dates", () => {
    expect(() =>
      licenseFromLemonSqueezySnapshot("user-1", {
        license_key: {
          id: "license-1",
          status: "active",
          expires_at: "not-a-date",
        },
      })
    ).toThrow("Invalid date");
  });
});

describe("inAppPurchaseReceiptFromCheckoutSession", () => {
  it("should create a receipt from a paid checkout session", () => {
    const purchased_at = new Date("2026-02-14T00:00:00.000Z");

    const receipt = inAppPurchaseReceiptFromCheckoutSession(
      {
        id: "cs_123",
        mode: "payment",
        client_reference_id: "user-1",
        customer: "cus_123",
        payment_intent: "pi_123",
        payment_status: "paid",
        amount_total: 597,
        currency: "usd",
        metadata: {
          product_id: "proxy_print_credit",
          quantity: "3",
        },
      },
      purchased_at
    );

    expect(receipt.user_id).toBe("user-1");
    expect(receipt.product_id).toBe("proxy_print_credit");
    expect(receipt.quantity).toBe(3);
    expect(receipt.stripe_checkout_session_id).toBe("cs_123");
    expect(receipt.stripe_payment_intent_id).toBe("pi_123");
    expect(receipt.purchased_at).toBe(purchased_at);
  });

  it("should reject unpaid or unknown purchase sessions", () => {
    expect(() =>
      inAppPurchaseReceiptFromCheckoutSession({
        id: "cs_123",
        mode: "payment",
        payment_status: "unpaid",
        metadata: {
          user_id: "user-1",
          product_id: "avatar_skin",
        },
      })
    ).toThrow("not paid");

    expect(() =>
      inAppPurchaseReceiptFromCheckoutSession({
        id: "cs_123",
        mode: "payment",
        client_reference_id: "user-1",
        payment_status: "paid",
        metadata: {
          product_id: "unknown",
        },
      })
    ).toThrow("Unknown in-app product");
  });

  it("should use metadata user id before client reference id", () => {
    const receipt = inAppPurchaseReceiptFromCheckoutSession({
      id: "cs_123",
      mode: "payment",
      client_reference_id: "client-user",
      payment_status: "paid",
      metadata: {
        user_id: "metadata-user",
        product_id: "avatar_skin",
      },
    });

    expect(receipt.user_id).toBe("metadata-user");
    expect(receipt.quantity).toBe(1);
  });

  it("should reject subscription-mode sessions and invalid receipt quantities", () => {
    expect(() =>
      inAppPurchaseReceiptFromCheckoutSession({
        id: "cs_123",
        mode: "subscription",
        client_reference_id: "user-1",
        payment_status: "paid",
        metadata: {
          product_id: "avatar_skin",
        },
      })
    ).toThrow("Expected payment checkout session");

    expect(() =>
      inAppPurchaseReceiptFromCheckoutSession({
        id: "cs_123",
        mode: "payment",
        client_reference_id: "user-1",
        payment_status: "paid",
        metadata: {
          product_id: "avatar_skin",
          quantity: "1.5",
        },
      })
    ).toThrow("Quantity must be a positive integer");
  });
});
