# card-trade-social

[![CI](https://github.com/organvm-iii-ergon/card-trade-social/actions/workflows/ci.yml/badge.svg)](https://github.com/organvm-iii-ergon/card-trade-social/actions/workflows/ci.yml)
[![Coverage](https://img.shields.io/badge/coverage-pending-lightgrey)](https://github.com/organvm-iii-ergon/card-trade-social)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/organvm-iii-ergon/card-trade-social/blob/main/LICENSE)
[![Organ III](https://img.shields.io/badge/Organ-III%20Ergon-F59E0B)](https://github.com/organvm-iii-ergon)
[![Status](https://img.shields.io/badge/status-active-brightgreen)](https://github.com/organvm-iii-ergon/card-trade-social)
[![TypeScript](https://img.shields.io/badge/lang-TypeScript-informational)](https://github.com/organvm-iii-ergon/card-trade-social)

**Hydra Trading Card Ecosystem is a vertical SaaS platform that treats trading cards as a legitimate asset class, combining Robinhood-style market intelligence, Patreon-style creator monetization, Duolingo-style gamification, and generative AI content creation into a single integrated experience for the $50B+ global TCG market.**

---

## Table of Contents

1. [Business Problem](#1-business-problem)
2. [Solution Overview](#2-solution-overview)
3. [Technical Architecture](#3-technical-architecture)
4. [Installation and Setup](#4-installation-and-setup)
5. [Usage and API](#5-usage-and-api)
6. [Working Examples](#6-working-examples)
7. [Business Model](#7-business-model)
8. [Testing and Quality](#8-testing-and-quality)
9. [Cross-References](#9-cross-references)
10. [Contributing](#10-contributing)
11. [License and Author](#11-license-and-author)

---

## 1. Business Problem

### The Market

The global trading card game market surpassed $50 billion in combined primary and secondary sales in recent years, driven by sustained demand across Magic: The Gathering, Pokemon, Yu-Gi-Oh!, sports cards, and newer entrants like Lorcana and One Piece TCG. This figure captures sealed product, singles, graded cards, and the grey-market speculation that surrounds chase printings, vintage staples, and limited-run promotional items. The secondary market alone -- where individual cards change hands between collectors, players, and investors -- accounts for billions in annual transaction volume across platforms like TCGPlayer, eBay, Card Kingdom, and dozens of regional marketplaces.

Yet the infrastructure serving this market remains fragmented, opaque, and stuck in a paradigm designed for casual hobbyists rather than serious asset managers. Trading cards are one of the last major alternative asset classes without a unified, data-driven platform that treats price discovery, portfolio management, and community insight as first-class concerns.

### The Pain

The core problems facing TCG participants today are structural, not cosmetic:

- **Price fragmentation.** A single card has different prices on TCGPlayer, eBay completed listings, Card Kingdom buylist, and local game stores. There is no algorithmic "fair value" that synthesizes these signals into a single actionable number. Arbitrage opportunities exist constantly but are invisible to anyone not running custom scraping scripts.

- **Portfolio blindness.** Collectors and investors with five-figure or six-figure collections have no dashboard that tracks their holdings over time, computes unrealized gains, or alerts them to sell windows. They manage inventory in spreadsheets, Moxfield decklists, or -- most commonly -- their memory.

- **Community fragmentation.** Price-moving information (ban list leaks, reprint announcements, tournament results, influencer endorsements) travels through Twitter, Reddit, Discord, and YouTube. By the time a casual participant sees the signal, the price has already moved. The information asymmetry between "whales" and retail participants is enormous and growing.

- **No creator economy.** Content creators who drive enormous purchasing decisions (deck techs, set reviews, market reports) have no native monetization path within the TCG ecosystem itself. They rely on YouTube ad revenue, Patreon, and affiliate links -- all external to the platforms where transactions actually happen.

- **Engagement decay.** The TCG hobby has a well-documented retention problem. Players and collectors cycle in and out. There are no progression systems, streaks, or community anchors that reward consistent participation the way modern consumer apps do.

### Who This Serves

Hydra targets two overlapping but distinct user segments:

- **Adult investors and collectors (25-45).** These users treat cards as alternative assets. They care about portfolio valuation, price alerts, arbitrage windows, tax-lot tracking, and data-driven buy/sell signals. They are currently underserved by every existing platform.

- **Younger players and emerging collectors (12-20).** These users are drawn to gamification, social features, collection showcases, and creative tools. They want their collection to feel alive -- not like a static spreadsheet. They are the growth engine of the market but have no platform designed for their engagement patterns.

Both segments share a need for accurate pricing, community connection, and a reason to open the app every day. Hydra serves both by layering social and gamification features on top of institutional-grade market data.

---

## 2. Solution Overview

### Four-Layer Architecture

Hydra is built as four interlocking layers, each inspired by a proven consumer product paradigm but adapted for the trading card asset class:

1. **Market Interface (Robinhood Layer).** Real-time price aggregation from TCGPlayer, eBay, and Card Kingdom. A proprietary "Hydra Price" algorithm that computes fair market value by weighting source reliability, recency, and volume. Candlestick charting for individual cards and indices. A causality engine that links price movements to verifiable events (ban announcements, tournament top-8 results, reprint confirmations, influencer mentions). Portfolio tracking with cost-basis, unrealized P&L, and arbitrage alerts.

2. **Social and Community (Patreon Layer).** Influencer and whale tracking: follow high-profile collectors and see their public acquisitions in real time. Copy-trading: mirror the buy lists of trusted community members with a single action. Curated buy lists published by creators with subscription-tier monetization. Guilds and tribes for format-specific or game-specific communities. Collection spotlights and "Show and Tell" feeds where users can showcase recent pulls, graded returns, and milestone acquisitions.

3. **Gamification (Duolingo/Habitica Layer).** Avatar evolution that reflects a user's collection profile and activity. A class system with three archetypes -- Merchant (trade volume), Archivist (catalog completeness), and Gladiator (tournament participation) -- each with unique progression trees. Daily quests tied to market research, community contribution, and collection curation. Streak mechanics that reward consistent engagement. Portfolio leagues where users compete on collection growth, prediction accuracy, or trade volume over weekly and monthly cycles. Knowledge trivia that tests and teaches card history, rules interactions, and market literacy.

4. **Generative Engine (Fusion/Bloom Layer).** AI-powered card creation using concept fusion: combine two or more existing cards, themes, or aesthetics to generate entirely new card art and mechanics. Monster Rancher-style input: feed the system a Spotify playlist, a URL, a barcode, or a photograph, and receive a procedurally generated card that reflects the input's characteristics. On-demand proxy printing for custom cards, playtest materials, and personalized collectibles. Community voting and curation for the best AI-generated designs.

### Measurable Outcomes

| Metric | Current State (No Hydra) | Target State (With Hydra) |
|--------|--------------------------|---------------------------|
| Price discovery time | 15-30 min across 3+ sites | < 2 seconds, single query |
| Portfolio valuation accuracy | Manual, spreadsheet-based | Real-time, automated, multi-source |
| Arbitrage window detection | Invisible to most users | Automated alerts within 60 seconds |
| Creator monetization (TCG-native) | $0 (external platforms only) | Subscription tiers + buy list commissions |
| Daily active engagement | App-dependent, no unifying platform | Gamified daily quests, streaks, leagues |
| Time from event to price context | Hours to days | Causality engine links within minutes |

---

## 3. Technical Architecture

### System Diagram

```
                         +---------------------------+
                         |      Client Layer          |
                         |  React (Web) / RN (Mobile) |
                         +-------------+-------------+
                                       |
                              WebSocket + REST
                                       |
                         +-------------v-------------+
                         |       API Gateway          |
                         |     (Kong / Express)       |
                         +--+------+------+--------+-+
                            |      |      |        |
              +-------------+  +---+---+  +---+--+ +-------+
              | Market Svc   |  |Social |  |Game | |GenAI  |
              | price agg,   |  |Svc    |  |Svc  | |Svc    |
              | Hydra Price, |  |feeds, |  |XP,  | |fusion,|
              | causality    |  |guilds,|  |quests| |proxy  |
              | engine       |  |subs   |  |     | |print  |
              +------+-------+  +---+---+  +--+--+ +---+---+
                     |              |          |         |
              +------v--------------v----------v---------v---+
              |              Data Layer                       |
              |  PostgreSQL (users, portfolios, transactions) |
              |  Redis (cache, real-time feeds, leaderboards) |
              |  Elasticsearch (card search, full-text)       |
              |  S3 (generated images, proxy print assets)    |
              +----------------------------------------------+
```

### Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Web Frontend | React + TypeScript | Component ecosystem, SSR with Next.js |
| Mobile Frontend | React Native | Shared codebase with web, native performance |
| API Gateway | Kong or Express Gateway | Rate limiting, auth, routing |
| Real-Time | WebSocket (Socket.IO) | Live price feeds, social activity streams |
| Primary Database | PostgreSQL | Relational integrity for transactions, portfolios |
| Cache/Pub-Sub | Redis | Leaderboards, session cache, real-time event bus |
| Search | Elasticsearch | Full-text card search across 500K+ card entries |
| Object Storage | S3-compatible | Generated card images, proxy print PDFs |
| Payments | Stripe + PayPal + Crypto (via Coinbase Commerce) | Multi-rail payment for global reach |
| OCR/Scanning | Tesseract + custom CNN | Card identification from camera input |
| Generative AI | Stable Diffusion (fine-tuned) + GPT-4 (mechanics) | Card art generation + rules text synthesis |
| Infrastructure | Docker + Kubernetes | Horizontal scaling, service isolation |
| CI/CD | GitHub Actions | Org-standard, integrated with registry |

### Services

| Service | Responsibility | Port |
|---------|---------------|------|
| `market-service` | Price aggregation, Hydra Price computation, candlestick data, causality engine | 4001 |
| `social-service` | User feeds, guild management, creator subscriptions, copy-trading | 4002 |
| `game-service` | XP tracking, quest engine, avatar progression, league rankings | 4003 |
| `genai-service` | Concept fusion, input-to-card pipeline, proxy print rendering | 4004 |
| `auth-service` | JWT issuance, OAuth (Google/Discord/Apple), Trust Score computation | 4005 |
| `notification-service` | Push notifications, email digests, arbitrage alerts | 4006 |
| `gateway` | API routing, rate limiting, request validation | 4000 |

---

## 4. Installation and Setup

### Prerequisites

- Node.js >= 20.x
- Docker and Docker Compose
- PostgreSQL 16+ (or use the Docker Compose stack)
- Redis 7+
- A TCGPlayer API key (for price data)
- An OpenAI or Stability AI API key (for generative features)

### Quick Start with Docker

```bash
# Clone the repository
git clone https://github.com/organvm-iii-ergon/card-trade-social.git
cd card-trade-social

# Copy the environment template and fill in your API keys
cp .env.example .env
# Edit .env with your TCGPlayer, Stripe, and AI API keys

# Build and start all services
docker compose up --build -d

# Run database migrations
docker compose exec market-service npx prisma migrate deploy
docker compose exec social-service npx prisma migrate deploy
docker compose exec game-service npx prisma migrate deploy

# Seed the card database (initial import from Scryfall/Pokemon TCG API)
docker compose exec market-service npm run seed:cards

# Verify all services are healthy
docker compose ps

# The web client is available at http://localhost:3000
# The API gateway is available at http://localhost:4000
```

### Environment Variables

```bash
# Required
HYDRA_API_KEY_SECRET=        # 32+ char server-side secret for HMAC API-key hashes
HYDRA_AUTH_ISSUER=card-trade-social  # Optional issuer label for issued keys
TCGPLAYER_API_KEY=           # TCGPlayer v2 API bearer token
STRIPE_SECRET_KEY=           # Stripe payment processing
STRIPE_WEBHOOK_SECRET=       # Stripe webhook signature verification
STRIPE_PRICE_PRO_MONTHLY=    # Stripe Price ID for Hydra Pro monthly
STRIPE_PRICE_PRO_YEARLY=     # Stripe Price ID for Hydra Pro yearly
STRIPE_PRICE_PROXY_PRINT_CREDIT=      # Stripe Price ID for proxy print IAP
STRIPE_PRICE_AVATAR_SKIN=             # Stripe Price ID for avatar skin IAP
STRIPE_PRICE_GUILD_BANNER=            # Stripe Price ID for guild banner IAP
LEMON_SQUEEZY_API_KEY=                # Optional Merchant of Record checkout
LEMON_SQUEEZY_WEBHOOK_SECRET=         # Optional webhook signature secret
LEMON_SQUEEZY_STORE_ID=               # Lemon Squeezy store ID
LEMON_SQUEEZY_VARIANT_PRO_MONTHLY=    # Lemon Squeezy Hydra Pro monthly variant
LEMON_SQUEEZY_VARIANT_PRO_YEARLY=     # Lemon Squeezy Hydra Pro yearly variant
DATABASE_URL=                # PostgreSQL connection string
REDIS_URL=                   # Redis connection string

# Optional (feature-gated)
OPENAI_API_KEY=              # GPT-4 for card mechanics generation
STABILITY_API_KEY=           # Stable Diffusion for card art
EBAY_APP_ID=                 # eBay completed listings data
COINBASE_COMMERCE_KEY=       # Crypto payment rail
```

---

## 5. Usage and API

For customer-facing authentication, endpoint contracts, request/response
examples, billing flows, webhook handling, and TypeScript helper usage, see the
[Hydra Customer API and Usage Guide](docs/api-reference.md).

### Key Endpoints

```
GET    /api/v1/cards/:id/price       # Hydra Price + source breakdown
GET    /api/v1/cards/search?q=       # Full-text card search with filters
GET    /api/v1/portfolio/:userId     # Portfolio valuation snapshot
POST   /api/v1/portfolio/holdings    # Add cards to portfolio (with cost basis)
GET    /api/v1/alerts/arbitrage      # Active arbitrage opportunities
WS     /ws/prices                    # Real-time price stream (WebSocket)

POST   /api/v1/trades                # Create a trade proposal
GET    /api/v1/trades                # List trades for the authenticated user
POST   /api/v1/trades/:id/accept     # Accept a pending trade as receiver
POST   /api/v1/trades/:id/reject     # Reject a pending trade as receiver
POST   /api/v1/trades/:id/cancel     # Cancel a pending trade as proposer
POST   /api/v1/trades/:id/counter    # Counter a pending trade as receiver

GET    /api/v1/feed/:userId          # Social activity feed
POST   /api/v1/guilds               # Create a guild
POST   /api/v1/creators/buylist      # Publish a curated buy list
GET    /api/v1/copy-trade/:creatorId # Get copy-trade signals

GET    /api/v1/game/profile          # Avatar, class, XP, streaks
POST   /api/v1/game/quest/complete   # Mark daily quest complete
GET    /api/v1/game/leagues          # Current league standings

POST   /api/v1/genai/fuse            # Concept fusion card generation
POST   /api/v1/genai/input-scan      # Monster Rancher-style input
POST   /api/v1/genai/proxy-print     # Generate print-ready PDF

POST   /api/v1/billing/checkout/pro  # Create Stripe Checkout for Hydra Pro
POST   /api/v1/billing/checkout/iap  # Create Stripe Checkout for one-time purchases
POST   /api/v1/billing/webhook       # Apply Stripe subscription/purchase events
GET    /api/v1/billing/entitlements  # Current tier, limits, and feature gates
```

### Auth and API Keys

All primary HTTP and WebSocket endpoints should be guarded by API-key auth before calling domain handlers. The secret path is `HYDRA_API_KEY_SECRET`, loaded from the process environment or a deployment secret manager. Use a random value with at least 32 characters and never commit it. `HYDRA_AUTH_ISSUER` is optional and defaults to `card-trade-social`.

API keys are displayed once at issuance. Persist only the returned `credential` record; it contains an HMAC-SHA256 hash, key id, user id, scopes, status, and optional expiry.

```typescript
import {
  authorizeEndpoint,
  createAuthConfigFromEnv,
  issueApiKey,
  addAuthenticatedPortfolioCard,
} from 'card-trade-social';

const authConfig = createAuthConfigFromEnv(process.env);

// Operator/admin flow: issue a scoped key and persist only credential.
const { api_key, credential } = await issueApiKey({
  user_id: 'user-123',
  config: authConfig,
  scopes: ['portfolio:read', 'portfolio:write', 'trades:write'],
  name: 'mobile app key',
});
await apiKeyRepository.save(credential);

// Request flow: load credential by key id, authorize endpoint scope, then call
// authenticated domain wrappers to enforce user ownership.
const authorization = await authorizeEndpoint({
  method: 'POST',
  path: '/api/v1/portfolio/holdings',
  headers: request.headers,
  credentials: await apiKeyRepository.allActive(),
  config: authConfig,
});

addAuthenticatedPortfolioCard(
  authorization.auth,
  portfolio,
  card,
  request.body.quantity,
  request.body.purchase_price
);
```

Supported request credentials are `Authorization: Bearer <api_key>`, `Authorization: ApiKey <api_key>`, `X-Hydra-Api-Key`, and `X-Api-Key`. Endpoint scopes are defined in `PRIMARY_ENDPOINT_AUTH_RULES`; implemented portfolio, trade, pricing, and billing operations also expose authenticated wrappers for ownership and actor checks.

### Data Tier Selection

The Market Interface operates on a tiered data model to balance cost, latency, and coverage:

| Tier | Sources | Refresh Rate | Use Case |
|------|---------|-------------|----------|
| Free | TCGPlayer (cached), Scryfall | 15-minute delay | Casual browsing, collection tracking |
| Standard | TCGPlayer (live) + eBay completed | Real-time + 5-min batches | Active trading, portfolio management |
| Professional | All sources + Card Kingdom buylist + LGS aggregation | Real-time streaming | Arbitrage, market making, creator analytics |

### Billing and Feature Gates

Hydra Pro gates advanced portfolio analytics, unlimited cataloging, bulk import, unlimited alerts, premium creator buy lists, copy-trading, and proxy-printing. Free users keep basic portfolio valuation, basic search/filtering, and can catalog up to 100 cards. The TypeScript scaffold exposes entitlement checks plus Stripe and Lemon Squeezy checkout request builders; API routes supply live provider clients and Price/Variant IDs from environment variables.

```typescript
import {
  createProCheckoutSession,
  createInAppPurchaseCheckoutSession,
  createLemonSqueezyProCheckoutSession,
  licenseFromLemonSqueezySnapshot,
  canUsePremiumFeature,
  subscriptionFromStripeSnapshot,
  inAppPurchaseReceiptFromCheckoutSession,
} from 'card-trade-social';

// POST /api/v1/billing/checkout/pro
const checkoutParams = createProCheckoutSession({
  user_id: user.id,
  price_id: process.env.STRIPE_PRICE_PRO_MONTHLY!,
  billing_interval: 'month',
  success_url: 'https://hydra.gg/billing/success',
  cancel_url: 'https://hydra.gg/billing/cancel',
  stripe_customer_id: user.stripe_customer_id,
});
const session = await stripe.checkout.sessions.create(checkoutParams);

// Alternative: POST /api/v1/billing/checkout/pro via Lemon Squeezy
const lemonCheckout = createLemonSqueezyProCheckoutSession({
  user_id: user.id,
  store_id: process.env.LEMON_SQUEEZY_STORE_ID!,
  variant_id: process.env.LEMON_SQUEEZY_VARIANT_PRO_MONTHLY!,
  billing_interval: 'month',
  success_url: 'https://hydra.gg/billing/success',
  customer_email: user.email,
});
const checkout = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
  method: 'POST',
  headers: {
    Accept: 'application/vnd.api+json',
    'Content-Type': 'application/vnd.api+json',
    Authorization: `Bearer ${process.env.LEMON_SQUEEZY_API_KEY!}`,
  },
  body: JSON.stringify(lemonCheckout),
});

// POST /api/v1/billing/checkout/iap
const purchaseParams = createInAppPurchaseCheckoutSession({
  user_id: user.id,
  product_id: 'proxy_print_credit',
  price_id: process.env.STRIPE_PRICE_PROXY_PRINT_CREDIT!,
  quantity: 1,
  success_url: 'https://hydra.gg/purchase/success',
  cancel_url: 'https://hydra.gg/purchase/cancel',
});

// POST /api/v1/billing/webhook
const subscriptionState = subscriptionFromStripeSnapshot(user.id, stripeSubscription, [
  process.env.STRIPE_PRICE_PRO_MONTHLY!,
  process.env.STRIPE_PRICE_PRO_YEARLY!,
]);
const purchaseReceipt = inAppPurchaseReceiptFromCheckoutSession(stripeCheckoutSession);

// POST /api/v1/billing/license/activate or /validate
const licenseState = licenseFromLemonSqueezySnapshot(user.id, lemonLicenseResponse, [
  process.env.LEMON_SQUEEZY_VARIANT_PRO_MONTHLY!,
  process.env.LEMON_SQUEEZY_VARIANT_PRO_YEARLY!,
]);

// Any premium feature can be checked against a subscription or license state.
const gate = canUsePremiumFeature(subscriptionState, 'copy_trading');
```

---

## 6. Working Examples

### Example 1: Detecting an Arbitrage Window

A user holds a playset of "Sheoldred, the Apocalypse" and wants to know if a sell window exists.

```typescript
// 1. Query the Hydra Price endpoint
const response = await fetch('/api/v1/cards/sheoldred-the-apocalypse/price');
const data = await response.json();

// Response:
// {
//   "hydra_price": 72.41,
//   "sources": {
//     "tcgplayer_market": 70.99,
//     "tcgplayer_low": 67.50,
//     "ebay_completed_median": 74.25,
//     "card_kingdom_buylist": 60.00
//   },
//   "arbitrage": {
//     "buy_at": { "source": "tcgplayer", "price": 67.50 },
//     "sell_at": { "source": "ebay", "price": 74.25 },
//     "spread": 6.75,
//     "spread_pct": 10.0,
//     "alert": true
//   },
//   "causality": [
//     {
//       "event": "Pioneer RCQ season announced",
//       "date": "2026-02-10",
//       "impact": "+8.3% over 48h",
//       "confidence": 0.87
//     }
//   ]
// }

// 2. The user sees a 10% spread and the causality engine explains
//    why the price is elevated. They decide to sell into the spike.
```

### Example 2: Creator Publishes a Curated Buy List

A content creator specializing in Modern format wants to monetize their market analysis by publishing a buy list that subscribers can copy-trade.

```typescript
// 1. Creator publishes their weekly buy list
const buyList = await fetch('/api/v1/creators/buylist', {
  method: 'POST',
  headers: { Authorization: `Bearer ${creatorToken}` },
  body: JSON.stringify({
    title: 'Modern Sleepers - Week of Feb 10',
    description: 'Five undervalued Modern staples before Pro Tour.',
    tier: 'premium',  // Only visible to paid subscribers
    cards: [
      { card_id: 'grief-mh2', target_price: 18.00, thesis: 'Unbanned speculation' },
      { card_id: 'subtlety-mh2', target_price: 8.50, thesis: 'Follows Grief trajectory' },
      { card_id: 'murktide-regent-mh2', target_price: 22.00, thesis: 'Underpriced for play rate' }
    ]
  })
});

// 2. A subscriber enables copy-trading
await fetch('/api/v1/copy-trade/enable', {
  method: 'POST',
  body: JSON.stringify({
    creator_id: 'creator-abc123',
    max_budget: 200.00,
    auto_execute: false  // Sends alerts, doesn't auto-buy
  })
});

// 3. Subscriber receives push notifications when the creator
//    publishes, with one-tap "add to cart" for each pick.
```

### Example 3: Generative Card Creation via Concept Fusion

A user wants to create a custom card by fusing the aesthetics of two existing cards.

```typescript
// 1. Submit a fusion request
const fusion = await fetch('/api/v1/genai/fuse', {
  method: 'POST',
  body: JSON.stringify({
    inputs: [
      { type: 'card', id: 'lightning-bolt-m10' },
      { type: 'card', id: 'counterspell-a25' }
    ],
    style: 'retro-frame',
    output: 'full-card'  // Art + name + rules text + flavor
  })
});

// Response:
// {
//   "card_name": "Voltaic Denial",
//   "mana_cost": "{U}{R}",
//   "type_line": "Instant",
//   "rules_text": "Counter target spell. Voltaic Denial deals 2 damage to that spell's controller.",
//   "flavor_text": "The storm answered before the question was asked.",
//   "art_url": "https://cdn.hydra.gg/genai/voltaic-denial-001.png",
//   "proxy_print_url": "/api/v1/genai/proxy-print/voltaic-denial-001"
// }

// 2. User can share to their feed, enter community voting,
//    or order a physical proxy print.
```

---

## 7. Business Model

### Revenue Streams

| Stream | Mechanism | Target Rate |
|--------|-----------|------------|
| Transaction Fees | 1-3% on marketplace transactions facilitated through Hydra | 2% blended average |
| Creator Subscriptions | Platform takes 15% of creator subscription revenue | $4.99-$24.99/mo tiers |
| Premium Features | Professional data tier, advanced charting, unlimited alerts | $9.99/mo or $99/yr |
| Cosmetics and Progression | Avatar skins, guild banners, prestige badges, XP boosts | $0.99-$14.99 per item |
| Proxy Printing | On-demand printing of AI-generated cards and custom proxies | $1.99-$4.99 per card/sheet |
| Data Analytics | B2B API access for LGS owners, market researchers, publishers | $49-$499/mo tiered |

### Unit Economics

| Metric | Assumption |
|--------|-----------|
| CAC (Customer Acquisition Cost) | $8-$12 (content marketing + influencer partnerships) |
| LTV (Lifetime Value, 24-month) | $120-$240 (blended across free and paid tiers) |
| LTV:CAC Ratio | 10-20x |
| Gross Margin (SaaS features) | 78-85% |
| Gross Margin (proxy printing) | 45-55% (physical fulfillment costs) |
| Monthly churn (premium) | Target < 5% |
| Free-to-paid conversion | Target 8-12% |

The business model is designed to generate revenue at every layer of the stack. Free users generate transaction fees and serve as the audience for creator monetization. Paid users generate subscription revenue directly. The generative engine creates a novel revenue stream (proxy printing) that has no direct competitor in the TCG space. The B2B data tier serves local game stores, tournament organizers, and card game publishers who need market intelligence.

---

## 8. Testing and Quality

### Test Approach

| Test Type | Scope | Tool |
|-----------|-------|------|
| Unit Tests | Individual service logic, Hydra Price algorithm, XP calculations | Jest + ts-jest |
| Integration Tests | Service-to-service communication, database operations | Jest + Supertest + Testcontainers |
| E2E Tests | Critical user flows (signup, portfolio add, buy list publish, fusion) | Playwright |
| Load Tests | WebSocket price stream under 10K concurrent connections | k6 |
| Visual Regression | Card rendering, chart components, avatar display | Chromatic |
| Security | OWASP Top 10, payment flow validation, auth bypass | OWASP ZAP + manual review |

### Quality Gates

All pull requests must pass the following before merge:

- All unit and integration tests pass (zero failures)
- Code coverage >= 80% on changed files
- No critical or high-severity security findings
- Lighthouse performance score >= 90 for affected pages
- TypeScript strict mode with zero `any` escapes in new code
- Hydra Price algorithm changes require back-testing against 90 days of historical data with < 2% deviation from actual sale prices
- Generative AI outputs pass content safety filter (no copyrighted art reproduction, no offensive content)

### Trust Score Validation

The Trust Score reputation system -- which governs user privileges like copy-trading eligibility, guild leadership, and creator verification -- has its own dedicated test suite:

- Score computation is deterministic given the same input events
- Score decay over inactivity follows the published formula
- Manipulation vectors (wash trading, self-referral) are covered by adversarial test cases
- Score thresholds for privilege unlocks are tested at boundary values

---

## 9. Cross-References

### Related Repositories in ORGAN III (Commerce)

| Repository | Relationship |
|-----------|-------------|
| [organvm-iii-ergon/public-record-data-scrapper](https://github.com/organvm-iii-ergon/public-record-data-scrapper) | Shared data ingestion patterns; price scraping architecture informs market-service design |
| [organvm-iii-ergon/commerce--meta](https://github.com/organvm-iii-ergon/commerce--meta) | ORGAN III meta-documentation; commerce strategy and revenue model templates |
| [organvm-iii-ergon/commerce--saas-starterpacks](https://github.com/organvm-iii-ergon/commerce--saas-starterpacks) | SaaS boilerplate and shared infrastructure patterns |

### Cross-Organ Dependencies

| Organ | Repository | Dependency |
|-------|-----------|-----------|
| I (Theory) | [organvm-i-theoria/recursive-engine--generative-entity](https://github.com/organvm-i-theoria/recursive-engine--generative-entity) | Recursive identity framework informs Trust Score ontology and avatar evolution mechanics |
| II (Art) | [organvm-ii-poiesis/metasystem-master](https://github.com/organvm-ii-poiesis/metasystem-master) | Generative art pipeline patterns inform the Fusion/Bloom layer |
| IV (Orchestration) | [organvm-iv-taxis/orchestration-start-here](https://github.com/organvm-iv-taxis/orchestration-start-here) | Governance routing for cross-organ promotion decisions |
| V (Public Process) | [organvm-v-logos/public-process](https://github.com/organvm-v-logos/public-process) | Building-in-public essays document Hydra's design rationale and market research |

This repository sits within ORGAN III (Commerce/Ergon), which houses all revenue-generating SaaS products, B2B tools, and B2C consumer applications. ORGAN III draws on theoretical frameworks from ORGAN I and generative pipelines from ORGAN II, but -- per the system's dependency invariant -- ORGAN III never creates upstream dependencies back into those organs. The flow is always I -> II -> III: theory informs art, art informs commerce, never the reverse.

---

## 10. Contributing

Contributions are welcome. This project is in DESIGN_ONLY status, meaning the architecture, business model, and specification are defined but implementation has not yet begun. Current contribution opportunities include:

1. **Architecture review.** Open an issue to challenge or refine the four-layer architecture, service boundaries, or data model.
2. **Market data research.** Identify additional price sources, evaluate API reliability, or propose improvements to the Hydra Price algorithm specification.
3. **Gamification design.** Propose quest types, progression curves, or league formats with supporting rationale.
4. **Generative engine R&D.** Experiment with fine-tuned models for card art generation and share findings.

To contribute:

```bash
# Fork the repository
# Create a feature branch
git checkout -b feature/your-feature-name

# Make your changes
# Write or update tests as appropriate
# Ensure linting passes
npm run lint

# Submit a pull request with a clear description
```

Please read the repository's code of conduct and contributing guidelines before submitting. All pull requests require at least one review before merge.

---

## 11. License and Author

**License:** MIT

**Author:** [@4444j99](https://github.com/4444j99)

This repository is part of the **Eight-Organ System**, a creative-institutional architecture coordinating 81 repositories across 8 GitHub organizations.

### The Eight-Organ System

| Organ | Domain | Organization |
|-------|--------|-------------|
| I | Theory | [organvm-i-theoria](https://github.com/organvm-i-theoria) |
| II | Art | [organvm-ii-poiesis](https://github.com/organvm-ii-poiesis) |
| **III** | **Commerce** | **[organvm-iii-ergon](https://github.com/organvm-iii-ergon)** |
| IV | Orchestration | [organvm-iv-taxis](https://github.com/organvm-iv-taxis) |
| V | Public Process | [organvm-v-logos](https://github.com/organvm-v-logos) |
| VI | Community | [organvm-vi-koinonia](https://github.com/organvm-vi-koinonia) |
| VII | Marketing | [organvm-vii-kerygma](https://github.com/organvm-vii-kerygma) |
| Meta | Governance | [meta-organvm](https://github.com/meta-organvm) |

---

`card-trade-social` -- ORGAN III (Commerce/Ergon) -- DESIGN_ONLY -- MIT License
