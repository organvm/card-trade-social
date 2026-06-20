# Hydra Customer API and Usage Guide

This guide documents the customer-facing API contract for `card-trade-social`
and the TypeScript helpers currently exported by this package. It is written for
paid Hydra customers integrating market pricing, portfolio analytics, trades,
and billing into their own applications.

The repository currently ships the typed domain layer that API routes use for
card modeling, pricing, portfolios, trades, subscriptions, and checkout
scaffolding. Hosted REST endpoints should expose the same behavior and response
shapes described here.

## Quick Start

```bash
export HYDRA_API_BASE="https://api.hydra.gg"
export HYDRA_ACCESS_TOKEN="<customer-or-user-access-token>"

curl "$HYDRA_API_BASE/api/v1/billing/entitlements" \
  -H "Authorization: Bearer $HYDRA_ACCESS_TOKEN" \
  -H "Accept: application/json"
```

```typescript
import {
  createCard,
  createPortfolio,
  addCard,
  getStats,
  createFreeSubscription,
  canCatalogCards,
} from "card-trade-social";

const subscription = createFreeSubscription("user_123");
const portfolio = createPortfolio("user_123");

const card = createCard({
  card_id: "card_black_lotus_lea",
  name: "Black Lotus",
  game: "mtg",
  set_code: "LEA",
  set_name: "Limited Edition Alpha",
  rarity: "mythic",
  condition: "near_mint",
  variants: [
    {
      variant_id: "var_standard",
      label: "Standard",
      finish: "standard",
      market_price: 120000,
    },
  ],
});

const decision = canCatalogCards(portfolio, subscription, 1);
if (decision.allowed) {
  addCard(portfolio, card, 1, 95000);
}

console.log(getStats(portfolio));
```

## Base URLs

| Environment | Base URL |
|-------------|----------|
| Production | `https://api.hydra.gg` |
| Sandbox | `https://sandbox-api.hydra.gg` |
| Local gateway | `http://localhost:4000` |

API paths are versioned under `/api/v1`. WebSocket feeds use `/ws`.

## Authentication

Send an access token on every customer or user request:

```http
Authorization: Bearer <access_token>
Accept: application/json
Content-Type: application/json
```

Use HTTPS in production. Do not place access tokens in query parameters or
client-side source code. Server-side integrations should load tokens from a
secret manager or deployment environment variable.

### Token Types

| Token type | Intended use |
|------------|--------------|
| User access token | Portfolio, trade, and checkout actions for the signed-in user. |
| Customer API token | Server-to-server pricing, analytics, and account integrations. |
| Stripe webhook secret | Only for `/api/v1/billing/webhook`; verified with `Stripe-Signature`. |

### Scopes

Hosted deployments should issue tokens with scoped access. Recommended scopes:

| Scope | Allows |
|-------|--------|
| `cards:read` | Card lookup and search. |
| `pricing:read` | Hydra Price, price changes, and arbitrage alerts. |
| `pricing:write` | Recording customer-provided price points. |
| `portfolio:read` | Portfolio holdings, stats, and cataloging decisions. |
| `portfolio:write` | Adding and removing holdings. |
| `trades:read` | Reading trade proposals and history. |
| `trades:write` | Creating, accepting, rejecting, canceling, and countering trades. |
| `billing:read` | Current tier, limits, plans, and entitlements. |
| `billing:write` | Creating checkout sessions. |

Webhook requests from Stripe do not use Hydra bearer tokens. Verify the
`Stripe-Signature` header with `STRIPE_WEBHOOK_SECRET`.

## Request Conventions

| Convention | Details |
|------------|---------|
| Dates | ISO 8601 strings in UTC, for example `2026-02-14T00:00:00.000Z`. |
| Currency | Market, portfolio, and trade values are decimal USD unless a field ends in `_cents`. Stripe plan and product prices use integer cents. |
| IDs | Treat all IDs as opaque strings. Do not parse card IDs, trade IDs, Stripe IDs, or user IDs for business logic. |
| Idempotency | Send `Idempotency-Key` on `POST` actions that create resources or checkout sessions. |
| Pagination | List endpoints return `items`, `next_cursor`, and `has_more`. Pass `cursor` and `limit` on the next request. |
| Errors | Non-2xx responses return the standard error envelope below. |

```json
{
  "error": {
    "code": "portfolio_limit_exceeded",
    "message": "Hydra Pro is required for portfolio.catalog.unlimited",
    "request_id": "req_01J...",
    "details": {
      "current_cards": 100,
      "requested_cards": 1,
      "max_cards": 100
    }
  }
}
```

Recommended status codes:

| Status | Meaning |
|--------|---------|
| `400` | Invalid request body, query parameter, quantity, price, or URL. |
| `401` | Missing, expired, or invalid token. |
| `403` | Token is valid but lacks the required scope or entitlement. |
| `404` | Resource does not exist or is not visible to the caller. |
| `409` | State conflict, such as accepting a non-pending trade. |
| `422` | Business rule violation, such as self-trade or catalog limit exceeded. |
| `429` | Rate limit exceeded. |
| `500` | Unexpected server error. |

## Entitlements and Plans

The package defines two customer tiers:

| Tier | Price | Entitlements |
|------|-------|--------------|
| Free | `$0` | Basic analytics and basic cataloging. |
| Hydra Pro | `$9.99/mo` or `$99/yr` | Advanced analytics, unlimited cataloging, bulk import, and unlimited alerts. |

Cataloging limits:

| Tier | Max cards | Bulk import | Scan to catalog |
|------|-----------|-------------|-----------------|
| Free | `100` | No | Yes |
| Hydra Pro | Unlimited | Yes | Yes |

In-app products:

| Product ID | Kind | Price | Description |
|------------|------|-------|-------------|
| `proxy_print_credit` | Consumable | `$1.99` | Credit for one generated proxy print order. |
| `avatar_skin` | Durable | `$4.99` | Permanent cosmetic skin for the collection avatar. |
| `guild_banner` | Durable | `$6.99` | Permanent banner cosmetic for a user-managed guild. |

## Endpoint Summary

### Cards and Pricing

| Method | Endpoint | Scope | Description |
|--------|----------|-------|-------------|
| `GET` | `/api/v1/cards/search` | `cards:read` | Search cards by name, game, set, rarity, or collector number. |
| `GET` | `/api/v1/cards/{card_id}` | `cards:read` | Fetch a card entity and variants. |
| `GET` | `/api/v1/cards/{card_id}/price` | `pricing:read` | Return Hydra Price for a card. |
| `POST` | `/api/v1/cards/{card_id}/prices` | `pricing:write` | Record a customer-provided price point. |
| `GET` | `/api/v1/alerts/arbitrage` | `pricing:read` | Return active cross-source arbitrage alerts. |
| `GET` | `/api/v1/pricing/changes` | `pricing:read` | Return price changes between two time windows. |

### Portfolio

| Method | Endpoint | Scope | Description |
|--------|----------|-------|-------------|
| `GET` | `/api/v1/portfolio` | `portfolio:read` | Return the caller's holdings. |
| `POST` | `/api/v1/portfolio/holdings` | `portfolio:write` | Add a card to the caller's portfolio. |
| `DELETE` | `/api/v1/portfolio/holdings/{card_id}` | `portfolio:write` | Remove or reduce a card holding. |
| `GET` | `/api/v1/portfolio/stats` | `portfolio:read` | Return basic valuation and allocation stats. |
| `GET` | `/api/v1/portfolio/analytics` | `portfolio:read` | Return Pro-only advanced analytics. |
| `POST` | `/api/v1/portfolio/cataloging/check` | `portfolio:read` | Check whether more cards can be cataloged under the caller's tier. |

### Trades

| Method | Endpoint | Scope | Description |
|--------|----------|-------|-------------|
| `POST` | `/api/v1/trades` | `trades:write` | Create a pending trade proposal. |
| `GET` | `/api/v1/trades` | `trades:read` | List the caller's proposals as proposer or receiver. |
| `GET` | `/api/v1/trades/{trade_id}` | `trades:read` | Fetch one trade proposal. |
| `POST` | `/api/v1/trades/{trade_id}/accept` | `trades:write` | Accept a pending trade as receiver. |
| `POST` | `/api/v1/trades/{trade_id}/reject` | `trades:write` | Reject a pending trade as receiver. |
| `POST` | `/api/v1/trades/{trade_id}/cancel` | `trades:write` | Cancel a pending trade as proposer. |
| `POST` | `/api/v1/trades/{trade_id}/counter` | `trades:write` | Counter a pending trade as receiver. |
| `GET` | `/api/v1/trades/{trade_id}/value` | `trades:read` | Return net trade value from the proposer's perspective. |

### Billing

| Method | Endpoint | Scope | Description |
|--------|----------|-------|-------------|
| `GET` | `/api/v1/billing/entitlements` | `billing:read` | Return effective tier, plan, limits, and entitlements. |
| `POST` | `/api/v1/billing/checkout/pro` | `billing:write` | Create Stripe Checkout params/session for Hydra Pro. |
| `POST` | `/api/v1/billing/checkout/iap` | `billing:write` | Create Stripe Checkout params/session for an in-app product. |
| `POST` | `/api/v1/billing/webhook` | Stripe signed | Apply Stripe subscription and payment events. |

### WebSocket

| Endpoint | Auth | Description |
|----------|------|-------------|
| `wss://api.hydra.gg/ws/prices` | Bearer token or negotiated session token | Subscribe to live card price updates. |

## Cards and Pricing

### Card Shape

```json
{
  "card_id": "card_black_lotus_lea",
  "name": "Black Lotus",
  "game": "mtg",
  "set_code": "LEA",
  "set_name": "Limited Edition Alpha",
  "rarity": "mythic",
  "condition": "near_mint",
  "collector_number": "233",
  "ticker": "MTG-LEA-BLACKLOTUS",
  "variants": [
    {
      "variant_id": "var_standard",
      "label": "Standard",
      "finish": "standard",
      "market_price": 120000,
      "listed_price": 125000
    }
  ],
  "image_uri": "https://cdn.hydra.gg/cards/card_black_lotus_lea.png",
  "created_at": "2026-02-14T00:00:00.000Z",
  "updated_at": "2026-02-14T00:00:00.000Z"
}
```

Allowed values:

| Field | Values |
|-------|--------|
| `game` | `mtg`, `pokemon`, `yugioh`, `lorcana`, `other` |
| `rarity` | `common`, `uncommon`, `rare`, `mythic`, `secret` |
| `condition` | `mint`, `near_mint`, `lightly_played`, `moderately_played`, `heavily_played`, `damaged` |
| `finish` | `standard`, `foil`, `etched`, `borderless`, `serialized` |
| `price source` | `tcgplayer`, `cardkingdom`, `ebay`, `private_auction` |

Ticker generation format is `GAME-SET-SANITIZEDNAME`. Names are uppercased,
stripped to alphanumeric characters, and truncated to 10 characters.

### Search Cards

```bash
curl "$HYDRA_API_BASE/api/v1/cards/search?q=black%20lotus&game=mtg&limit=10" \
  -H "Authorization: Bearer $HYDRA_ACCESS_TOKEN"
```

```json
{
  "items": [
    {
      "card_id": "card_black_lotus_lea",
      "name": "Black Lotus",
      "game": "mtg",
      "set_code": "LEA",
      "set_name": "Limited Edition Alpha",
      "rarity": "mythic",
      "ticker": "MTG-LEA-BLACKLOTUS"
    }
  ],
  "next_cursor": null,
  "has_more": false
}
```

### Get Hydra Price

The Hydra Price algorithm uses points from the last 30 days, filters outliers
with the IQR method, weights sold listings twice as strongly as active listings,
and reports confidence from `0` to `1` based on data volume and source diversity.

```bash
curl "$HYDRA_API_BASE/api/v1/cards/card_black_lotus_lea/price" \
  -H "Authorization: Bearer $HYDRA_ACCESS_TOKEN"
```

```json
{
  "card_id": "card_black_lotus_lea",
  "price": 118750,
  "confidence": 0.85,
  "sources_used": 3,
  "calculated_at": "2026-02-14T00:00:00.000Z"
}
```

SDK equivalent:

```typescript
import {
  createPriceHistory,
  recordPrice,
  calculateHydraPrice,
} from "card-trade-social";

const history = createPriceHistory("card_black_lotus_lea");
recordPrice(history, "tcgplayer", 118000, true);
recordPrice(history, "ebay", 120000, true);
recordPrice(history, "cardkingdom", 117500, false);

const hydraPrice = calculateHydraPrice(history);
```

### Record a Price Point

```bash
curl "$HYDRA_API_BASE/api/v1/cards/card_black_lotus_lea/prices" \
  -X POST \
  -H "Authorization: Bearer $HYDRA_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: price-card_black_lotus_lea-ebay-20260214T000000Z" \
  -d '{
    "source": "ebay",
    "price": 120000,
    "is_sold": true
  }'
```

```json
{
  "card_id": "card_black_lotus_lea",
  "points_recorded": 1,
  "latest_point": {
    "source": "ebay",
    "price": 120000,
    "is_sold": true,
    "timestamp": "2026-02-14T00:00:00.000Z"
  }
}
```

Negative prices are rejected with `400`.

### Arbitrage Alerts

`min_spread_percentage` defaults to `15`.

```bash
curl "$HYDRA_API_BASE/api/v1/alerts/arbitrage?min_spread_percentage=20" \
  -H "Authorization: Bearer $HYDRA_ACCESS_TOKEN"
```

```json
{
  "items": [
    {
      "card_id": "card_sheoldred_dmu",
      "card_name": "Sheoldred, the Apocalypse",
      "low_source": "tcgplayer",
      "low_price": 67.5,
      "high_source": "ebay",
      "high_price": 84.25,
      "spread": 16.75,
      "spread_percentage": 24.81
    }
  ],
  "next_cursor": null,
  "has_more": false
}
```

## Portfolio

### Add a Holding

Free users can catalog up to 100 cards. Pro users can catalog unlimited cards.
Before adding large batches, call `/api/v1/portfolio/cataloging/check`.

```bash
curl "$HYDRA_API_BASE/api/v1/portfolio/holdings" \
  -X POST \
  -H "Authorization: Bearer $HYDRA_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: holding-user_123-card_black_lotus_lea-1" \
  -d '{
    "card_id": "card_black_lotus_lea",
    "quantity": 1,
    "purchase_price": 95000
  }'
```

```json
{
  "owner_id": "user_123",
  "entry": {
    "card_id": "card_black_lotus_lea",
    "quantity": 1,
    "purchase_price": 95000,
    "added_at": "2026-02-14T00:00:00.000Z"
  }
}
```

`quantity` must be positive. If the holding already exists, quantity is
incremented.

SDK equivalent:

```typescript
import { createPortfolio, addCard } from "card-trade-social";

const portfolio = createPortfolio("user_123");
addCard(portfolio, card, 1, 95000);
```

### Remove or Reduce a Holding

```bash
curl "$HYDRA_API_BASE/api/v1/portfolio/holdings/card_black_lotus_lea?quantity=1" \
  -X DELETE \
  -H "Authorization: Bearer $HYDRA_ACCESS_TOKEN"
```

```json
{
  "owner_id": "user_123",
  "removed_card_id": "card_black_lotus_lea",
  "remaining_quantity": 0
}
```

If the requested quantity is greater than or equal to the current quantity, the
holding is removed.

### Portfolio Stats

Portfolio value is calculated from the best variant market price adjusted by
card condition:

| Condition | Multiplier |
|-----------|------------|
| `mint` | `1.0` |
| `near_mint` | `0.9` |
| `lightly_played` | `0.75` |
| `moderately_played` | `0.6` |
| `heavily_played` | `0.4` |
| `damaged` | `0.25` |

```bash
curl "$HYDRA_API_BASE/api/v1/portfolio/stats" \
  -H "Authorization: Bearer $HYDRA_ACCESS_TOKEN"
```

```json
{
  "total_cards": 3,
  "total_value": 225,
  "allocations": [
    {
      "game": "mtg",
      "value": 225,
      "percentage": 100
    }
  ]
}
```

### Advanced Analytics

Advanced analytics require an active Hydra Pro entitlement:
`portfolio.analytics.advanced`.

```bash
curl "$HYDRA_API_BASE/api/v1/portfolio/analytics" \
  -H "Authorization: Bearer $HYDRA_ACCESS_TOKEN"
```

```json
{
  "total_cards": 3,
  "total_value": 225,
  "total_cost_basis": 200,
  "unrealized_pnl": 25,
  "unrealized_pnl_percentage": 12.5,
  "concentration_score": 0.68,
  "concentration_risk": "high",
  "largest_position": {
    "card_id": "card_black_lotus_lea",
    "card_name": "Black Lotus",
    "quantity": 2,
    "market_value": 180,
    "cost_basis": 140,
    "unrealized_pnl": 40,
    "weight_percentage": 80
  },
  "positions": [
    {
      "card_id": "card_black_lotus_lea",
      "card_name": "Black Lotus",
      "quantity": 2,
      "market_value": 180,
      "cost_basis": 140,
      "unrealized_pnl": 40,
      "weight_percentage": 80
    },
    {
      "card_id": "card_sol_ring_cmd",
      "card_name": "Sol Ring",
      "quantity": 1,
      "market_value": 45,
      "cost_basis": 60,
      "unrealized_pnl": -15,
      "weight_percentage": 20
    }
  ]
}
```

If the token is valid but the user is not entitled, the API returns `403` with
an error code such as `entitlement_required`.

### Cataloging Check

```bash
curl "$HYDRA_API_BASE/api/v1/portfolio/cataloging/check" \
  -X POST \
  -H "Authorization: Bearer $HYDRA_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "requested_cards": 25 }'
```

```json
{
  "allowed": true,
  "current_cards": 42,
  "requested_cards": 25,
  "max_cards": 100,
  "requires_pro": false
}
```

## Trades

Trade cash adjustment is from the proposer's perspective:

| Value | Meaning |
|-------|---------|
| Positive `cash_adjustment` | Proposer pays cash in addition to offered cards. |
| Negative `cash_adjustment` | Proposer receives cash in addition to requested cards. |

Default trade expiry is 72 hours.

### Create a Trade

```bash
curl "$HYDRA_API_BASE/api/v1/trades" \
  -X POST \
  -H "Authorization: Bearer $HYDRA_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: trade-user_123-user_456-20260214T000000Z" \
  -d '{
    "receiver_id": "user_456",
    "offered_items": [
      { "card_id": "card_sol_ring_cmd", "quantity": 1 }
    ],
    "requested_items": [
      { "card_id": "card_charizard_bs", "quantity": 1 }
    ],
    "cash_adjustment": 50,
    "message": "Adding cash to balance the condition gap.",
    "expiry_hours": 48
  }'
```

```json
{
  "trade_id": "trade_01J...",
  "proposer_id": "user_123",
  "receiver_id": "user_456",
  "offered_items": [
    {
      "card_id": "card_sol_ring_cmd",
      "quantity": 1
    }
  ],
  "requested_items": [
    {
      "card_id": "card_charizard_bs",
      "quantity": 1
    }
  ],
  "cash_adjustment": 50,
  "status": "pending",
  "message": "Adding cash to balance the condition gap.",
  "created_at": "2026-02-14T00:00:00.000Z",
  "updated_at": "2026-02-14T00:00:00.000Z",
  "expires_at": "2026-02-16T00:00:00.000Z"
}
```

Trade creation rejects:

| Rule | Error |
|------|-------|
| `proposer_id` equals `receiver_id` | `Cannot trade with yourself` |
| Both item arrays are empty | `Trade must include at least one item` |
| Any quantity is `<= 0` | `Item quantity must be positive` |

SDK equivalent:

```typescript
import { createProposal } from "card-trade-social";

const trade = createProposal({
  trade_id: "trade_01J...",
  proposer_id: "user_123",
  receiver_id: "user_456",
  offered_items: [{ card: solRing, quantity: 1 }],
  requested_items: [{ card: charizard, quantity: 1 }],
  cash_adjustment: 50,
  expiry_hours: 48,
});
```

### Accept, Reject, Cancel, or Counter

Only the receiver can accept or reject a pending trade:

```bash
curl "$HYDRA_API_BASE/api/v1/trades/trade_01J.../accept" \
  -X POST \
  -H "Authorization: Bearer $HYDRA_ACCESS_TOKEN"
```

Only the proposer can cancel a pending trade:

```bash
curl "$HYDRA_API_BASE/api/v1/trades/trade_01J.../cancel" \
  -X POST \
  -H "Authorization: Bearer $HYDRA_ACCESS_TOKEN"
```

Only the receiver can counter a pending trade. Countering marks the original
trade as `countered` and creates a new pending proposal with
`parent_trade_id` set to the original trade.

```bash
curl "$HYDRA_API_BASE/api/v1/trades/trade_01J.../counter" \
  -X POST \
  -H "Authorization: Bearer $HYDRA_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: counter-trade_01J-20260214T000000Z" \
  -d '{
    "offered_items": [
      { "card_id": "card_charizard_bs", "quantity": 1 }
    ],
    "requested_items": [
      { "card_id": "card_sol_ring_cmd", "quantity": 2 }
    ],
    "cash_adjustment": 0,
    "message": "Can do this for two copies."
  }'
```

Valid statuses are:

```text
pending, accepted, rejected, countered, cancelled, expired
```

Attempts to act on a non-pending trade return `409`.

### Net Trade Value

```bash
curl "$HYDRA_API_BASE/api/v1/trades/trade_01J.../value" \
  -H "Authorization: Bearer $HYDRA_ACCESS_TOKEN"
```

```json
{
  "trade_id": "trade_01J...",
  "net_value": 150,
  "perspective": "proposer",
  "meaning": "positive means the proposer pays or gives more value"
}
```

Formula:

```text
requested item value - offered item value + cash_adjustment
```

## Billing

### Get Entitlements

```bash
curl "$HYDRA_API_BASE/api/v1/billing/entitlements" \
  -H "Authorization: Bearer $HYDRA_ACCESS_TOKEN"
```

```json
{
  "user_id": "user_123",
  "tier": "pro",
  "effective_tier": "pro",
  "status": "active",
  "current_period_end": "2026-03-14T00:00:00.000Z",
  "cancel_at_period_end": false,
  "entitlements": [
    "portfolio.analytics.basic",
    "portfolio.analytics.advanced",
    "portfolio.catalog.basic",
    "portfolio.catalog.unlimited",
    "portfolio.catalog.bulk_import",
    "portfolio.alerts.unlimited"
  ],
  "cataloging_limits": {
    "max_cards": 9007199254740991,
    "bulk_import": true,
    "scan_to_catalog": true
  }
}
```

### Create Hydra Pro Checkout

The API route should call Stripe server-side. The TypeScript helper returns
params that can be passed to `stripe.checkout.sessions.create(...)`.

```bash
curl "$HYDRA_API_BASE/api/v1/billing/checkout/pro" \
  -X POST \
  -H "Authorization: Bearer $HYDRA_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: checkout-pro-user_123-20260214T000000Z" \
  -d '{
    "billing_interval": "month",
    "success_url": "https://app.example.com/billing/success",
    "cancel_url": "https://app.example.com/billing/cancel"
  }'
```

```json
{
  "checkout_session_id": "cs_test_123",
  "url": "https://checkout.stripe.com/c/pay/cs_test_123",
  "mode": "subscription"
}
```

Server-side helper usage:

```typescript
import { createProCheckoutSession } from "card-trade-social";

const checkoutParams = createProCheckoutSession({
  user_id: "user_123",
  price_id: process.env.STRIPE_PRICE_PRO_MONTHLY!,
  billing_interval: "month",
  success_url: "https://app.example.com/billing/success",
  cancel_url: "https://app.example.com/billing/cancel",
  stripe_customer_id: "cus_123",
});

const session = await stripe.checkout.sessions.create(checkoutParams);
```

`success_url` and `cancel_url` must be absolute HTTP or HTTPS URLs.

### Create In-App Purchase Checkout

```bash
curl "$HYDRA_API_BASE/api/v1/billing/checkout/iap" \
  -X POST \
  -H "Authorization: Bearer $HYDRA_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: checkout-iap-user_123-proxy_print_credit-20260214T000000Z" \
  -d '{
    "product_id": "proxy_print_credit",
    "quantity": 3,
    "success_url": "https://app.example.com/purchase/success",
    "cancel_url": "https://app.example.com/purchase/cancel"
  }'
```

```json
{
  "checkout_session_id": "cs_test_456",
  "url": "https://checkout.stripe.com/c/pay/cs_test_456",
  "mode": "payment"
}
```

`quantity` defaults to `1` and must be a positive integer.

### Stripe Webhook

The webhook endpoint is not called by customer clients. Configure it in Stripe
Dashboard as:

```text
POST https://api.hydra.gg/api/v1/billing/webhook
```

Supported event families:

| Event family | Expected handling |
|--------------|-------------------|
| `customer.subscription.*` | Map Stripe subscription snapshots into `SubscriptionState`. |
| `checkout.session.completed` with `mode=payment` | Create an `InAppPurchaseReceipt` for paid in-app purchases. |

Server-side helpers:

```typescript
import {
  subscriptionFromStripeSnapshot,
  inAppPurchaseReceiptFromCheckoutSession,
} from "card-trade-social";

const subscription = subscriptionFromStripeSnapshot(
  "user_123",
  stripeSubscription,
  [
    process.env.STRIPE_PRICE_PRO_MONTHLY!,
    process.env.STRIPE_PRICE_PRO_YEARLY!,
  ]
);

const receipt = inAppPurchaseReceiptFromCheckoutSession(stripeCheckoutSession);
```

Subscription statuses treated as active are `active` and `trialing`, provided
`current_period_end` is missing or still in the future. Expired or inactive Pro
subscriptions fall back to Free entitlements.

## WebSocket Price Stream

Connect with a token negotiated by your backend or with an Authorization header
if your WebSocket client supports it.

```typescript
const ws = new WebSocket(
  "wss://api.hydra.gg/ws/prices?symbols=MTG-LEA-BLACKLOTUS,MTG-CMD-SOLRING"
);

ws.addEventListener("message", (event) => {
  const update = JSON.parse(event.data);
  console.log(update);
});
```

Example message:

```json
{
  "type": "price.update",
  "card_id": "card_black_lotus_lea",
  "ticker": "MTG-LEA-BLACKLOTUS",
  "price": 118750,
  "confidence": 0.85,
  "sources_used": 3,
  "calculated_at": "2026-02-14T00:00:00.000Z"
}
```

Clients should reconnect with exponential backoff and resubscribe after a
connection drop.

## Operational Checklist

Before using the production API, confirm:

- Tokens are stored server-side or in a secure mobile token store.
- Write requests include an `Idempotency-Key`.
- Stripe webhook signatures are verified before processing payloads.
- Pro-only screens handle `403 entitlement_required` by showing an upgrade path.
- Prices and portfolio values are displayed with clear currency context.
- Trade flows confirm actor identity before accepting, rejecting, canceling, or
  countering proposals.
- Logs redact access tokens, Stripe secrets, customer emails, and payment IDs.

## TypeScript Export Map

The package public entrypoint exports:

| Module | Key exports |
|--------|-------------|
| `card` | `createCard`, `generateTicker`, `adjustedPrice`, `bestVariantPrice`, `findVariant` |
| `pricing` | `createPriceHistory`, `recordPrice`, `calculateHydraPrice`, `detectArbitrage`, `calculatePriceChanges` |
| `portfolio` | `createPortfolio`, `addCard`, `removeCard`, `portfolioValue`, `getStats`, `getAdvancedAnalytics`, `canCatalogCards` |
| `trade` | `createProposal`, `acceptTrade`, `rejectTrade`, `cancelTrade`, `counterTrade`, `netTradeValue` |
| `subscription` | `createFreeSubscription`, `hasEntitlement`, `requireEntitlement`, `getCatalogingLimits`, `createProCheckoutSession`, `createInAppPurchaseCheckoutSession`, `subscriptionFromStripeSnapshot`, `inAppPurchaseReceiptFromCheckoutSession` |
