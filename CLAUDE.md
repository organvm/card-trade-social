# CLAUDE.md — card-trade-social

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

**Hydra TCG Platform** — vertical SaaS treating trading cards (MTG, Pokémon, Yu-Gi-Oh!, Lorcana) as a financial asset class. Combines portfolio tracking, price discovery, creator monetization, and gamification. **Specification + TypeScript stubs only** — no backend or frontend implementation.

## Commands

```bash
npm install
npm run build        # tsc → dist/
npm test             # jest --coverage
npm run lint         # eslint src/ --ext .ts
npm run dev          # tsc --watch
```

## Architecture

Pure TypeScript type library — domain model stubs in `src/`:

- **`card.ts`** — `Card`, `CardVariant`, `CardGame`, `Rarity`, `Condition` types. Cards modeled as financial assets with ticker symbols, variants (foil/etched/borderless/serialized), and market prices.
- **`portfolio.ts`** — Portfolio holdings and unrealized gain tracking types
- **`trade.ts`** — Trade/transaction types for buy/sell/trade flows
- **`pricing.ts`** — Price aggregation types (TCGPlayer, eBay, Card Kingdom signals)

`src/index.ts` re-exports all modules. Tests in `tests/`. Design documents in `docs/` (ADRs, source materials). Detailed specifications: `Theoretical Specifications_ Hydra Platform.md`, `TCG Ecosystem Research and Growth.md`.

<!-- ORGANVM:AUTO:START -->
## System Context (auto-generated — do not edit)

**Organ:** ORGAN-III (Commerce) | **Tier:** standard | **Status:** CANDIDATE
**Org:** `unknown` | **Repo:** `card-trade-social`

### Edges
- **Produces** → `unknown`: unknown
- **Consumes** ← `ORGAN-IV`: unknown

### Siblings in Commerce
`classroom-rpg-aetheria`, `gamified-coach-interface`, `trade-perpetual-future`, `fetch-familiar-friends`, `sovereign-ecosystem--real-estate-luxury`, `public-record-data-scrapper`, `search-local--happy-hour`, `multi-camera--livestream--framework`, `universal-mail--automation`, `mirror-mirror`, `the-invisible-ledger`, `enterprise-plugin`, `virgil-training-overlay`, `tab-bookmark-manager`, `a-i-chat--exporter` ... and 11 more

### Governance
- Strictly unidirectional flow: I→II→III. No dependencies on Theory (I).

*Last synced: 2026-02-24T12:41:28Z*
<!-- ORGANVM:AUTO:END -->
