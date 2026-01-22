# Transfer Hub - Product Requirements Document

**Version:** 1.0
**Last Updated:** January 16, 2025
**Document Owner:** Product Lead
**Status:** Draft

---

## Table of Contents

 1. [Executive Summary](https://claude.ai/chat/a78e79d5-eb97-41dd-b13f-9efe4c72b9f3#1-executive-summary)
 2. [Problem Statement](https://claude.ai/chat/a78e79d5-eb97-41dd-b13f-9efe4c72b9f3#2-problem-statement)
 3. [Goals & Success Metrics](https://claude.ai/chat/a78e79d5-eb97-41dd-b13f-9efe4c72b9f3#3-goals--success-metrics)
 4. [User Personas](https://claude.ai/chat/a78e79d5-eb97-41dd-b13f-9efe4c72b9f3#4-user-personas)
 5. [Product Strategy & Timeline](https://claude.ai/chat/a78e79d5-eb97-41dd-b13f-9efe4c72b9f3#5-product-strategy--timeline)
 6. [Feature Specifications](https://claude.ai/chat/a78e79d5-eb97-41dd-b13f-9efe4c72b9f3#6-feature-specifications)
 7. [Technical Architecture](https://claude.ai/chat/a78e79d5-eb97-41dd-b13f-9efe4c72b9f3#7-technical-architecture)
 8. [Database Schema](https://claude.ai/chat/a78e79d5-eb97-41dd-b13f-9efe4c72b9f3#8-database-schema)
 9. [API Integration](https://claude.ai/chat/a78e79d5-eb97-41dd-b13f-9efe4c72b9f3#9-api-integration)
10. [Out of Scope](https://claude.ai/chat/a78e79d5-eb97-41dd-b13f-9efe4c72b9f3#10-out-of-scope)
11. [Future Roadmap](https://claude.ai/chat/a78e79d5-eb97-41dd-b13f-9efe4c72b9f3#11-future-roadmap)
12. [Implementation Plan](https://claude.ai/chat/a78e79d5-eb97-41dd-b13f-9efe4c72b9f3#12-implementation-plan)
13. [Open Questions](https://claude.ai/chat/a78e79d5-eb97-41dd-b13f-9efe4c72b9f3#13-open-questions)

---

## 1\. Executive Summary

### Product Vision

Create the definitive, focused platform for football fans to track and analyze all player transfers during transfer windows. Unlike existing sites that have evolved into general news platforms, Transfer Hub will remain laser-focused on transfers only.

### Product Name

**Transfer Hub** (working title)

### Target Users

* Football enthusiasts who want comprehensive transfer tracking
* Fantasy football players needing up-to-date squad information
* Sports journalists researching transfer activity
* Club analysts monitoring market movements
* Casual fans wanting to stay informed during transfer windows

### Core Value Proposition

A clean, focused, one-stop platform that aggregates all transfer activity during windows, providing both breadth (comprehensive coverage) and depth (detailed analytics) without the noise of general football news.

### Project Type

Personal passion project, self-funded, optimized for long-term sustainability and future social features.

---

## 2\. Problem Statement

### Current Pain Points

During bi-annual transfer windows (January and May-September), football fans face:

1. **Information Fragmentation**
   * Transfer news scattered across team websites, news outlets, social media, and aggregators
   * No single source for comprehensive transfer tracking
   * Must visit multiple sites to get complete picture
2. **Signal vs Noise**
   * Major platforms (ESPN, Transfermarkt) have become general news sites
   * Transfer information buried among match reports, analysis, rumors
   * Difficult to focus purely on confirmed transfer activity
3. **Lack of Analytics**
   * Hard to understand overall market trends
   * No easy way to compare transfer activity across leagues or teams
   * Missing aggregate views and insights
4. **Time Consumption**
   * Manually tracking multiple sources is exhausting
   * Especially challenging during deadline day chaos
   * No efficient way to filter by personal interests (league, team, position)

### User Quote (Hypothetical)

> "I just want to see who's going where without wading through endless opinion pieces and match previews. Give me the transfers and nothing else."

---

## 3\. Goals & Success Metrics

### Primary Goals

1. **Comprehensive Coverage**: Track all significant transfers across major leagues during transfer windows
2. **Focus & Clarity**: Provide transfer data without editorial noise or distraction
3. **Accessibility**: Fast, mobile-first experience that works anywhere
4. **Sustainability**: Build architecture that's maintainable long-term with minimal costs

### Success Metrics

#### Soft Launch (Feb 2025 - End of Window)

* Successfully integrate API-Football API
* Display real-time transfer data with <2 hour lag
* Zero critical bugs during deadline day
* Gather feedback from 10-20 beta users
* Technical validation of data pipeline

#### Full MVP (Summer 2025 Window)

* **Acquisition**: 1,000+ unique visitors during window
* **Engagement**:
  * Average session duration > 3 minutes
  * 30%+ returning user rate
  * 5+ page views per session
* **Performance**:
  * Page load time < 2 seconds
  * Mobile performance score > 90 (Lighthouse)
  * 99%+ uptime during window
* **Data Quality**:
  * Data freshness: updates within 2 hours of real transfers
  * <1% error rate in transfer data

#### Long-term (Post-Summer 2025)

* Build email list for window notifications
* Community engagement via social features
* Establish as go-to focused transfer platform

---

## 4\. User Personas

### Persona 1: The Dedicated Fan

**Name:** Sarah, 28, Marketing Manager
**Behavior:**

* Follows Liverpool religiously
* Checks transfer news 3-5 times daily during windows
* Wants to know every move Liverpool makes
* Interested in how Liverpool compares to rivals (Man City, Arsenal)
* Active on Reddit's r/LiverpoolFC

**Needs:**

* Quick view of Liverpool's ins and outs
* Net spend vs rivals
* Position-specific transfer activity
* Mobile access during commute

**Quote:** "I need to know if we're actually signing a left-back or if it's just rumors again."

---

### Persona 2: The League Follower

**Name:** Marcus, 35, Software Engineer
**Behavior:**

* Follows entire Premier League
* Plays fantasy football seriously
* Wants to understand league-wide trends
* Enjoys comparing clubs' transfer strategies
* Data-driven decision maker

**Needs:**

* League-wide transfer overview
* Filter by position for fantasy planning
* Transfer value comparisons
* Export data for analysis

**Quote:** "Show me all the strikers moving in the Premier League so I can plan my fantasy team."

---

### Persona 3: The Transfer Junkie

**Name:** Alex, 24, Student
**Behavior:**

* Obsessed with entire global transfer market
* Follows Fabrizio Romano religiously
* Wants to know every major transfer globally
* Active on Twitter during deadline day
* Loves transfer "drama" and big signings

**Needs:**

* Real-time updates on all leagues
* Top transfers by value
* Latest breaking news
* Deadline day countdown and activity feed

**Quote:** "I want to see every major transfer happening worldwide in one place, especially on deadline day."

---

## 5\. Product Strategy & Timeline

### Launch Strategy

Given the current date (January 16, 2025) and next window closing (February 2, 2025), we'll execute a two-phase approach:

#### Phase 1: Soft Launch (Late January 2025)

**Target:** February 2, 2025 deadline day
**Scope:** Minimal viable product for technical validation
**Audience:** Private beta (friends, small community)
**Goal:** Validate data pipeline and gather feedback

**Why Soft Launch?**

* Only \~17 days until window closes
* Not enough time for full MVP + marketing
* Treats deadline day as stress test
* Provides real-world learning before summer

#### Phase 2: Full MVP Launch (Spring 2025)

**Target:** Early May 2025 (2-3 weeks before summer window opens)
**Scope:** Complete MVP feature set
**Audience:** Public launch with marketing campaign
**Goal:** Establish Transfer Hub as the focused transfer platform

**Why May Launch?**

* 3.5 months of focused development time
* Summer window is busier than winter (more users)
* Time to build properly, test thoroughly
* Can generate buzz before window opens

### Transfer Window Calendar

* **Current Window:** Open now, closes February 2, 2025
* **Summer Window:** Typically May 1 - September 1, 2025 (varies by league)
* **Next Winter Window:** January 2026

---

## 6\. Feature Specifications

### 6.1 Soft Launch Features (February 2025)

**Absolute Minimum for Deadline Day:**

#### 6.1.1 Simplified Dashboard (Core)

**Priority:** P0 (Must Have)

**Description:** Streamlined version of main dashboard with essential metrics only.

**KPI Cards (4 cards only):**

1. Today's Transfers (with % vs average)
2. Window Total (with context label)
3. Total Spend (with record indicator)
4. Most Active Team (with logo)

**Single Visualization:**

* Daily Activity line chart only
* Shows transfer trend over past 7 days
* Purple gradient styling

**No complex charts** - skip:

* Transfers by League chart
* Top Teams Volume chart
* These will be added in full MVP

**Reasoning:** Focus development time on data pipeline and transfer table. Dashboard analytics are "nice to have" for soft launch but not critical for deadline day validation.

---

#### 6.1.2 Basic Transfer Table (Core)

**Priority:** P0 (Must Have)

**Description:** Simplified version of main transfer table with basic functionality.

**Section:** "ALL MARKET TRANSFERS"

**Columns (5 only):**

1. PLAYER (photo + name + nationality)
2. FROM (club logo + name)
3. TO (club logo + name)
4. FEE (amount or "FREE")
5. STATUS ("DONE" badge only - no rumours)

**Basic Functionality:**

* Search by player name only
* Single-column sorting (click header)
* Show confirmed transfers only (no RUMOURS tab)
* 25 records per page
* "LOAD MORE" button
* Mobile-responsive (cards on mobile)
* Manual refresh button

**No advanced features** - skip for soft launch:

* Multi-select filters
* Date range picker
* Export to CSV
* Multi-column sorting
* Advanced filter panel

**User Stories:**

* As a user, I want to see recent confirmed transfers
* As a user, I want to search for a specific player
* As a user, I want to see transfer details clearly on mobile

---

#### 6.1.3 Sidebar - Top Transfers Only

**Priority:** P0 (Must Have)

**Description:** Simplified sidebar showing only top transfers (no tabs).

**Content:**

* "TOP TRANSFERS" header
* Numbered list (01-05)
* Each showing:
  * Player name
  * From → To teams
  * Transfer fee

**Example:**

```
01  ERLING HAALAND
    MAN CITY → R. MADRID        €180M

02  JUDE BELLINGHAM  
    BVB → R. MADRID             €103M
```

**No additional tabs** - skip for soft launch:

* Latest Deals tab
* Insider Feed tab
* These will be added in full MVP

---

#### 6.1.4 Basic Data Pipeline (Updated)

**Priority:** P0 (Must Have)

**Context + Constraint:**

* The original plan depended on API-Football for real-time transfer ingestion. During the Jan 2026 window the free-tier endpoint stopped returning current deals (data lagged ~2 weeks), which failed the “<2 hour lag” KPI.
* API-Football is still used for league + club metadata (stable historic data), but can no longer be trusted for transfers.

**Pivot – Transfermarkt Scraping:**

* Scrape https://www.transfermarkt.com/transfers/neuestetransfers/statistik/plus/… with cheerio.
* Use the “Top 10 leagues” filter to expose the full window history (Jan 02 onward) and paginate 10 pages (25 rows each) → 250 confirmed moves.
* Output normalized CSV to `Temp_Ref/latest-transfers-top10-pages-1-to-10.csv` (ENV `TRANSFERMARKT_TOP10=true`, `TRANSFERMARKT_PAGE_COUNT=10`).
* `TRANSFER_CSV_PATH` env allows swapping the dataset (e.g., daily snapshots or future filters).

**Requirements (new pipeline):**

* Scraper cron every 8 hours (e.g., 02:00 / 10:00 / 18:00 UTC). Manual run available for deadline-day spikes.
* Parse CSV via `scripts/seed.ts` (Papaparse) and upsert into Supabase:
  * Split player names, map nationalities → ISO2 (i18n-iso-countries), infer windows (winter/summer).
  * Resolve or auto-create clubs/leagues by name + country before inserting transfers.
  * Store fee text + derived `transfer_value_usd` (cents) and mark everything as `status = 'done'` since Transfermarkt only lists confirmed deals.
* Error logging + cache to avoid duplicate club creations during a run.

**Monitoring:**

* Log scrape + seed counts per run; emit warnings for rows skipped due to incomplete data (bad dates, missing clubs, etc.).
* Manual validation checklist each morning (compare random sample vs Transfermarkt UI).

---

### 6.2 Full MVP Features (Summer 2025)

All soft launch features PLUS the enhancements below:

#### 6.2.1 Dashboard Overview

**Priority:** P0 (Must Have)

**Description:** Landing page with key metrics and visualizations in a dark, modern gaming-style interface.

**Header:**

* Product name: "TRANSFER HUB V2" with italic gaming-style font
* Live status indicator: "🟢 LIVE MARKET UPDATE"
* Search bar: Global search across all transfers
* Account button (top right)

**KPI Cards (4 cards in horizontal row):**

1. **Today's Transfers**
   * Large number display (e.g., "42")
   * Comparison metric: "+12% vs avg" in green
2. **Window Total**
   * Large number display (e.g., "1,284")
   * Context label: "MID-SEASON" in purple/blue
3. **Total Spend**
   * Large currency display (e.g., "€3.42B")
   * Badge: "RECORD HIGH" in green
4. **Most Active Team**
   * Team logo/crest
   * Team name in italics (e.g., "REAL MADRID")

**Main Content Grid (2x2 layout):**

1. **Transfers by League** (top left)
   * Bar chart visualization
   * X-axis: League codes (EPL, LaL, SER, BUN, L1)
   * Y-axis: Transfer count
   * Monochrome bars with hover state
   * Toggle/filter icon in header
2. **Top Teams Volume** (top right)
   * Horizontal bar chart
   * Shows IN/OUT split for each team
   * Teams listed: Chelsea FC (24), Paris SG (19), Newcastle (15), RB Leipzig (12)
   * Color-coded bars (green for incoming, purple for outgoing)
3. **Daily Activity** (bottom left)
   * Line chart showing transfer activity over time
   * Smooth curve visualization
   * Purple/blue gradient
   * X-axis: Days (MON, WED, FRI, SUN)
   * Animated/interactive
4. **Sidebar Panel** (right side)
   * Tabbed interface with three sections:
     * "TOP TRANSFERS" (active)
     * "LATEST DEALS"
     * "INSIDER FEED"

   **Top Transfers Tab:**
   * Numbered list (01, 02, 03, 04)
   * Each item shows:
     * Player name in bold
     * From team → To team
     * Transfer fee (right-aligned)
   * Example entries:
     * "ERLING HAALAND - MAN CITY → FL MADRID - €180M"
     * "JUDE BELLINGHAM - BVB → R. MADRID - €103M"
     * "DECLAN RICE - WEST HAM → ARSENAL - €116M"
     * "MOISES CAICEDO - BRI → CHELSEA - €115M"

   **Market Insider Section (below tabs):**
   * RSS/feed icon
   * Social media embed (@TransferHubInsider)
   * Latest tweet/update preview
   * Example: "EXCLUSIVE: Medical scheduled for tonight. Agreement total €65m + €10m add-ons. ✅ Here we go!"

**All Market Transfers Section (bottom):**

* Full-width table below dashboard
* Header: "ALL MARKET TRANSFERS"
* Filter buttons: "ALL" (active), "CONFIRMED", "RUMOURS"
* Download and filter icons
* Search: "Filter by player, team, nationality..."
* Columns: PLAYER, FROM, TO, FEE, STATUS
* Sample rows showing player photos, team crests, transfer details
* "LOAD MORE RECORDS" button at bottom
* Status badges: "DONE" (green), "PENDING" (purple)

**Design System:**

* Dark background (#0a0a0f or similar)
* Neon accent colors: Green (#00ff88), Purple (#8b5cf6), Blue (#3b82f6)
* Italic/slanted headers for emphasis
* Glassmorphism cards with subtle borders
* High contrast text
* Gaming/esports aesthetic
* Smooth animations and transitions

**Layout:**

* Header (full width)
* KPI cards (horizontal row, 4 cards)
* Main grid (2 columns on desktop, stacked on mobile)
* Sidebar always visible on desktop, collapsible on mobile
* Full-width transfers table at bottom
* Responsive, mobile-first design

**User Stories:**

* As a user, I want to see at-a-glance how active the market is today
* As a user, I want to understand which teams are most active with ins/outs
* As a user, I want to see transfer trends over the past week
* As a user, I want quick access to the biggest transfers
* As a user, I want insider news updates without leaving the dashboard

---

#### 6.2.2 Enhanced Transfer Table

**Priority:** P0 (Must Have)

**Description:** Comprehensive table integrated into the main dashboard, below the analytics section.

**Section Header:**

* Title: "ALL MARKET TRANSFERS" in bold italic
* Filter/sort icon (funnel)
* Download icon (for CSV export)

**Filter Bar:**

* Search input: "Filter by player, team, nationality..."
* Tab buttons: "ALL" (default/active), "CONFIRMED", "RUMOURS"
* Filters apply in real-time

**Table Columns:**

1. **PLAYER**
   * Player headshot (circular)
   * Full name
   * Nationality flag + Position (e.g., "FRANCE - FW")
2. **FROM**
   * Club crest/logo
   * Club name
3. **TO**
   * Club crest/logo
   * Club name
4. **FEE**
   * Transfer amount (e.g., "€110.0M", "FREE")
   * Currency in Euros by default
5. **STATUS**
   * Badge indicator:
     * "DONE" (green background)
     * "PENDING" (purple background)
     * "RUMOUR" (gray/yellow background - if showing unconfirmed)
   * Clickable for more details

**Row Design:**

* Dark background with hover state
* Subtle borders between rows
* Player photo on left
* Team logos with dark mode styling
* Right arrow (›) at end of row for details
* Expandable rows (optional) for additional info

**Table Features:**

* Infinite scroll or "LOAD MORE RECORDS" button
* Sorting: Click column headers to sort
* Hover effects on rows
* Click row to see detailed transfer view (modal or dedicated page)
* Empty state: "No transfers found" with filters active

**Pagination:**

* Load 25 records initially
* "LOAD MORE RECORDS" button at bottom (styled as ghost button)
* Shows total count: "Showing 25 of 1,284 transfers"

**Advanced Filtering (Slide-out Panel):** Triggered by filter icon, shows:

* League (multi-select dropdown with crests)
* Position (multi-select: GK, DEF, MID, FWD)
* Transfer type (Loan/Permanent/Free)
* Age range (slider: 16-40)
* Transfer value range (slider with presets: €0-200M)
* Nationality (dropdown with flags)
* Date range picker
* "CLEAR ALL" and "APPLY FILTERS" buttons

**Mobile Behavior:**

*   **KPI Cards**: Displayed in a horizontal scrollable carousel (100px height).
*   **Charts**: Displayed in a horizontal scrollable carousel with fixed height (400px).
*   **Widget Order**: 
    1. KPI Carousel
    2. Chart Carousel
    3. Top Transfers (Sidebar widget)
    4. All Market Transfers (Card list view)
*   **Table**: Becomes card-based list
*   Each card shows:
  * Player photo + name
  * From → To (with arrows and crests)
  * Fee + Status badge
  * Tap to expand for full details

**Performance:**

* Virtualized scrolling for large datasets
* Debounced search (300ms)
* Skeleton loading states
* Optimistic UI updates

**User Stories:**

* As a league follower, I want to filter transfers by specific leagues
* As a fantasy player, I want to see all forwards that transferred
* As an analyst, I want to export filtered data
* As a user, I want to quickly find a specific player's transfer
* As a mobile user, I want an easy-to-scan card interface

---

#### 6.2.3 Team Pages

**Priority:** P1 (Should Have)

**Description:** Dedicated page for each team showing transfer activity.

**URL Structure:** `/teams/[team-id]` or `/teams/[team-slug]`

**Content:**

* Team header (logo, name, league)
* **Incoming Transfers** section (table)
* **Outgoing Transfers** section (table)
* **Net Spend** calculation (Total In - Total Out)
* Summary stats:
  * Total transfers (in + out)
  * Total spent
  * Total earned
  * Net spend
  * Positions strengthened/weakened

**Functionality:**

* Link from main transfer table (click team name)
* Shareable URL for each team
* Mobile-optimized layout

**User Stories:**

* As a dedicated fan, I want to see all my team's transfer activity in one place
* As a user, I want to compare my team's spending to rivals
* As a user, I want to share my team's transfer page with friends

---

#### 6.2.4 Insider Feed (Sidebar Tab)

**Priority:** P1 (Should Have)

**Description:** Social media feed integrated into the sidebar as one of three tabs.

**Location:** Right sidebar, tabbed interface

**Three Tabs:**

1. **TOP TRANSFERS** (default active)
   * Top 5 by transfer value
   * Numbered list format
   * Player name, transfer route, fee
2. **LATEST DEALS**
   * 5 most recent confirmed transfers
   * Same format as Top Transfers
   * Real-time updates
3. **INSIDER FEED** (new)
   * "MARKET INSIDER" header with RSS icon
   * Social media handle: @TransferHubInsider (or similar)
   * Latest 3-5 tweets/posts from key journalists
   * Display format:
     * Profile image
     * Tweet text
     * Timestamp
     * Engagement metrics (optional)
   * Auto-refresh every 15-30 minutes
   * "View more on Twitter/X" link at bottom

**Primary Sources:**

* Fabrizio Romano (@FabrizioRomano)
* David Ornstein (@David_Ornstein)
* Others as needed

**Content Examples:**

* "EXCLUSIVE: Medical scheduled for tonight. Agreement total €65m + €10m add-ons. ✅ Here we go!"
* "🚨 BREAKING: Manchester United reach agreement with Bayern Munich for Harry Kane..."

**Implementation:**

* Twitter/X embed widget or API
* Fallback to manual curated updates if API unavailable
* Filter for transfer-relevant posts only
* Mobile: Collapsible drawer or separate page

**User Stories:**

* As a transfer junkie, I want breaking news from reliable insiders
* As a user, I want to see transfer rumors alongside confirmed deals
* As a user, I want to toggle between different types of transfer information

---

#### 6.2.5 Enhanced Data Pipeline

**Priority:** P0 (Must Have)

**Normal Operation:**

* Scheduled pulls: 4x daily (6am, 12pm, 6pm, 12am)
* Data validation and error handling
* Duplicate detection and merging
* Historical data preservation

**Deadline Day Mode:**

* Increased frequency: every 30 minutes
* Manual trigger capability
* Real-time monitoring dashboard
* Alert system for failed pulls

**Data Quality:**

* Validate required fields
* Normalize team names (handle variations)
* Standardize player names
* Currency conversion (if needed)
* Handle "undisclosed" fees gracefully

---

### 6.3 Feature Priority Matrix

| Feature | Soft Launch | Full MVP | Post-MVP |
| -- | -- | -- | -- |
| Transfer Table (Basic) | ✅ P0 | ✅ P0 | ✅ |
| Featured Widget | ✅ P0 | ✅ P0 | ✅ |
| Data Pipeline | ✅ P0 | ✅ P0 | ✅ |
| Dashboard Overview | ❌ | ✅ P0 | ✅ |
| Advanced Filters | ❌ | ✅ P0 | ✅ |
| Team Pages | ❌ | ✅ P1 | ✅ |
| Insider Feed | ❌ | ✅ P1 | ✅ |
| User Accounts | ❌ | ❌ | ✅ P0 |
| Wishlist Feature | ❌ | ❌ | ✅ P0 |
| Predictions/Betting | ❌ | ❌ | ✅ P1 |
| Push Notifications | ❌ | ❌ | ✅ P1 |
| Historical Windows | ❌ | ❌ | ✅ P2 |

---

## 7\. Technical Architecture

### 7.1 Technology Stack

#### Frontend

* **Framework:** Next.js 14+ (App Router)
  * React 18+
  * Server Components for performance
  * Built-in API routes
  * File-based routing
  * Image optimization
* **Styling:** Tailwind CSS
  * Utility-first CSS
  * Mobile-first approach
  * Custom design system
  * Dark mode support (future)
* **UI Components:** shadcn/ui
  * Accessible components
  * Customizable with Tailwind
  * Radix UI primitives
  * Minimal bundle size
* **Data Fetching:** TanStack Query (React Query)
  * Automatic caching
  * Background refetching
  * Optimistic updates
  * Devtools for debugging
* **Forms & Validation:** React Hook Form + Zod
  * Type-safe validation
  * Minimal re-renders
  * Great DX
* **Charts:** Recharts
  * React-based charting
  * Responsive by default
  * Good documentation

#### Backend & Database

* **Database:** Supabase (PostgreSQL)
  * Generous free tier
  * Built-in Auth (for future features)
  * Real-time subscriptions
  * Row-level security
  * RESTful API auto-generated
  * Dashboard for data management
* **API Layer:** Next.js API Routes
  * Serverless functions
  * Same deployment as frontend
  * TypeScript support
  * Edge runtime capable
* **Caching:**
  * React Query (client-side)
  * Next.js built-in caching
  * Supabase connection pooling

#### Deployment & Hosting

* **Frontend Hosting:** Vercel
  * Free tier for personal projects
  * Automatic deployments from Git
  * Edge network (global CDN)
  * Preview deployments
  * Analytics included
* **Database:** Supabase Cloud
  * Free tier: 500MB database, 2GB bandwidth
  * Automatic backups
  * Connection pooling
* **Scheduled Jobs:** Vercel Cron Jobs
  * Free for personal projects
  * Trigger API routes on schedule
  * Perfect for data syncs

#### Development Tools

* **Version Control:** Git + GitHub
* **Package Manager:** pnpm (faster than npm)
* **TypeScript:** Full type safety
* **Linting:** ESLint + Prettier
* **Testing:** Vitest + React Testing Library (future)

### 7.2 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         User Browser                         │
│                     (Next.js Frontend)                       │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Vercel Edge Network                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Static     │  │  API Routes  │  │  Cron Jobs   │      │
│  │   Assets     │  │  (Serverless)│  │  (Scheduled) │      │
│  └──────────────┘  └──────┬───────┘  └──────┬───────┘      │
└────────────────────────────┼──────────────────┼─────────────┘
                             │                  │
                             ▼                  ▼
                    ┌─────────────────────────────────┐
                    │      Supabase Database          │
                    │       (PostgreSQL)              │
                    │  ┌──────────────────────────┐  │
                    │  │  Tables:                 │  │
                    │  │  - transfers             │  │
                    │  │  - clubs                 │  │
                    │  │  - leagues               │  │
                    │  │  - players (future)      │  │
                    │  └──────────────────────────┘  │
                    └─────────────────────────────────┘
                                   ▲
                                   │
                                   │ (Cron triggers)
                    ┌──────────────┴──────────────┐
                    │   Data Sync Pipeline        │
                    │  ┌──────────────────────┐   │
                    │  │ 1. Fetch from API    │   │
                    │  │ 2. Validate & Parse  │   │
                    │  │ 3. Normalize Data    │   │
                    │  │ 4. Upsert to DB      │   │
                    │  └──────────────────────┘   │
                    └──────────────┬──────────────┘
                                   │
                                   ▼
                    ┌─────────────────────────────┐
                    │   API-Football.com          │
                    │   External API              │
                    └─────────────────────────────┘
```

### 7.3 Data Flow

#### Transfer Data Sync Flow

1. **Trigger:** Vercel Cron job fires (scheduled)
2. **Fetch:** API route calls API-Football `/transfers` endpoint
3. **Validate:** Check required fields, handle errors
4. **Transform:** Normalize team names, player names, values
5. **Enrich:** Fetch club/league data if missing
6. **Upsert:** Insert new transfers, update existing (by unique ID)
7. **Log:** Record sync status, errors, stats
8. **Notify:** (Future) Send notifications for new transfers

#### User Request Flow

1. **Request:** User visits page or filters data
2. **Server Component:** Next.js fetches initial data server-side
3. **Client Hydration:** React Query manages client-side state
4. **Cache Check:** Return cached data if fresh
5. **Background Refetch:** Update in background if stale
6. **UI Update:** Optimistic updates for instant feedback

### 7.4 Performance Considerations

**Frontend:**

* Server Components for initial page load
* Image optimization (Next.js Image component)
* Code splitting (automatic with Next.js)
* Lazy loading for charts and heavy components
* Virtualized lists for large datasets (react-window)
* Debounced search inputs
* Smooth animations with CSS transforms
* GPU-accelerated animations where possible

**Backend:**

* Database indexes on frequently queried columns
* Supabase connection pooling
* API route caching headers
* Pagination for large result sets
* Batch database operations

**Design Performance:**

* Glassmorphism effects optimized for performance
* Backdrop filters used sparingly
* CSS animations over JavaScript where possible
* Skeleton loading states for all data-fetching
* Progressive image loading for player photos
* Preload critical team logos and crests

**Target Metrics:**

* First Contentful Paint (FCP): < 1.5s
* Largest Contentful Paint (LCP): < 2.5s
* Time to Interactive (TTI): < 3.5s
* Lighthouse Performance Score: > 90
* Smooth 60fps animations

**Dark Theme Optimization:**

* Reduced brightness to minimize eye strain
* High contrast ratios for accessibility (WCAG AA minimum)
* Neon accents used sparingly to avoid visual fatigue
* Proper color choices for colorblind users

### 7.5 Security Considerations

**API Keys:**

* Store API-Football key in Vercel environment variables
* Never expose in client-side code
* Rotate keys periodically

**Database:**

* Use Supabase Row Level Security (RLS)
* API routes as middleware (don't expose DB directly)
* Prepared statements (SQL injection prevention)

**User Data (Future):**

* Hash passwords (Supabase Auth handles this)
* HTTPS only
* CORS configuration
* Rate limiting on API routes

---

## 8\. Database Schema

### 8.1 Core Tables

#### `transfers` Table

Primary table storing all transfer records.

```
CREATE TABLE transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Player Information
  player_id INTEGER, -- API-Football player ID
  player_first_name TEXT NOT NULL,
  player_last_name TEXT NOT NULL,
  player_full_name TEXT, -- For search
  age INTEGER,
  position TEXT, -- 'Goalkeeper', 'Defender', 'Midfielder', 'Attacker'
  nationality TEXT, -- ISO country code (e.g., 'ENG', 'BRA')
  
  -- Club Information
  from_club_id UUID REFERENCES clubs(id),
  to_club_id UUID REFERENCES clubs(id),
  from_club_name TEXT, -- Denormalized for easier querying
  to_club_name TEXT,
  
  -- League Information
  league_id UUID REFERENCES leagues(id),
  league_name TEXT, -- Denormalized
  
  -- Transfer Details
  transfer_type TEXT CHECK (transfer_type IN ('Loan', 'Permanent', 'Free Transfer', 'N/A')),
  transfer_value_usd BIGINT, -- In cents to avoid floating point
  transfer_value_display TEXT, -- "€50M", "Free", "Undisclosed"
  transfer_date DATE NOT NULL,
  
  -- Transfer Window
  window TEXT, -- '2025-winter', '2025-summer'
  
  -- Metadata
  api_transfer_id INTEGER UNIQUE, -- API-Football transfer ID
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes
  INDEX idx_transfer_date (transfer_date DESC),
  INDEX idx_player_name (player_last_name, player_first_name),
  INDEX idx_league (league_id),
  INDEX idx_clubs (from_club_id, to_club_id),
  INDEX idx_window (window),
  INDEX idx_api_id (api_transfer_id)
);
```

#### `clubs` Table

Master table for football clubs.

```
CREATE TABLE clubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic Info
  api_club_id INTEGER UNIQUE, -- API-Football club ID
  name TEXT NOT NULL,
  short_name TEXT, -- "Man City" vs "Manchester City"
  code TEXT, -- "MCI"
  
  -- Location
  country TEXT, -- ISO code
  city TEXT,
  
  -- League
  league_id UUID REFERENCES leagues(id),
  
  -- Assets
  logo_url TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes
  INDEX idx_club_name (name),
  INDEX idx_api_club_id (api_club_id)
);
```

#### `leagues` Table

Master table for football leagues.

```
CREATE TABLE leagues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic Info
  api_league_id INTEGER UNIQUE, -- API-Football league ID
  name TEXT NOT NULL,
  country TEXT, -- ISO code
  
  -- Classification
  tier INTEGER, -- 1 for top leagues (Premier League, La Liga, etc.)
  type TEXT, -- 'League', 'Cup'
  
  -- Assets
  logo_url TEXT,
  flag_url TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes
  INDEX idx_league_tier (tier),
  INDEX idx_api_league_id (api_league_id)
);
```

### 8.2 Future Tables (Post-MVP)

#### `users` Table

User accounts for social features.

```
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Auth (handled by Supabase Auth)
  auth_id UUID UNIQUE REFERENCES auth.users(id),
  
  -- Profile
  username TEXT UNIQUE,
  email TEXT UNIQUE,
  avatar_url TEXT,
  
  -- Preferences
  favorite_club_id UUID REFERENCES clubs(id),
  favorite_leagues UUID[], -- Array of league IDs
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active TIMESTAMP WITH TIME ZONE
);
```

#### `wishlists` Table

User wishlist for desired transfers.

```
CREATE TABLE wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Wish Details
  player_name TEXT NOT NULL,
  to_club_id UUID REFERENCES clubs(id),
  position TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(user_id, player_name, to_club_id)
);
```

#### `predictions` Table

User predictions for transfer outcomes.

```
CREATE TABLE predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Prediction Details
  player_name TEXT NOT NULL,
  predicted_club_id UUID REFERENCES clubs(id),
  confidence INTEGER CHECK (confidence BETWEEN 1 AND 100),
  
  -- Outcome
  actual_transfer_id UUID REFERENCES transfers(id),
  was_correct BOOLEAN,
  points_earned INTEGER,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);
```

### 8.3 Database Views

#### `transfer_summary` View

Aggregated stats for dashboard.

```
CREATE VIEW transfer_summary AS
SELECT 
  window,
  league_name,
  COUNT(*) as total_transfers,
  SUM(CASE WHEN transfer_value_usd > 0 THEN transfer_value_usd ELSE 0 END) as total_spending,
  COUNT(DISTINCT from_club_id) as clubs_selling,
  COUNT(DISTINCT to_club_id) as clubs_buying
FROM transfers
GROUP BY window, league_name;
```

### 8.4 Seed Data Requirements

**Initial Leagues (Top 5 + More):**

* Premier League (England)
* La Liga (Spain)
* Serie A (Italy)
* Bundesliga (Germany)
* Ligue 1 (France)
* MLS (USA)
* Brazilian Serie A
* Championship (England)

**Initial Data Load:**

* Fetch all transfers from current window via API
* Backfill historical windows (optional)
* Populate clubs and leagues from transfer data

---

## 9\. API & Data Integration

### 9.1 Hybrid Data Sources

| Domain | Source | Notes |
| --- | --- | --- |
| Transfers (real-time) | Transfermarkt scrape → CSV | Reliable confirmed deals for Top 10 leagues. Scraper controlled in `scripts/transfermarkt-scrape.ts`. |
| Leagues & Clubs metadata | API-Football | Stable static info (IDs, venues, logos). Minimal requests keep us under free-tier quota. |
| Future enrichment | TBD | Player bios, contract metadata may still use API-Football if accuracy improves, or another provider. |

### 9.2 Transfer Scraping Workflow

#### Local Development & Production Cron System

**Why We Need Local Cron Jobs:**

The Transfermarkt scraping system requires automated execution every 4 hours to maintain data freshness. While Vercel handles production cron jobs, local development needs its own scheduling system for:

1. **Development Validation**: Test scraping pipeline changes before deployment
2. **Data Freshness**: Ensure local environment has up-to-date transfer data
3. **Deadline Day Testing**: Simulate high-frequency updates during critical periods
4. **Offline Development**: Work without relying on external cron services

**Local Cron Implementation:**

```bash
# Local cron job (runs every 4 hours)
SHELL=/bin/bash
PATH=/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:/usr/local/sbin

0 */4 * * * cd "/path/to/project" && /usr/local/bin/node /usr/local/bin/npm run mock-cron normal >> "/path/to/project/logs/cron.log" 2>&1
```

**Key Components:**

1. **transfermarkt-scrape.ts**: Scrapes Transfermarkt website for latest transfers
2. **mock-cron.js**: Simulates Vercel cron triggers locally for testing
3. **local-sync.sh**: Orchestrates scrape → copy → seed pipeline
4. **logs/cron.log**: Captures all execution output for debugging

**Workflow Steps:**

1. **Scrape step**
   * Run `TRANSFERMARKT_TOP10=true TRANSFERMARKT_PAGE_COUNT=10 npx tsx scripts/transfermarkt-scrape.ts`.
   * Persist CSV into `Temp_Ref/latest-transfers-top10-pages-1-to-10.csv` (cron + manual trigger documented in ops runbook).
2. **Seed step**
   * `tsx scripts/seed.ts` ingests CSV, resolves clubs/leagues, upserts transfers.
   * `TRANSFER_CSV_PATH` env variable allows pointing to alternate snapshots.
3. **Schedule**
   * Local cron every 4 hours (6AM, 10AM, 2PM, 6PM, 10PM, 2AM)
   * Production Vercel cron every 8 hours + manual run on deadline day.
   * Alerts if scraper output count deviates ±10% vs previous run (guards against HTML changes).

**Monitoring & Validation:**

* Check `logs/cron.log` for execution status and errors
* Run `npm run mock-cron status` to view sync metrics and recent runs
* Manual validation: Compare scraped data against Transfermarkt UI
* Performance metrics: Track scrape duration, rows processed, API calls used

**Troubleshooting Common Issues:**

* **Missing logs**: Cron PATH issues - ensure full paths to node/npm
* **Scraping failures**: Website layout changes - check HTML structure
* **Database errors**: Club resolution failures - verify name mappings
* **Rate limiting**: Too frequent requests - adjust scrape intervals

### 9.3 Residual API Usage (API-Football)

* Endpoints retained: `GET /v3/leagues`, `GET /v3/teams` for metadata only.
* Transfer endpoints removed from production workflow; only used for experimental enrichment.
* Free-tier quota now largely unused (<30 req/day), giving buffer for diagnostics.

### 9.4 Contingency Plan

* If Transfermarkt layout changes → scraper fails → fall back to last good CSV (seed script logs timestamp) and raise a P0 issue.
* Long-term: evaluate dedicated data providers (Opta, SportMonks) once budget allows; keep scraper as safety net.
```
GET /transfers
```

**Parameters:**

* `player` (optional): Player ID or name
* `team` (optional): Team ID
* `league` (optional): League ID
* `season` (optional): Year (e.g., 2024)

**Example Request:**

```
curl -X GET \
  'https://v3.football.api-sports.io/transfers?season=2024' \
  -H 'x-rapidapi-key: YOUR_KEY' \
  -H 'x-rapidapi-host: v3.football.api-sports.io'
```

**Response Structure:**

```
{
  "response": [
    {
      "player": {
        "id": 276,
        "name": "Cristiano Ronaldo"
      },
      "update": "2023-12-19T00:00:00+00:00",
      "transfers": [
        {
          "date": "2023-01-01",
          "type": "Free",
          "teams": {
            "in": {
              "id": 211,
              "name": "Al Nassr",
              "logo": "https://media.api-sports.io/football/teams/211.png"
            },
            "out": {
              "id": 33,
              "name": "Manchester United",
              "logo": "https://media.api-sports.io/football/teams/33.png"
            }
          }
        }
      ]
    }
  ]
}
```

**Note:** API-Football does NOT provide transfer fees directly. We may need to:

* Scrape from Transfermarkt (not recommended)
* Manually update high-profile transfers
* Use "Undisclosed" for most transfers
* Add manual override system in admin panel

#### Get Leagues

```
GET /leagues
```

Used to populate leagues table with logos, names, countries.

#### Get Teams

```
GET /teams
```

Used to populate clubs table with logos, names.

### 9.3 Data Mapping

**API → Database Mapping:**

| API Field | Database Field | Notes |
| -- | -- | -- |
| `player.id` | `player_id` | Store for reference |
| `player.name` | `player_full_name` | Full name as string |
| `transfers[].date` | `transfer_date` | Parse to DATE type |
| `transfers[].type` | `transfer_type` | Map: "Free" → "Free Transfer", "Loan" → "Loan", etc. |
| `teams.in.id` | `to_club_id` | Lookup/create club record |
| `teams.in.name` | `to_club_name` | Denormalized for display |
| `teams.out.id` | `from_club_id` | Lookup/create club record |
| `teams.out.name` | `from_club_name` | Denormalized for display |

**Data Transformations:**

* Split `player.name` into first/last name (basic logic: last word = last name)
* Parse player age from birth date (if available) or estimate
* Determine position from player endpoint (requires additional API call)
* Assign to current transfer window based on date
* Handle missing data gracefully (NULL or "Unknown")

### 9.4 Data Sync Strategy

#### Initial Seed (One-time)

1. Fetch all transfers from current window
2. For each transfer:
   * Create/update club records
   * Create/update league records
   * Create transfer record
3. Backfill player details (position, age, nationality)

**Estimated API Calls:**

* \~50-100 transfers per day during window
* 4 sync runs = 200-400 calls/day (well within Classic plan)

#### Scheduled Syncs

**Normal Mode** (4x daily):

* 6:00 AM UTC - Morning update
* 12:00 PM UTC - Midday update
* 6:00 PM UTC - Evening update
* 12:00 AM UTC - Late night update

**Deadline Day Mode** (every 30 min):

* Manually triggered
* 48 syncs in 24 hours
* Monitor API quota closely

#### Sync Process

```
// Pseudocode
async function syncTransfers() {
  try {
    // 1. Fetch from API
    const apiResponse = await fetchFromAPIFootball({
      season: getCurrentSeason(),
      // Could filter by league for more targeted sync
    });
    
    // 2. Validate
    const validTransfers = apiResponse.filter(isValidTransfer);
    
    // 3. Transform
    const normalized = validTransfers.map(normalizeTransferData);
    
    // 4. Upsert to database
    for (const transfer of normalized) {
      await upsertTransfer(transfer);
    }
    
    // 5. Log results
    await logSyncRun({
      timestamp: new Date(),
      transfersProcessed: normalized.length,
      errors: [],
      status: 'success'
    });
    
  } catch (error) {
    // Error handling and logging
    await logSyncRun({
      timestamp: new Date(),
      status: 'failed',
      error: error.message
    });
  }
}
```

### 9.5 API Limitations & Workarounds

**Limitation 1: No Transfer Fees**

* **Impact:** Can't display accurate transfer values
* **Workaround:**
  * Mark all as "Undisclosed" initially
  * Add admin panel to manually input high-profile fees
  * Consider web scraping Transfermarkt (legally questionable)
  * Focus on transfer count/activity over values

**Limitation 2: Rate Limits**

* **Impact:** Limited daily requests
* **Workaround:**
  * Efficient caching strategy
  * Batch requests when possible
  * Upgrade to higher tier if needed (\~$50/month for 10K requests)

**Limitation 3: Data Lag**

* **Impact:** API may not have instant updates
* **Workaround:**
  * Set user expectations (updates every few hours)
  * Manual override system for breaking news
  * Supplement with Fabrizio Romano feed for "soft" confirmations

**Limitation 4: Historical Data**

* **Impact:** Free/lower tiers may limit historical access
* **Workaround:**
  * Seed database once, maintain going forward
  * Store all data locally (don't rely on API for historical queries)

---

## 10\. Out of Scope

The following features are explicitly **NOT** included in soft launch or full MVP:

### For Soft Launch & MVP

* ❌ User accounts and authentication
* ❌ Personalization (favorite teams, custom filters saved to account)
* ❌ Email/push notifications
* ❌ Native mobile apps (iOS/Android)
* ❌ Transfer rumors and speculation section
* ❌ Player profile pages with career history
* ❌ Team comparison tools
* ❌ Multiple currency support (USD only)
* ❌ Historical transfer window analysis (focus on current window only)
* ❌ Social features (comments, sharing, reactions)
* ❌ Advanced analytics (predicted transfer values, market trends)
* ❌ API for third-party developers
* ❌ Admin panel/CMS
* ❌ Internationalization (English only)
* ❌ Dark mode
* ❌ Accessibility audit (WCAG 2.1 AA compliance)

### Rationale

These features would extend development time significantly and aren't critical for validating core value proposition. They can be added iteratively based on user feedback.

---

## 11\. Future Roadmap

### Post-MVP Phase 1 (After Summer 2025 Window)

**Social Features Foundation**

* User registration and authentication (Supabase Auth)
* User profiles with favorite team selection
* Basic preferences (leagues to follow, notification settings)

**Wishlist Feature**

* Users can add desired transfers ("I wish Liverpool would sign Mbappé")
* Aggregate view: "25,000 users want Player X to Team Y"
* Trending wishlists (most requested today/this week)
* Share wishlists on social media

**Enhanced Analytics**

* Position-by-position transfer analysis ("Top 10 striker moves")
* Age distribution of transfers
* League comparison dashboards
* "Transfer Window Wrapped" at end of window (Spotify-style recap)

### Post-MVP Phase 2 (Winter 2026 Window)

**Predictions & Gamification**

* Users predict where players will transfer
* Points system for correct predictions
* Leaderboards (global, friends, by accuracy)
* Badges and achievements

**Polymarket Integration**

* Display odds for major transfer rumors
* Link to Polymarket for betting (affiliate opportunity)
* Track prediction market accuracy vs reality

**Notifications**

* Email digest (daily summary during window)
* Push notifications (PWA) for favorite teams
* Custom alerts (position, league, value threshold)

### Post-MVP Phase 3 (Summer 2026 Window)

**Community Features**

* Comments on individual transfers
* Reactions (🔥 for great signings, 😱 for surprises)
* User-generated content (transfer ratings, analysis)

**Advanced Tools**

* Squad builder (see how signings fit into formations)
* Net spend calculator with historical comparison
* "What if" scenario builder

**Monetization**

* Sponsorships (team/league specific)
* Premium tier (advanced analytics, ad-free, early access)
* Affiliate partnerships (Polymarket, betting sites)

### Long-term Vision (2027+)

**Platform Expansion**

* Mobile native apps (React Native)
* API for developers
* Transfer news aggregation (AI-summarized articles)
* Expanded coverage (all leagues globally)
* Historical transfer database and analysis
* AI-powered transfer predictions

**Community Growth**

* Discord/Slack integration
* Fantasy football integration
* YouTube/podcast content
* Regional communities (language support)

---

## 12\. Implementation Plan

### 12.1 Development Phases

#### Phase 0: Setup & Planning (Week 1-2)

**Jan 16 - Jan 30, 2025**

**Goals:**

* Finalize PRD
* Set up development environment
* Validate API integration
* Create basic wireframes

**Tasks:**

- [ ] Review and approve PRD
- [ ] Purchase API-Football subscription (Classic plan)
- [ ] Create Next.js project with TypeScript
- [ ] Set up Supabase project and database
- [ ] Create GitHub repository
- [ ] Configure Vercel deployment
- [ ] Test API-Football endpoints
- [ ] Design database schema in Supabase
- [ ] Create low-fidelity wireframes (Figma/pen & paper)
- [ ] Set up development workflow (ESLint, Prettier, Git hooks)

**Deliverables:**

* Working dev environment
* Database schema implemented
* API connection validated
* Wireframes for 3 key pages

---

#### Phase 1: Soft Launch (Week 3-4)

**Jan 31 - Feb 2, 2025 (Deadline Day)**

**Goals:**

* Ship minimal viable product for Feb 2 deadline
* Validate data pipeline
* Gather initial feedback

**Week 3 Tasks (Jan 31 - Feb 6):**

- [ ] Set up dark theme design system
  - [ ] Define color palette (dark backgrounds, neon accents)
  - [ ] Create reusable card components with glassmorphism
  - [ ] Set up Tailwind custom theme config
- [ ] Build simplified dashboard
  - [ ] 4 KPI cards component
  - [ ] Daily Activity line chart (Recharts)
  - [ ] Responsive grid layout
- [ ] Build basic transfer table
  - [ ] Table structure with 5 columns
  - [ ] Player photos and team logos
  - [ ] Basic sorting (one column)
  - [ ] Search functionality
  - [ ] Pagination with "Load More"
  - [ ] Status badges (DONE)
- [ ] Build Top Transfers sidebar
  - [ ] Numbered list component
  - [ ] Player → Team display
  - [ ] Transfer fee formatting
- [ ] Implement data sync pipeline
  - [ ] API integration service
  - [ ] Data validation layer
  - [ ] Database upsert logic
  - [ ] Error handling
- [ ] Create basic layout and navigation
  - [ ] Header with logo and search
  - [ ] Mobile-responsive layout
- [ ] Deploy to Vercel (staging environment)

**Week 4 Tasks (Feb 2 - Deadline Day):**

- [ ] Test with real data
- [ ] Performance optimization
- [ ] Bug fixes
- [ ] Deploy to production
- [ ] Share with 10-15 friends for feedback
- [ ] Monitor during deadline day
- [ ] Manual data refresh as needed
- [ ] Document learnings and issues

**Deliverables:**

* Live website with transfer table and featured widget
* Working data pipeline
* User feedback collected
* Lessons learned document

---

#### Phase 2: MVP Development (Week 5-10)

**Feb 7 - March 21, 2025**

**Week 5-6: Core Features**

- [ ] Enhance dashboard to full version
  - [ ] Add Transfers by League bar chart
  - [ ] Add Top Teams Volume horizontal bar chart (with IN/OUT split)
  - [ ] Improve Daily Activity chart styling
  - [ ] Add league filter/toggle functionality
  - [ ] Implement auto-refresh for live updates
- [ ] Enhance transfer table
  - [ ] Add advanced filtering UI
    - [ ] Multi-select league dropdown with crests
    - [ ] Multi-select position filter
    - [ ] Transfer type filter
    - [ ] Age range slider
    - [ ] Transfer value range slider
    - [ ] Date range picker
  - [ ] Add filter panel (slide-out)
  - [ ] Add "Clear All Filters" functionality
  - [ ] Add active filter tags/chips
  - [ ] Multi-column sorting
  - [ ] Export to CSV functionality
  - [ ] Add CONFIRMED/RUMOURS tabs
- [ ] Enhance sidebar with tabs
  - [ ] Tab navigation component
  - [ ] Top Transfers tab (existing)
  - [ ] Latest Deals tab (new)
  - [ ] Insider Feed tab skeleton
- [ ] Improve data pipeline
  - [ ] Scheduled syncs (Vercel Cron)
  - [ ] Better error handling
  - [ ] Sync status dashboard
  - [ ] Data quality checks

**Week 7-8: Additional Features**

- [ ] Build team pages
  - [ ] Team header component
  - [ ] Incoming/outgoing transfers tables
  - [ ] Net spend calculation
  - [ ] Summary statistics
  - [ ] Shareable URLs
- [ ] Complete insider feed
  - [ ] Twitter/X API integration or embed widget
  - [ ] Auto-refresh mechanism
  - [ ] Support for multiple journalists
  - [ ] Mobile-optimized display
  - [ ] Fallback for API failures
- [ ] Create landing/marketing page
  - [ ] Hero section with product showcase
  - [ ] Feature highlights
  - [ ] Call-to-action
  - [ ] About section
  - [ ] Footer with links
- [ ] Design system refinement
  - [ ] Finalize color palette and neon accents
  - [ ] Standardize glassmorphism effects
  - [ ] Create comprehensive component library
  - [ ] Document design tokens

**Week 9-10: Polish & Optimization**

- [ ] Performance optimization
  - [ ] Code splitting
  - [ ] Image optimization
  - [ ] Lazy loading
  - [ ] Bundle size reduction
- [ ] SEO optimization
  - [ ] Meta tags
  - [ ] Open Graph tags
  - [ ] Sitemap
  - [ ] robots.txt
- [ ] Analytics setup (Vercel Analytics)
- [ ] Error tracking (Sentry or similar)
- [ ] Comprehensive testing
- [ ] Bug fixes
- [ ] Documentation

**Deliverables:**

* Complete MVP feature set
* Optimized performance (>90 Lighthouse score)
* Production-ready codebase

---

#### Phase 3: Testing & Pre-Launch (Week 11-12)

**March 22 - April 4, 2025**

**Goals:**

* Thorough testing
* Fix critical bugs
* Prepare for launch

**Tasks:**

- [ ] User acceptance testing with beta group
- [ ] Cross-browser testing (Chrome, Safari, Firefox, Edge)
- [ ] Mobile device testing (iOS, Android)
- [ ] Accessibility testing (basic keyboard navigation)
- [ ] Load testing (handle traffic spikes)
- [ ] Security audit (basic)
- [ ] Create help/FAQ page
- [ ] Write launch announcement
- [ ] Prepare social media content
- [ ] Create demo video/screenshots
- [ ] Set up domain (if not done)
- [ ] Configure production environment

**Deliverables:**

* Bug-free application
* Launch materials ready
* Staging environment validated

---

#### Phase 4: Marketing & Soft Launch (Week 13-14)

**April 5 - April 25, 2025**

**Goals:**

* Build awareness before summer window
* Gather early signups/interest
* Test marketing channels

**Tasks:**

- [ ] Soft launch to closed community (Reddit, Discord)
- [ ] Gather feedback and iterate
- [ ] Social media presence
  - [ ] Create Twitter/X account
  - [ ] Create Instagram account
  - [ ] Post regularly about transfers
- [ ] Content marketing
  - [ ] Blog posts about transfer market
  - [ ] Share interesting transfer stats
  - [ ] Engage with football communities
- [ ] Email list building
  - [ ] Create newsletter signup
  - [ ] Send pre-window teaser
- [ ] Partnership outreach
  - [ ] Contact football content creators
  - [ ] Reach out to fan communities
- [ ] Monitor analytics
- [ ] Iterate based on feedback

**Deliverables:**

* 500+ email subscribers
* Social media following established
* Early user feedback incorporated

---

#### Phase 5: Full Public Launch (Week 15)

**May 1-7, 2025 (Before Summer Window)**

**Goals:**

* Public launch with marketing push
* Drive initial traffic
* Establish as go-to transfer tracker

**Launch Day Tasks:**

- [ ] Deploy final version to production
- [ ] Announce on social media
- [ ] Post to Reddit (r/soccer, team subreddits)
- [ ] Share in football Discord servers
- [ ] Email newsletter to subscriber list
- [ ] Monitor performance and traffic
- [ ] Respond to user feedback quickly
- [ ] Fix any critical issues immediately

**Week 1 Post-Launch:**

- [ ] Daily monitoring and support
- [ ] Engage with users on social media
- [ ] Fix bugs as reported
- [ ] Analyze user behavior (analytics)
- [ ] Iterate on UX based on data
- [ ] Continue marketing efforts

**Deliverables:**

* Successful public launch
* User base established
* Feedback loop active

---

### 12.2 Resource Allocation

**Development Time Estimates:**

| Phase | Duration | Hours/Week | Total Hours |
| -- | -- | -- | -- |
| Setup & Planning | 2 weeks | 10 hrs | 20 hrs |
| Soft Launch | 2 weeks | 15 hrs | 30 hrs |
| MVP Development | 6 weeks | 15 hrs | 90 hrs |
| Testing & Pre-Launch | 2 weeks | 10 hrs | 20 hrs |
| Marketing & Soft Launch | 3 weeks | 5 hrs | 15 hrs |
| **Total** | **15 weeks** | \- | **175 hrs** |

**Note:** This assumes solo development working part-time (\~10-15 hrs/week). Adjust based on your availability.

---

### 12.3 Risk Mitigation

| Risk | Impact | Probability | Mitigation |
| -- | -- | -- | -- |
| API-Football downtime | High | Low | Cache data locally, have manual override system |
| API rate limit exceeded | Medium | Medium | Upgrade plan, optimize requests, implement backoff |
| Low user adoption | Medium | Medium | Strong pre-launch marketing, community engagement |
| Data quality issues | High | Medium | Validation layer, manual review of high-value transfers |
| Competitor launches similar product | Low | Low | Focus on unique angle (wishlist, predictions), speed to market |
| Development delays | Medium | High | Buffer time in schedule, reduce scope if needed |
| Technical debt accumulation | Medium | Medium | Regular refactoring, code reviews, documentation |

---

## 13\. Open Questions

### Product Questions

1. **Domain Name:** Have you secured a domain? Suggestions:
   * transferhub.io
   * windowtracker.com
   * transferwindow.app
   * thehub.football
2. **Branding:** Any thoughts on visual identity, colors, logo?
   * Suggestion: Football/soccer inspired but modern and clean
3. **Content Strategy:** Will you create editorial content (blog posts, analysis) or purely data?
4. **User Feedback:** How will you collect and prioritize feature requests?
   * Consider using Canny, GitHub Discussions, or Discord
5. **Monetization Timeline:** When do you want to start exploring revenue?
   * Summer 2026? Keep free indefinitely?

### Technical Questions

 6. **Development Environment:** Mac/Windows/Linux? Any preferences for tools?
 7. **Design Skills:** Do you have design capabilities, or should we use pre-built components heavily?
    * If limited design skills, recommend shadcn/ui + Tailwind for professional look
 8. **Testing Strategy:** How much automated testing do you want?
    * Suggest starting with minimal, add as needed
 9. **Monitoring:** Beyond basic analytics, do you want error tracking (Sentry), uptime monitoring?
10. **Backup Strategy:** Database backups beyond Supabase's automatic backups?

### Data & API Questions

11. **API Plan:** Starting with Classic ($15/month) or higher tier?
12. **Data Ownership:** Are you comfortable storing all data locally (not relying on API for historical queries)?
13. **Transfer Fees:** How important is showing accurate transfer values?
    * If critical, may need manual data entry or alternative data source
14. **League Priority:** Which leagues are absolute must-haves for MVP?
    * Recommend: Premier League, La Liga, Serie A, Bundesliga, Ligue 1
15. **Journalist Selection:** Confirm Fabrizio Romano as primary source? Any others?
    * David Ornstein, Ben Jacobs, others?

---

## 14\. Success Criteria

### Soft Launch Success (Feb 2025)

- [ ] Zero critical bugs during deadline day
- [ ] Data pipeline successfully updates every 2-4 hours
- [ ] Positive feedback from 5+ beta users
- [ ] Technical validation complete
- [ ] 3+ hours of uptime during peak deadline day hours

### MVP Launch Success (May 2025)

- [ ] 1,000+ unique visitors in first week
- [ ] 30%+ week-over-week growth during window
- [ ] Average session duration > 3 minutes
- [ ] <1% error rate in transfer data
- [ ] 99%+ uptime during transfer window
- [ ] 50+ email subscribers
- [ ] Featured in 1+ football community (Reddit, Discord)
- [ ] 90+ Lighthouse performance score

### Long-term Success (2026+)

- [ ] 10,000+ active users during transfer windows
- [ ] Recognized brand in transfer tracking space
- [ ] Active community engagement (wishlists, predictions)
- [ ] Sustainable revenue model established
- [ ] Featured by major football media outlet

---

## 15\. Appendix

### 15.1 Glossary

* **Transfer Window:** Designated period when football clubs can register new players
* **Deadline Day:** Final day of transfer window, typically very active
* **Transfer Fee:** Amount paid by buying club to selling club
* **Loan:** Temporary transfer, player returns to original club
* **Free Transfer:** Player moves without transfer fee (contract expired)
* **Undisclosed:** Transfer fee not publicly announced
* **Net Spend:** Total spending minus total sales revenue

### 15.2 Resources

**API Documentation:**

* API-Football: https://www.api-football.com/documentation-v3

**Technology Documentation:**

* Next.js: https://nextjs.org/docs
* Supabase: https://supabase.com/docs
* Tailwind CSS: https://tailwindcss.com/docs
* shadcn/ui: https://ui.shadcn.com
* Recharts: https://recharts.org/en-US

**Design Inspiration:**

* Transfermarkt: https://www.transfermarkt.com
* FBref: https://fbref.com
* Sofascore: https://www.sofascore.com

**Football Communities:**

* r/soccer: https://reddit.com/r/soccer
* r/FantasyPL: https://reddit.com/r/FantasyPL

### 15.3 Contact & Feedback

For questions, suggestions, or feedback on this PRD:

* Document Owner: \[Your Name\]
* Email: \[Your Email\]
* Last Updated: January 16, 2025

---

## Document History

| Version | Date | Author | Changes |
| -- | -- | -- | -- |
| 1.0 | Jan 16, 2025 | Product Lead | Initial draft |

---

**END OF DOCUMENT**
