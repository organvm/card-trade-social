import re

with open("README.md", "r") as f:
    content = f.read()

# 1. Replace TOC
toc_old = """## Table of Contents

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
11. [License and Author](#11-license-and-author)"""

toc_new = """## Table of Contents

1. [What It Is](#1-what-it-is)
2. [Who Pays](#2-who-pays)
3. [Install](#3-install)
4. [Usage](#4-usage)
5. [Pricing & Monetization](#5-pricing--monetization)
6. [Technical Architecture](#6-technical-architecture)
7. [Testing and Quality](#7-testing-and-quality)
8. [Cross-References](#8-cross-references)
9. [Contributing](#9-contributing)
10. [License and Author](#10-license-and-author)"""

content = content.replace(toc_old, toc_new)

# 2. Rename Business Problem to What It Is
content = content.replace("## 1. Business Problem", "## 1. What It Is")

# 3. Change Who This Serves to Who Pays and Solution Overview
who_serves_old = """### Who This Serves

Hydra targets two overlapping but distinct user segments:

- **Adult investors and collectors (25-45).** These users treat cards as alternative assets. They care about portfolio valuation, price alerts, arbitrage windows, tax-lot tracking, and data-driven buy/sell signals. They are currently underserved by every existing platform.

- **Younger players and emerging collectors (12-20).** These users are drawn to gamification, social features, collection showcases, and creative tools. They want their collection to feel alive -- not like a static spreadsheet. They are the growth engine of the market but have no platform designed for their engagement patterns.

Both segments share a need for accurate pricing, community connection, and a reason to open the app every day. Hydra serves both by layering social and gamification features on top of institutional-grade market data.

---

## 2. Solution Overview"""

who_pays_new = """## 2. Who Pays

Hydra targets several distinct user segments, each with their own willingness to pay based on the value they derive from the platform:

- **Adult Investors and "Whales" (25-45).** These users treat cards as alternative assets. They care about portfolio valuation, real-time price alerts, arbitrage windows, and institutional-grade data. **Why they pay:** They pay for speed and accuracy. Access to the Professional tier (real-time streaming, LGS aggregation, arbitrage alerts) directly translates to profit for them, making a premium subscription an easy ROI.
- **Content Creators and Influencers.** YouTubers, deck builders, and market analysts who drive purchasing decisions. **Why they pay/monetize:** They use the platform to monetize their audience through subscription-gated "Buy Lists" and premium Discord-like guilds. Hydra takes a platform cut (15%) of these transactions.
- **Local Game Stores (LGS) and Market Makers (B2B).** Businesses that need accurate pricing data to buy collections and set store prices. **Why they pay:** They pay for B2B API access and bulk inventory scanning/valuation tools at higher commercial tiers.
- **Younger Players and Emerging Collectors (12-20).** Drawn to gamification, social features, and creative tools. **Why they pay:** While primarily free users, they monetize via microtransactions (avatar cosmetics, guild banners, premium proxy prints of AI-generated cards).

---

### Solution Overview"""
content = content.replace(who_serves_old, who_pays_new)

# 4. Extract Technical Architecture and move it after Pricing & Monetization
tech_arch_start = content.find("## 3. Technical Architecture")
install_start = content.find("## 4. Installation and Setup")

tech_arch_content = content[tech_arch_start:install_start]
content = content[:tech_arch_start] + content[install_start:]

# Change Install
content = content.replace("## 4. Installation and Setup", "## 3. Install")

# Change Usage
content = content.replace("## 5. Usage and API", "## 4. Usage")

# Change Working Examples to a subsection
content = content.replace("## 6. Working Examples", "### Working Examples")

# Change Business Model
business_model_old = "## 7. Business Model\n\n### Revenue Streams"
business_model_new = """## 5. Pricing & Monetization

Hydra operates on a freemium SaaS model combined with transaction fees and digital/physical microtransactions, aligning with our distinct user personas.

### Subscription Tier Model

The core Market Interface and portfolio tools operate on a tiered model to balance cost, latency, and coverage:

| Tier | Price | Sources | Refresh Rate | Use Case |
|------|-------|---------|-------------|----------|
| **Free** | $0 | TCGPlayer (cached), Scryfall | 15-minute delay | Casual browsing, collection tracking, basic social features. |
| **Standard** | $4.99/mo | TCGPlayer (live) + eBay completed | Real-time + 5-min batches | Active trading, portfolio management, advanced charting. |
| **Professional** | $9.99/mo | All sources + Card Kingdom buylist + LGS aggregation | Real-time streaming | Arbitrage alerts, market making, API access, creator analytics. |

### Revenue Streams"""

content = content.replace(business_model_old, business_model_new)

# Remove the old Data Tier Selection from Usage since we moved it to Pricing
data_tier_old = """### Data Tier Selection

The Market Interface operates on a tiered data model to balance cost, latency, and coverage:

| Tier | Sources | Refresh Rate | Use Case |
|------|---------|-------------|----------|
| Free | TCGPlayer (cached), Scryfall | 15-minute delay | Casual browsing, collection tracking |
| Standard | TCGPlayer (live) + eBay completed | Real-time + 5-min batches | Active trading, portfolio management |
| Professional | All sources + Card Kingdom buylist + LGS aggregation | Real-time streaming | Arbitrage, market making, creator analytics |

---

### Working Examples"""
content = content.replace(data_tier_old, "### Working Examples")

# Now insert Technical Architecture before Testing and Quality
test_qual_start = content.find("## 8. Testing and Quality")

# Renumber Technical Architecture to 6
tech_arch_content = tech_arch_content.replace("## 3. Technical Architecture", "## 6. Technical Architecture")

# Insert it
content = content[:test_qual_start] + tech_arch_content + content[test_qual_start:]

# Renumber the rest
content = content.replace("## 8. Testing and Quality", "## 7. Testing and Quality")
content = content.replace("## 9. Cross-References", "## 8. Cross-References")
content = content.replace("## 10. Contributing", "## 9. Contributing")
content = content.replace("## 11. License and Author", "## 10. License and Author")

with open("README.md", "w") as f:
    f.write(content)

print("Rewrite complete.")
