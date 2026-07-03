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

1. [What It Is](#1-what-it-is)
2. [Who Pays](#2-who-pays)
3. [Install](#3-install)
4. [Usage](#4-usage)
5. [Pricing & Monetization](#5-pricing--monetization)
6. [Technical Architecture](#6-technical-architecture)
7. [Testing and Quality](#7-testing-and-quality)
8. [Cross-References](#8-cross-references)
9. [Contributing](#9-contributing)
10. [License and Author](#10-license-and-author)

---

## 1. What It Is

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

## 2. Who Pays

Hydra targets several distinct user segments, each with their own willingness to pay based on the value they derive from the platform:

- **Adult Investors and "Whales" (25-45).** These users treat cards as alternative assets. They care about portfolio valuation, real-time price alerts, arbitrage windows, and institutional-grade data. **Why they pay:** They pay for speed and accuracy. Access to the Professional tier (real-time streaming, LGS aggregation, arbitrage alerts) directly translates to profit for them, making a premium subscription an easy ROI.
- **Content Creators and Influencers.** YouTubers, deck builders, and market analysts who drive purchasing decisions. **Why they pay/monetize:** They use the platform to monetize their audience through subscription-gated "Buy Lists" and premium Discord-like guilds. Hydra takes a platform cut (15%) of these transactions.
- **Local Game Stores (LGS) and Market Makers (B2B).** Businesses that need accurate pricing data to buy collections and set store prices. **Why they pay:** They pay for B2B API access and bulk inventory scanning/valuation tools at higher commercial tiers.
- **Younger Players and Emerging Collectors (12-20).** Drawn to gamification, social features, and creative tools. **Why they pay:** While primarily free users, they monetize via microtransactions (avatar cosmetics, guild banners, premium proxy prints of AI-generated cards).

---

### Solution Overview

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

## 3. Install

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
TCGPLAYER_API_KEY=           # TCGPlayer v2 API bearer token
STRIPE_SECRET_KEY=           # Stripe payment processing
DATABASE_URL=                # PostgreSQL connection string
REDIS_URL=                   # Redis connection string

# Optional (feature-gated)
OPENAI_API_KEY=              # GPT-4 for card mechanics generation
STABILITY_API_KEY=           # Stable Diffusion for card art
EBAY_APP_ID=                 # eBay completed listings data
COINBASE_COMMERCE_KEY=       # Crypto payment rail
```

---

## 4. Usage

### CLI Authentication

The CLI supports generating and verifying API keys for social users. Authentication secrets are stored locally in `~/.card-trade-social/auth.json`.

```bash
# Generate a new API key for a username
card-trade-social issue-key <username>

# Verify an existing API key
card-trade-social verify-key <api-key>
```

### Key Endpoints

```
GET    /api/v1/cards/:id/price       # Hydra Price + source breakdown
GET    /api/v1/cards/search?q=       # Full-text card search with filters
GET    /api/v1/portfolio/:userId     # Portfolio valuation snapshot
POST   /api/v1/portfolio/holdings    # Add cards to portfolio (with cost basis)
GET    /api/v1/alerts/arbitrage      # Active arbitrage opportunities
WS     /ws/prices                    # Real-time price stream (WebSocket)

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
```

### Working Examples

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

## 5. Pricing & Monetization

Hydra operates on a freemium SaaS model combined with transaction fees and digital/physical microtransactions, aligning with our distinct user personas.

### Subscription Tier Model

The core Market Interface and portfolio tools operate on a tiered model to balance cost, latency, and coverage:

| Tier | Price | Sources | Refresh Rate | Use Case |
|------|-------|---------|-------------|----------|
| **Free** | $0 | TCGPlayer (cached), Scryfall | 15-minute delay | Casual browsing, collection tracking, basic social features. |
| **Standard** | $4.99/mo | TCGPlayer (live) + eBay completed | Real-time + 5-min batches | Active trading, portfolio management, advanced charting. |
| **Professional** | $9.99/mo | All sources + Card Kingdom buylist + LGS aggregation | Real-time streaming | Arbitrage alerts, market making, API access, creator analytics. |

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

## 6. Technical Architecture

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

## 7. Testing and Quality

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

## 8. Cross-References

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

## 9. Contributing

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

## 10. License and Author

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
