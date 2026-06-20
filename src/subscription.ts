/**
 * Billing, license, and entitlement helpers for Hydra Pro and in-app purchases.
 *
 * This module intentionally avoids importing provider SDKs. API routes can pass
 * the returned params to Stripe or Lemon Squeezy clients while keeping feature
 * gates testable in this domain package.
 */

export type SubscriptionTier = "free" | "pro";

export type BillingProvider = "stripe" | "lemon_squeezy";

export type SubscriptionStatus =
  | "none"
  | "incomplete"
  | "incomplete_expired"
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "unpaid"
  | "paused";

export type LicenseStatus = "inactive" | "active" | "expired" | "disabled";

export type BillingInterval = "month" | "year";

export type Entitlement =
  | "portfolio.analytics.basic"
  | "portfolio.analytics.advanced"
  | "portfolio.catalog.basic"
  | "portfolio.catalog.unlimited"
  | "portfolio.catalog.bulk_import"
  | "portfolio.alerts.unlimited"
  | "social.creator_buy_lists.premium"
  | "social.copy_trade"
  | "genai.proxy_print";

export type PremiumFeature =
  | "advanced_portfolio_analytics"
  | "unlimited_cataloging"
  | "bulk_import"
  | "unlimited_alerts"
  | "premium_creator_buy_lists"
  | "copy_trading"
  | "proxy_printing";

export type InAppProductId =
  | "proxy_print_credit"
  | "avatar_skin"
  | "guild_banner";

export interface SubscriptionState {
  user_id: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  provider?: BillingProvider;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  stripe_price_id?: string;
  lemon_squeezy_customer_id?: string;
  lemon_squeezy_subscription_id?: string;
  lemon_squeezy_variant_id?: string;
  current_period_end?: Date;
  cancel_at_period_end: boolean;
  updated_at: Date;
}

export interface LicenseState {
  user_id: string;
  tier: SubscriptionTier;
  provider: "lemon_squeezy";
  status: LicenseStatus;
  license_key_id: string;
  license_key_last4?: string;
  instance_id?: string;
  customer_id?: string;
  customer_email?: string;
  product_id?: string;
  product_name?: string;
  variant_id?: string;
  variant_name?: string;
  provider_error?: string;
  expires_at?: Date;
  activated_at?: Date;
  updated_at: Date;
}

export type EntitlementSubject = SubscriptionState | LicenseState;

export interface SubscriptionPlan {
  tier: SubscriptionTier;
  name: string;
  monthly_price_cents: number;
  yearly_price_cents: number;
  entitlements: Entitlement[];
}

export interface CatalogingLimits {
  max_cards: number;
  bulk_import: boolean;
  scan_to_catalog: boolean;
}

export interface InAppProduct {
  product_id: InAppProductId;
  name: string;
  kind: "consumable" | "durable";
  price_cents: number;
  currency: "usd";
  description: string;
}

export interface StripeCheckoutLineItem {
  price: string;
  quantity: number;
}

export interface StripeCheckoutSessionParams {
  mode: "subscription" | "payment";
  line_items: StripeCheckoutLineItem[];
  success_url: string;
  cancel_url: string;
  client_reference_id: string;
  customer?: string;
  customer_email?: string;
  allow_promotion_codes?: boolean;
  metadata: Record<string, string>;
  subscription_data?: {
    metadata: Record<string, string>;
  };
  payment_intent_data?: {
    metadata: Record<string, string>;
  };
}

export interface LemonSqueezyCheckoutSessionParams {
  data: {
    type: "checkouts";
    attributes: {
      product_options: {
        redirect_url: string;
        enabled_variants: number[];
      };
      checkout_options: {
        discount: boolean;
        embed?: boolean;
      };
      checkout_data: {
        email?: string;
        name?: string;
        custom: Record<string, string>;
        variant_quantities?: Array<{
          variant_id: number;
          quantity: number;
        }>;
      };
      expires_at?: string | null;
      test_mode?: boolean;
    };
    relationships: {
      store: {
        data: {
          type: "stores";
          id: string;
        };
      };
      variant: {
        data: {
          type: "variants";
          id: string;
        };
      };
    };
  };
}

export interface StripeCheckoutSessionSnapshot {
  id: string;
  mode: "subscription" | "payment";
  client_reference_id?: string;
  customer?: string;
  payment_intent?: string;
  payment_status?: "paid" | "unpaid" | "no_payment_required";
  amount_total?: number;
  currency?: string;
  metadata?: Record<string, string | undefined>;
}

export interface InAppPurchaseReceipt {
  user_id: string;
  product_id: InAppProductId;
  quantity: number;
  stripe_checkout_session_id: string;
  stripe_customer_id?: string;
  stripe_payment_intent_id?: string;
  amount_total?: number;
  currency?: string;
  purchased_at: Date;
}

export interface ProCheckoutParams {
  user_id: string;
  price_id: string;
  billing_interval: BillingInterval;
  success_url: string;
  cancel_url: string;
  stripe_customer_id?: string;
  customer_email?: string;
}

export interface LemonSqueezyProCheckoutParams {
  user_id: string;
  store_id: string | number;
  variant_id: string | number;
  billing_interval: BillingInterval;
  success_url: string;
  cancel_url?: string;
  customer_email?: string;
  customer_name?: string;
  embed?: boolean;
  test_mode?: boolean;
  expires_at?: Date;
}

export interface InAppPurchaseCheckoutParams {
  user_id: string;
  product_id: InAppProductId;
  price_id: string;
  quantity?: number;
  success_url: string;
  cancel_url: string;
  stripe_customer_id?: string;
  customer_email?: string;
}

export interface LemonSqueezyInAppPurchaseCheckoutParams {
  user_id: string;
  store_id: string | number;
  variant_id: string | number;
  product_id: InAppProductId;
  quantity?: number;
  success_url: string;
  cancel_url?: string;
  customer_email?: string;
  customer_name?: string;
  embed?: boolean;
  test_mode?: boolean;
  expires_at?: Date;
}

export type ProBillingCheckoutParams =
  | ({ provider: "stripe" } & ProCheckoutParams)
  | ({ provider: "lemon_squeezy" } & LemonSqueezyProCheckoutParams);

export type InAppPurchaseBillingCheckoutParams =
  | ({ provider: "stripe" } & InAppPurchaseCheckoutParams)
  | ({ provider: "lemon_squeezy" } & LemonSqueezyInAppPurchaseCheckoutParams);

export type BillingCheckoutSessionParams =
  | StripeCheckoutSessionParams
  | LemonSqueezyCheckoutSessionParams;

export interface StripeSubscriptionSnapshot {
  id: string;
  customer: string;
  status: SubscriptionStatus;
  current_period_end?: number;
  cancel_at_period_end?: boolean;
  items?: {
    data: Array<{
      price?: {
        id?: string;
      };
    }>;
  };
  metadata?: Record<string, string | undefined>;
}

export interface LemonSqueezySubscriptionSnapshot {
  id: string | number;
  attributes?: {
    status?: string;
    customer_id?: string | number;
    variant_id?: string | number;
    renews_at?: string | null;
    ends_at?: string | null;
    cancelled?: boolean;
    user_email?: string;
  };
  meta?: {
    custom_data?: Record<string, string | undefined>;
  };
}

export interface LemonSqueezyLicenseKeySnapshot {
  id: string | number;
  status: LicenseStatus;
  key?: string;
  expires_at?: string | null;
}

export interface LemonSqueezyLicenseInstanceSnapshot {
  id: string;
  name?: string;
  created_at?: string;
}

export interface LemonSqueezyLicenseMetaSnapshot {
  customer_id?: string | number;
  customer_email?: string;
  product_id?: string | number;
  product_name?: string;
  variant_id?: string | number;
  variant_name?: string;
}

export interface LemonSqueezyLicenseSnapshot {
  activated?: boolean;
  valid?: boolean;
  error?: string | null;
  license_key: LemonSqueezyLicenseKeySnapshot;
  instance?: LemonSqueezyLicenseInstanceSnapshot | null;
  meta?: LemonSqueezyLicenseMetaSnapshot;
}

export interface FeatureGateDecision {
  feature: PremiumFeature;
  entitlement: Entitlement;
  allowed: boolean;
  tier: SubscriptionTier;
  requires_pro: boolean;
}

export const FREE_PLAN: SubscriptionPlan = {
  tier: "free",
  name: "Hydra Free",
  monthly_price_cents: 0,
  yearly_price_cents: 0,
  entitlements: ["portfolio.analytics.basic", "portfolio.catalog.basic"],
};

export const PRO_PLAN: SubscriptionPlan = {
  tier: "pro",
  name: "Hydra Pro",
  monthly_price_cents: 999,
  yearly_price_cents: 9900,
  entitlements: [
    "portfolio.analytics.basic",
    "portfolio.analytics.advanced",
    "portfolio.catalog.basic",
    "portfolio.catalog.unlimited",
    "portfolio.catalog.bulk_import",
    "portfolio.alerts.unlimited",
    "social.creator_buy_lists.premium",
    "social.copy_trade",
    "genai.proxy_print",
  ],
};

export const SUBSCRIPTION_PLANS: Record<SubscriptionTier, SubscriptionPlan> = {
  free: FREE_PLAN,
  pro: PRO_PLAN,
};

export const UNLIMITED_CATALOG_CARDS = Number.MAX_SAFE_INTEGER;

export const CATALOGING_LIMITS: Record<SubscriptionTier, CatalogingLimits> = {
  free: {
    max_cards: 100,
    bulk_import: false,
    scan_to_catalog: true,
  },
  pro: {
    max_cards: UNLIMITED_CATALOG_CARDS,
    bulk_import: true,
    scan_to_catalog: true,
  },
};

export const IN_APP_PRODUCTS: Record<InAppProductId, InAppProduct> = {
  proxy_print_credit: {
    product_id: "proxy_print_credit",
    name: "Proxy Print Credit",
    kind: "consumable",
    price_cents: 199,
    currency: "usd",
    description: "Credit for one generated proxy print order.",
  },
  avatar_skin: {
    product_id: "avatar_skin",
    name: "Avatar Skin",
    kind: "durable",
    price_cents: 499,
    currency: "usd",
    description: "Permanent cosmetic skin for the collection avatar.",
  },
  guild_banner: {
    product_id: "guild_banner",
    name: "Guild Banner",
    kind: "durable",
    price_cents: 699,
    currency: "usd",
    description: "Permanent banner cosmetic for a user-managed guild.",
  },
};

const ACTIVE_STATUSES = new Set<SubscriptionStatus>(["active", "trialing"]);
const ACTIVE_LICENSE_STATUSES = new Set<LicenseStatus>(["active"]);

export const FEATURE_ENTITLEMENTS: Record<PremiumFeature, Entitlement> = {
  advanced_portfolio_analytics: "portfolio.analytics.advanced",
  unlimited_cataloging: "portfolio.catalog.unlimited",
  bulk_import: "portfolio.catalog.bulk_import",
  unlimited_alerts: "portfolio.alerts.unlimited",
  premium_creator_buy_lists: "social.creator_buy_lists.premium",
  copy_trading: "social.copy_trade",
  proxy_printing: "genai.proxy_print",
};

export function createFreeSubscription(user_id: string): SubscriptionState {
  return {
    user_id,
    tier: "free",
    status: "none",
    cancel_at_period_end: false,
    updated_at: new Date(),
  };
}

export function isSubscriptionActive(
  subscription: SubscriptionState,
  now: Date = new Date()
): boolean {
  if (!ACTIVE_STATUSES.has(subscription.status)) {
    return false;
  }

  return (
    subscription.current_period_end === undefined ||
    subscription.current_period_end.getTime() > now.getTime()
  );
}

export function isLicenseActive(
  license: LicenseState,
  now: Date = new Date()
): boolean {
  if (!ACTIVE_LICENSE_STATUSES.has(license.status)) {
    return false;
  }

  return (
    license.expires_at === undefined ||
    license.expires_at.getTime() > now.getTime()
  );
}

export function effectiveTier(
  subscription: EntitlementSubject,
  now: Date = new Date()
): SubscriptionTier {
  if (isLicenseState(subscription)) {
    return subscription.tier === "pro" && isLicenseActive(subscription, now)
      ? "pro"
      : "free";
  }

  return subscription.tier === "pro" && isSubscriptionActive(subscription, now)
    ? "pro"
    : "free";
}

export function hasEntitlement(
  subscription: EntitlementSubject,
  entitlement: Entitlement,
  now: Date = new Date()
): boolean {
  const tier = effectiveTier(subscription, now);
  return SUBSCRIPTION_PLANS[tier].entitlements.includes(entitlement);
}

export function requireEntitlement(
  subscription: EntitlementSubject,
  entitlement: Entitlement,
  now: Date = new Date()
): void {
  if (!hasEntitlement(subscription, entitlement, now)) {
    throw new Error(`Hydra Pro is required for ${entitlement}`);
  }
}

export function getCatalogingLimits(
  subscription: EntitlementSubject,
  now: Date = new Date()
): CatalogingLimits {
  return CATALOGING_LIMITS[effectiveTier(subscription, now)];
}

export function canUsePremiumFeature(
  subscription: EntitlementSubject,
  feature: PremiumFeature,
  now: Date = new Date()
): FeatureGateDecision {
  const entitlement = FEATURE_ENTITLEMENTS[feature];
  const tier = effectiveTier(subscription, now);
  const allowed = hasEntitlement(subscription, entitlement, now);

  return {
    feature,
    entitlement,
    allowed,
    tier,
    requires_pro: !allowed,
  };
}

export function requirePremiumFeature(
  subscription: EntitlementSubject,
  feature: PremiumFeature,
  now: Date = new Date()
): void {
  const entitlement = FEATURE_ENTITLEMENTS[feature];
  requireEntitlement(subscription, entitlement, now);
}

export function createProCheckoutSession(
  params: ProCheckoutParams
): StripeCheckoutSessionParams {
  assertNonEmpty(params.user_id, "user_id");
  assertNonEmpty(params.price_id, "price_id");
  assertCheckoutUrl(params.success_url, "success_url");
  assertCheckoutUrl(params.cancel_url, "cancel_url");

  const metadata = {
    user_id: params.user_id,
    product: "hydra_pro",
    tier: "pro",
    billing_interval: params.billing_interval,
  };

  return {
    mode: "subscription",
    line_items: [{ price: params.price_id, quantity: 1 }],
    success_url: params.success_url,
    cancel_url: params.cancel_url,
    client_reference_id: params.user_id,
    customer: params.stripe_customer_id,
    customer_email: params.stripe_customer_id ? undefined : params.customer_email,
    allow_promotion_codes: true,
    metadata,
    subscription_data: { metadata },
  };
}

export const createStripeProCheckoutSession = createProCheckoutSession;

export function createLemonSqueezyProCheckoutSession(
  params: LemonSqueezyProCheckoutParams
): LemonSqueezyCheckoutSessionParams {
  assertNonEmpty(params.user_id, "user_id");
  assertCheckoutUrl(params.success_url, "success_url");
  if (params.cancel_url !== undefined) {
    assertCheckoutUrl(params.cancel_url, "cancel_url");
  }

  const store_id = normalizeProviderId(params.store_id, "store_id");
  const variant_id = normalizeProviderId(params.variant_id, "variant_id");
  const numeric_variant_id = normalizeProviderNumericId(
    params.variant_id,
    "variant_id"
  );

  return createLemonSqueezyCheckoutRequest({
    store_id,
    variant_id,
    numeric_variant_id,
    success_url: params.success_url,
    customer_email: params.customer_email,
    customer_name: params.customer_name,
    embed: params.embed,
    test_mode: params.test_mode,
    expires_at: params.expires_at,
    custom: {
      user_id: params.user_id,
      product: "hydra_pro",
      tier: "pro",
      billing_interval: params.billing_interval,
      cancel_url: params.cancel_url ?? "",
    },
  });
}

export function createInAppPurchaseCheckoutSession(
  params: InAppPurchaseCheckoutParams
): StripeCheckoutSessionParams {
  assertNonEmpty(params.user_id, "user_id");
  assertNonEmpty(params.price_id, "price_id");
  assertCheckoutUrl(params.success_url, "success_url");
  assertCheckoutUrl(params.cancel_url, "cancel_url");

  const product = IN_APP_PRODUCTS[params.product_id];
  if (!product) {
    throw new Error(`Unknown in-app product: ${params.product_id}`);
  }

  const quantity = params.quantity ?? 1;
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new Error("Quantity must be a positive integer");
  }

  const metadata = {
    user_id: params.user_id,
    product_id: product.product_id,
    product_kind: product.kind,
    quantity: quantity.toString(),
  };

  return {
    mode: "payment",
    line_items: [{ price: params.price_id, quantity }],
    success_url: params.success_url,
    cancel_url: params.cancel_url,
    client_reference_id: params.user_id,
    customer: params.stripe_customer_id,
    customer_email: params.stripe_customer_id ? undefined : params.customer_email,
    metadata,
    payment_intent_data: { metadata },
  };
}

export const createStripeInAppPurchaseCheckoutSession =
  createInAppPurchaseCheckoutSession;

export function createLemonSqueezyInAppPurchaseCheckoutSession(
  params: LemonSqueezyInAppPurchaseCheckoutParams
): LemonSqueezyCheckoutSessionParams {
  assertNonEmpty(params.user_id, "user_id");
  assertCheckoutUrl(params.success_url, "success_url");
  if (params.cancel_url !== undefined) {
    assertCheckoutUrl(params.cancel_url, "cancel_url");
  }

  const product = IN_APP_PRODUCTS[params.product_id];
  if (!product) {
    throw new Error(`Unknown in-app product: ${params.product_id}`);
  }

  const quantity = params.quantity ?? 1;
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new Error("Quantity must be a positive integer");
  }

  const store_id = normalizeProviderId(params.store_id, "store_id");
  const variant_id = normalizeProviderId(params.variant_id, "variant_id");
  const numeric_variant_id = normalizeProviderNumericId(
    params.variant_id,
    "variant_id"
  );

  return createLemonSqueezyCheckoutRequest({
    store_id,
    variant_id,
    numeric_variant_id,
    quantity,
    success_url: params.success_url,
    customer_email: params.customer_email,
    customer_name: params.customer_name,
    embed: params.embed,
    test_mode: params.test_mode,
    expires_at: params.expires_at,
    custom: {
      user_id: params.user_id,
      product_id: product.product_id,
      product_kind: product.kind,
      quantity: quantity.toString(),
      cancel_url: params.cancel_url ?? "",
    },
  });
}

export function createProBillingCheckoutSession(
  params: ProBillingCheckoutParams
): BillingCheckoutSessionParams {
  if (params.provider === "stripe") {
    return createProCheckoutSession({
      user_id: params.user_id,
      price_id: params.price_id,
      billing_interval: params.billing_interval,
      success_url: params.success_url,
      cancel_url: params.cancel_url,
      stripe_customer_id: params.stripe_customer_id,
      customer_email: params.customer_email,
    });
  }

  return createLemonSqueezyProCheckoutSession({
    user_id: params.user_id,
    store_id: params.store_id,
    variant_id: params.variant_id,
    billing_interval: params.billing_interval,
    success_url: params.success_url,
    cancel_url: params.cancel_url,
    customer_email: params.customer_email,
    customer_name: params.customer_name,
    embed: params.embed,
    test_mode: params.test_mode,
    expires_at: params.expires_at,
  });
}

export function createInAppPurchaseBillingCheckoutSession(
  params: InAppPurchaseBillingCheckoutParams
): BillingCheckoutSessionParams {
  if (params.provider === "stripe") {
    return createInAppPurchaseCheckoutSession({
      user_id: params.user_id,
      product_id: params.product_id,
      price_id: params.price_id,
      quantity: params.quantity,
      success_url: params.success_url,
      cancel_url: params.cancel_url,
      stripe_customer_id: params.stripe_customer_id,
      customer_email: params.customer_email,
    });
  }

  return createLemonSqueezyInAppPurchaseCheckoutSession({
    user_id: params.user_id,
    store_id: params.store_id,
    variant_id: params.variant_id,
    product_id: params.product_id,
    quantity: params.quantity,
    success_url: params.success_url,
    cancel_url: params.cancel_url,
    customer_email: params.customer_email,
    customer_name: params.customer_name,
    embed: params.embed,
    test_mode: params.test_mode,
    expires_at: params.expires_at,
  });
}

export function subscriptionFromStripeSnapshot(
  user_id: string,
  snapshot: StripeSubscriptionSnapshot,
  pro_price_ids: string[] = []
): SubscriptionState {
  assertNonEmpty(user_id, "user_id");
  assertNonEmpty(snapshot.id, "stripe_subscription_id");
  assertNonEmpty(snapshot.customer, "stripe_customer_id");

  const price_id = snapshot.items?.data[0]?.price?.id;
  const isProPrice =
    snapshot.metadata?.tier === "pro" ||
    (price_id !== undefined && pro_price_ids.includes(price_id));

  return {
    user_id,
    tier: isProPrice ? "pro" : "free",
    provider: "stripe",
    status: snapshot.status,
    stripe_customer_id: snapshot.customer,
    stripe_subscription_id: snapshot.id,
    stripe_price_id: price_id,
    current_period_end:
      snapshot.current_period_end === undefined
        ? undefined
        : new Date(snapshot.current_period_end * 1000),
    cancel_at_period_end: snapshot.cancel_at_period_end ?? false,
    updated_at: new Date(),
  };
}

export function subscriptionFromLemonSqueezySnapshot(
  user_id: string,
  snapshot: LemonSqueezySubscriptionSnapshot,
  pro_variant_ids: Array<string | number> = []
): SubscriptionState {
  assertNonEmpty(user_id, "user_id");
  const subscription_id = normalizeProviderId(
    snapshot.id,
    "lemon_squeezy_subscription_id"
  );

  const attributes = snapshot.attributes ?? {};
  const customer_id =
    attributes.customer_id === undefined
      ? undefined
      : normalizeProviderId(attributes.customer_id, "lemon_squeezy_customer_id");
  const variant_id =
    attributes.variant_id === undefined
      ? undefined
      : normalizeProviderId(attributes.variant_id, "lemon_squeezy_variant_id");
  const status = normalizeLemonSqueezySubscriptionStatus(attributes.status);
  const customTier = snapshot.meta?.custom_data?.tier;
  const isProVariant =
    customTier === "pro" ||
    (variant_id !== undefined &&
      pro_variant_ids.map(String).includes(variant_id));

  return {
    user_id,
    tier: isProVariant ? "pro" : "free",
    provider: "lemon_squeezy",
    status,
    lemon_squeezy_customer_id: customer_id,
    lemon_squeezy_subscription_id: subscription_id,
    lemon_squeezy_variant_id: variant_id,
    current_period_end: parseOptionalDate(
      attributes.renews_at ?? attributes.ends_at
    ),
    cancel_at_period_end: attributes.cancelled ?? false,
    updated_at: new Date(),
  };
}

export function licenseFromLemonSqueezySnapshot(
  user_id: string,
  snapshot: LemonSqueezyLicenseSnapshot,
  pro_variant_ids: Array<string | number> = []
): LicenseState {
  assertNonEmpty(user_id, "user_id");
  const license = snapshot.license_key;
  const license_key_id = normalizeProviderId(license.id, "license_key_id");
  const variant_id =
    snapshot.meta?.variant_id === undefined
      ? undefined
      : normalizeProviderId(snapshot.meta.variant_id, "variant_id");
  const tier = isProLemonSqueezyLicense(snapshot, pro_variant_ids) ? "pro" : "free";
  const responseAccepted = snapshot.activated ?? snapshot.valid ?? true;

  return {
    user_id,
    tier,
    provider: "lemon_squeezy",
    status: responseAccepted ? license.status : "inactive",
    license_key_id,
    license_key_last4: maskLicenseKeyLast4(license.key),
    instance_id: snapshot.instance?.id,
    customer_id:
      snapshot.meta?.customer_id === undefined
        ? undefined
        : normalizeProviderId(snapshot.meta.customer_id, "customer_id"),
    customer_email: snapshot.meta?.customer_email,
    product_id:
      snapshot.meta?.product_id === undefined
        ? undefined
        : normalizeProviderId(snapshot.meta.product_id, "product_id"),
    product_name: snapshot.meta?.product_name,
    variant_id,
    variant_name: snapshot.meta?.variant_name,
    provider_error: snapshot.error ?? undefined,
    expires_at: parseOptionalDate(license.expires_at),
    activated_at: parseOptionalDate(snapshot.instance?.created_at),
    updated_at: new Date(),
  };
}

export function inAppPurchaseReceiptFromCheckoutSession(
  session: StripeCheckoutSessionSnapshot,
  now: Date = new Date()
): InAppPurchaseReceipt {
  assertNonEmpty(session.id, "stripe_checkout_session_id");
  if (session.mode !== "payment") {
    throw new Error(`Expected payment checkout session, received ${session.mode}`);
  }
  if (session.payment_status !== undefined && session.payment_status !== "paid") {
    throw new Error(`Checkout session is not paid: ${session.payment_status}`);
  }

  const user_id = session.metadata?.user_id ?? session.client_reference_id;
  assertNonEmpty(user_id, "user_id");

  const product_id = session.metadata?.product_id;
  if (!isInAppProductId(product_id)) {
    throw new Error(`Unknown in-app product: ${product_id ?? "missing"}`);
  }

  const quantity = Number(session.metadata?.quantity ?? "1");
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new Error("Quantity must be a positive integer");
  }

  return {
    user_id,
    product_id,
    quantity,
    stripe_checkout_session_id: session.id,
    stripe_customer_id: session.customer,
    stripe_payment_intent_id: session.payment_intent,
    amount_total: session.amount_total,
    currency: session.currency,
    purchased_at: now,
  };
}

function assertNonEmpty(value: string | undefined, field: string): asserts value is string {
  if (value === undefined || value.trim() === "") {
    throw new Error(`${field} is required`);
  }
}

function assertCheckoutUrl(value: string, field: string): void {
  assertNonEmpty(value, field);
  if (!/^https?:\/\//.test(value)) {
    throw new Error(`${field} must be an absolute HTTP URL`);
  }
}

function isInAppProductId(value: string | undefined): value is InAppProductId {
  return value !== undefined && value in IN_APP_PRODUCTS;
}

function isLicenseState(value: EntitlementSubject): value is LicenseState {
  return "license_key_id" in value;
}

function normalizeProviderId(value: string | number, field: string): string {
  const normalized = String(value);
  assertNonEmpty(normalized, field);
  return normalized;
}

function normalizeProviderNumericId(value: string | number, field: string): number {
  const normalized = Number(value);
  if (!Number.isInteger(normalized) || normalized <= 0) {
    throw new Error(`${field} must be a positive integer`);
  }
  return normalized;
}

function createLemonSqueezyCheckoutRequest(params: {
  store_id: string;
  variant_id: string;
  numeric_variant_id: number;
  quantity?: number;
  success_url: string;
  customer_email?: string;
  customer_name?: string;
  embed?: boolean;
  test_mode?: boolean;
  expires_at?: Date;
  custom: Record<string, string>;
}): LemonSqueezyCheckoutSessionParams {
  const checkout_data: LemonSqueezyCheckoutSessionParams["data"]["attributes"]["checkout_data"] = {
    custom: compactMetadata(params.custom),
  };

  if (params.customer_email !== undefined) {
    assertNonEmpty(params.customer_email, "customer_email");
    checkout_data.email = params.customer_email;
  }
  if (params.customer_name !== undefined) {
    assertNonEmpty(params.customer_name, "customer_name");
    checkout_data.name = params.customer_name;
  }
  if (params.quantity !== undefined) {
    checkout_data.variant_quantities = [
      { variant_id: params.numeric_variant_id, quantity: params.quantity },
    ];
  }

  const checkout_options: LemonSqueezyCheckoutSessionParams["data"]["attributes"]["checkout_options"] = {
    discount: true,
  };
  if (params.embed !== undefined) {
    checkout_options.embed = params.embed;
  }

  const attributes: LemonSqueezyCheckoutSessionParams["data"]["attributes"] = {
    product_options: {
      redirect_url: params.success_url,
      enabled_variants: [params.numeric_variant_id],
    },
    checkout_options,
    checkout_data,
  };
  if (params.expires_at !== undefined) {
    attributes.expires_at = params.expires_at.toISOString();
  }
  if (params.test_mode !== undefined) {
    attributes.test_mode = params.test_mode;
  }

  return {
    data: {
      type: "checkouts",
      attributes,
      relationships: {
        store: {
          data: {
            type: "stores",
            id: params.store_id,
          },
        },
        variant: {
          data: {
            type: "variants",
            id: params.variant_id,
          },
        },
      },
    },
  };
}

function compactMetadata(metadata: Record<string, string>): Record<string, string> {
  const compacted: Record<string, string> = {};
  for (const [key, value] of Object.entries(metadata)) {
    if (value !== "") {
      compacted[key] = value;
    }
  }
  return compacted;
}

function normalizeLemonSqueezySubscriptionStatus(
  status: string | undefined
): SubscriptionStatus {
  switch (status) {
    case "active":
    case "on_trial":
      return status === "on_trial" ? "trialing" : "active";
    case "past_due":
      return "past_due";
    case "unpaid":
      return "unpaid";
    case "cancelled":
    case "expired":
      return "canceled";
    case "paused":
      return "paused";
    default:
      return "none";
  }
}

function parseOptionalDate(value: string | null | undefined): Date | undefined {
  if (value === undefined || value === null || value.trim() === "") {
    return undefined;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid date: ${value}`);
  }

  return parsed;
}

function isProLemonSqueezyLicense(
  snapshot: LemonSqueezyLicenseSnapshot,
  pro_variant_ids: Array<string | number>
): boolean {
  const variantId = snapshot.meta?.variant_id;
  if (
    variantId !== undefined &&
    pro_variant_ids.map(String).includes(String(variantId))
  ) {
    return true;
  }

  const productName = snapshot.meta?.product_name?.toLowerCase() ?? "";
  const variantName = snapshot.meta?.variant_name?.toLowerCase() ?? "";
  return productName.includes("pro") || variantName.includes("pro");
}

function maskLicenseKeyLast4(value: string | undefined): string | undefined {
  if (value === undefined || value.length < 4) {
    return undefined;
  }

  return value.slice(-4);
}
