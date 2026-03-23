# CLAUDE.md — VibeTuga

## Project Identity

**VibeTuga** is the Portuguese vibe coding community — a hub where developers, creators, and AI enthusiasts come together to learn, share, and build the future of AI-assisted programming.

**Mission:** Make VibeTuga the go-to Portuguese-speaking reference for vibe coding, AI tooling, and agent-assisted development.

**Active channels:** Discord (main community), Twitch, YouTube, TikTok (streaming/content).

**Production URL:** `vibetuga.com` (TBD)
**Repository:** `github.com/VibeTuga/vibetuga.com`

---

## Tech Stack

| Layer         | Technology                          | Justification                                           |
| ------------- | ----------------------------------- | ------------------------------------------------------- |
| Framework     | **Next.js 16** (App Router)         | Hybrid SSR/SSG, React Server Components, API routes     |
| Language      | **TypeScript** (strict mode)        | Type safety, superior DX, auto-complete                 |
| Database      | **Neon DB** (serverless PostgreSQL) | Branching, serverless scaling, connection pooling       |
| ORM           | **Drizzle ORM**                     | Type-safe, SQL-first, automatic migrations, lightweight |
| Auth          | **NextAuth.js v5** (Auth.js)        | Discord OAuth provider, session management              |
| Styling       | **Tailwind CSS v4**                 | Utility-first, design tokens, native dark mode          |
| UI Components | **shadcn/ui**                       | Accessible, customizable, copy-paste philosophy         |
| Payments      | **Stripe**                          | Marketplace payments, Connect for sellers               |
| Email         | **Resend** + **React Email**        | Transactional emails, newsletters, React templates      |
| CMS/Editor    | **Tiptap** or **MDX**               | Rich text editor for blog posts                         |
| File Storage  | **Cloudflare R2**                   | S3-compatible object storage, zero egress fees          |
| Hosting       | **Vercel**                          | Automatic deploys, edge functions, preview deploys      |
| Analytics     | **Plausible** or **PostHog**        | Privacy-first analytics                                 |
| Search        | **Meilisearch** or Neon full-text   | Blog posts, products, projects search                   |

---

## System Architecture

```
vibetuga-web/
├── src/
│   ├── app/
│   │   ├── (public)/          # Landing, blog, store, showcase, leaderboard, newsletter
│   │   ├── (auth)/            # Discord OAuth login + callback
│   │   ├── (dashboard)/       # Authenticated area (profile, my-projects, my-products, submit)
│   │   ├── (admin)/           # Admin panel (dashboard, posts, products, users, showcase, newsletter, leaderboard)
│   │   └── api/               # Auth, blog, store, webhook, newsletter, upload, search
│   ├── components/
│   │   ├── ui/                # shadcn/ui base components
│   │   ├── layout/            # Header, Footer, Sidebar, Nav
│   │   ├── blog/              # BlogCard, PostContent, AuthorBadge
│   │   ├── store/             # ProductCard, CartDrawer, PriceTag
│   │   ├── showcase/          # ProjectCard, ProjectGallery
│   │   ├── leaderboard/       # RankingTable, PointsBadge, Streaks
│   │   ├── admin/             # AdminTable, StatCard, Charts
│   │   └── shared/            # Logo, SEO, Toast, Modal, Search
│   ├── lib/
│   │   ├── db/                # schema.ts, index.ts (Neon connection), migrations/
│   │   ├── auth.ts            # NextAuth config
│   │   ├── stripe.ts          # Stripe client & helpers
│   │   ├── email.ts           # Resend client
│   │   ├── r2.ts              # Cloudflare R2 client & presigned URL helpers
│   │   └── utils.ts           # Generic helpers
│   ├── hooks/                 # Custom React hooks
│   ├── types/                 # TypeScript type definitions
│   └── styles/globals.css     # Tailwind + custom tokens
├── public/                    # Static assets
├── drizzle.config.ts
├── next.config.ts
├── tailwind.config.ts
├── .env.example               # All env vars documented here
└── package.json
```

---

## Database Schema (Neon PostgreSQL via Drizzle)

> Full SQL DDL lives in `src/lib/db/schema.ts`. Below is the conceptual overview.

### Core Tables

| Table                    | Key Fields                                                                                                                                                                                       | Purpose                                |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------- |
| `users`                  | discord_id, discord_username, email, role (`admin`/`moderator`/`author`/`seller`/`member`), xp_points, level, streak_days, is_banned                                                             | Discord OAuth users with gamification  |
| `blog_categories`        | name, slug, color, icon, sort_order                                                                                                                                                              | Blog taxonomy                          |
| `blog_posts`             | author_id, category_id, title, slug, content, status (`draft`/`pending_review`/`published`/`archived`), post_type (`admin`/`community`/`guest`), tags[], reading_time_minutes, views/likes count | Blog content with multi-author support |
| `blog_comments`          | post_id, author_id, parent_id (threading), content, is_approved                                                                                                                                  | Threaded comments                      |
| `showcase_projects`      | author_id, title, slug, description, cover_image, gallery_images[], live_url, repo_url, video_url, tech_stack[], ai_tools_used[], status (`pending`/`approved`/`featured`/`rejected`)            | Community project gallery              |
| `xp_events`              | user_id, action, xp_amount, reference_id                                                                                                                                                         | XP tracking for gamification           |
| `badges` / `user_badges` | name, slug, icon, criteria, xp_reward                                                                                                                                                            | Achievement system                     |
| `levels`                 | level, name, xp_required, perks                                                                                                                                                                  | Level progression config               |
| `newsletter_subscribers` | email, user_id (optional), status, source                                                                                                                                                        | Email list                             |
| `newsletter_campaigns`   | subject, content, status, sent/open/click counts                                                                                                                                                 | Email campaigns                        |

### Store Tables (Phase 4)

| Table             | Key Fields                                                                                                                                                       | Purpose             |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| `store_products`  | seller_id, title, slug, price_cents, product_type (`skill`/`auto_runner`/`agent_kit`/`prompt_pack`/`template`/`course`/`guide`/`other`), status, stripe_price_id | Digital marketplace |
| `subscriptions`   | user_id, plan (`monthly`/`yearly`), stripe_subscription_id, current_period_start/end                                                                             | Premium access      |
| `store_purchases` | buyer_id, product_id, price_paid_cents, stripe_payment_id                                                                                                        | Purchase records    |
| `store_reviews`   | product_id, reviewer_id, rating (1-5), is_verified_purchase                                                                                                      | Product reviews     |

### Social & Engagement Tables (Phases 5-6)

| Table              | Key Fields                                                                                  | Purpose                          |
| ------------------ | ------------------------------------------------------------------------------------------- | -------------------------------- |
| `user_follows`     | follower_id, following_id, created_at                                                       | User follow relationships        |
| `user_settings`    | user_id, email_notifications, in_app_notifications, privacy_level, locale                   | Per-user preferences             |
| `notifications`    | user_id, type, title, body, link, is_read, actor_id, reference_id, created_at               | In-app notification feed         |
| `reports`          | reporter_id, content_type, content_id, reason, status, resolved_by                          | Content reporting & moderation   |
| `admin_audit_log`  | actor_id, action, target_type, target_id, details (jsonb), ip_address, created_at           | Admin action tracking            |
| `role_requests`    | user_id, requested_role, reason, status, reviewed_by                                        | Self-service role upgrade        |
| `direct_messages`  | sender_id, recipient_id, content, is_read, created_at                                       | Private messaging                |
| `referrals`        | referrer_id, referred_user_id, referral_code, status, xp_awarded                            | Referral tracking                |
| `collections`      | user_id, name, description, is_public                                                       | User bookmark collections        |
| `collection_items` | collection_id, item_type, item_id, added_at                                                 | Items within a collection        |
| `project_votes`    | project_id, user_id, vote_type (`up`/`down`), created_at                                    | Showcase project voting          |

### Content & Marketplace Enhancement Tables (Phases 7-8)

| Table               | Key Fields                                                                                  | Purpose                          |
| ------------------- | ------------------------------------------------------------------------------------------- | -------------------------------- |
| `blog_series`       | title, slug, description, cover_image, author_id, sort_order                                | Group posts into ordered series  |
| `blog_series_posts` | series_id, post_id, order                                                                   | Posts within a series            |
| `blog_revisions`    | post_id, content, title, edited_by, revision_number, created_at                             | Post version history             |
| `content_analytics` | content_type, content_id, date, views, unique_views, referral_source                        | Per-content daily analytics      |
| `store_coupons`     | code, discount_percent, discount_amount_cents, max_uses, expires_at, seller_id              | Discount codes                   |
| `store_refunds`     | purchase_id, buyer_id, reason, status, stripe_refund_id                                     | Refund requests                  |
| `store_wishlists`   | user_id, product_id, created_at                                                             | Product wishlists                |
| `product_updates`   | product_id, version, changelog, download_key, created_at                                    | Product version updates          |
| `store_collections` | name, slug, description, cover_image, is_featured, sort_order                               | Admin-curated product collections |

### Community & Growth Tables (Phase 10)

| Table               | Key Fields                                                                                  | Purpose                          |
| ------------------- | ------------------------------------------------------------------------------------------- | -------------------------------- |
| `community_events`  | title, description, event_type, start_at, end_at, link, created_by                         | Events calendar                  |
| `challenges`        | title, description, start_at, end_at, badge_reward_id, status                               | Community challenges             |
| `challenge_entries`  | challenge_id, user_id, submission_url, description, votes_count, status                     | Challenge submissions            |
| `feature_flags`     | key, is_enabled, rollout_percentage, description                                            | Gradual feature rollouts         |
| `api_keys`          | user_id, key_hash, name, scopes[], last_used_at, expires_at                                 | Public API authentication        |

---

## Design System

- All UI work MUST follow the design system defined in `./DESIGN.md`
- Before creating any component, read DESIGN.md for color palette, typography, spacing, and component styling rules
- Never hardcode colors or font sizes — always use the tokens defined in DESIGN.md
- When in doubt about a visual decision, DESIGN.md is the authority

### Design References

- **`./docs/design/*.html`** — Pre-built HTML design references for key pages and components. Before implementing any page or component, check if a corresponding `.html` file exists in this directory and match its structure, layout, and visual style.
- **`./docs/design/screenshots/`** — Screenshots of the approved designs. Use these as the visual source of truth when the HTML files alone aren't sufficient to judge spacing, proportions, or overall feel.
- When building a new page or component: **(1)** check `./docs/design/` for an existing HTML reference, **(2)** cross-reference with screenshots in `./docs/design/screenshots/`, **(3)** consult `DESIGN.md` for tokens and rules, **(4)** only then start coding.
- Never deviate from the approved designs without explicit approval. If the design references conflict with DESIGN.md, the HTML references + screenshots take precedence as they represent the latest approved visuals.

---

## Roles & Permissions

Auth: Discord OAuth via NextAuth → `/api/auth/callback/discord` → create/update user in DB → redirect to dashboard.

| Role        | Blog                   | Store            | Showcase         | Social              | Admin      |
| ----------- | ---------------------- | ---------------- | ---------------- | ------------------- | ---------- |
| `member`    | Comment, submit post   | Buy, review      | Submit project   | Follow, DM, report  | —          |
| `author`    | Publish posts directly | Buy, review      | Submit project   | Follow, DM, report  | —          |
| `seller`    | Comment, submit post   | Sell + buy       | Submit project   | Follow, DM, report  | —          |
| `moderator` | Approve posts, edit    | Approve products | Approve projects | Resolve reports     | Partial    |
| `admin`     | Everything             | Everything       | Everything       | Everything          | Everything |

Users can request role upgrades (member → seller, member → author) via self-service form, approved by admin.

---

## API Routes

### Existing Routes

```
POST   /api/auth/[...nextauth]      — Auth endpoints (NextAuth)
GET    /api/blog/posts               — List posts (paginated, filters)
POST   /api/blog/posts               — Create post (auth: author+)
PATCH  /api/blog/posts/[id]          — Edit post
DELETE /api/blog/posts/[id]          — Delete post
POST   /api/blog/posts/[id]/like     — Like/unlike post
POST   /api/blog/posts/[id]/bookmark — Bookmark/unbookmark post
POST   /api/blog/posts/[id]/view     — Track post view
GET    /api/blog/posts/[id]/comments — Get comments for post
POST   /api/blog/posts/[id]/comments — Create comment on post
POST   /api/blog/comments            — Create comment (legacy)
GET    /api/blog/categories          — List categories
POST   /api/blog/categories          — Create category (auth: admin)
PATCH  /api/blog/categories/[id]     — Edit category
DELETE /api/blog/categories/[id]     — Delete category
GET    /api/showcase/projects         — List approved projects
POST   /api/showcase/projects         — Submit project
PATCH  /api/showcase/projects/[id]   — Edit/approve project
DELETE /api/showcase/projects/[id]   — Delete project
GET    /api/leaderboard               — Rankings
GET    /api/users/[id]/profile        — Public profile
PATCH  /api/users/me                  — Edit own profile
POST   /api/newsletter/subscribe      — Subscribe to newsletter
GET    /api/newsletter/unsubscribe    — Unsubscribe link
GET    /api/newsletter/campaigns      — List campaigns
POST   /api/newsletter/campaigns      — Create campaign (auth: admin)
POST   /api/newsletter/digest         — Send digest email (scheduled)
GET    /api/store/products            — List approved products
POST   /api/store/products            — Create product (auth: seller+)
PATCH  /api/store/products/[id]      — Edit product
DELETE /api/store/products/[id]      — Delete product
POST   /api/store/checkout            — Start Stripe checkout
POST   /api/store/reviews             — Submit review
POST   /api/webhook/stripe            — Stripe webhook
POST   /api/upload/presign            — Generate R2 presigned upload URL
POST   /api/upload                    — Fallback upload
GET    /api/upload/[key]              — Serve private R2 assets (auth-gated)
GET    /api/search                    — Global search
```

### Planned Routes (Phases 5-10)

```
# User Management & Account (Phase 5)
GET    /api/users/me/activity         — User's activity feed (XP events, comment replies)
PATCH  /api/users/me/settings         — Update notification/privacy preferences
DELETE /api/users/me                  — Delete account (GDPR)
GET    /api/users/me/export           — Export user data (JSON)
POST   /api/users/[id]/follow         — Follow/unfollow user
GET    /api/users/[id]/followers      — List user's followers
GET    /api/users/[id]/following      — List who user follows
POST   /api/users/me/role-request     — Request role upgrade (seller/author)
POST   /api/reports                   — Report content (post, comment, project, product)
GET    /api/admin/reports             — Admin: list reported content
PATCH  /api/admin/reports/[id]        — Admin: resolve report
GET    /api/admin/audit-log           — Admin: audit log of all actions
GET    /api/admin/users/export        — Admin: export users CSV
PATCH  /api/admin/users/bulk          — Admin: bulk role change / bulk email

# Social & Engagement (Phase 6)
GET    /api/notifications             — List user's notifications (paginated)
PATCH  /api/notifications/read        — Mark notifications as read
POST   /api/showcase/projects/[id]/vote — Upvote/downvote project
POST   /api/referrals                 — Generate referral link
GET    /api/referrals/stats           — Referral stats for user
GET    /api/challenges                — List active community challenges
POST   /api/challenges/[id]/submit    — Submit entry for challenge
GET    /api/users/me/collections      — List user's collections
POST   /api/users/me/collections      — Create collection
PATCH  /api/users/me/collections/[id] — Add/remove items from collection

# Content & Discovery (Phase 7)
GET    /api/blog/posts/[id]/related   — Related posts suggestions
GET    /api/blog/series               — List content series
GET    /api/blog/posts/[id]/revisions — Post revision history
POST   /api/blog/posts/[id]/autosave  — Autosave draft
GET    /api/analytics/posts/[id]      — Per-post analytics (auth: author+)
GET    /api/analytics/projects/[id]   — Per-project analytics

# Marketplace Enhancements (Phase 8)
POST   /api/store/subscriptions       — Create subscription checkout
DELETE /api/store/subscriptions       — Cancel subscription
GET    /api/store/seller/analytics    — Seller analytics (sales, revenue)
POST   /api/store/products/[id]/update — Push product update
POST   /api/store/coupons             — Create coupon code
POST   /api/store/refunds             — Request refund
PATCH  /api/store/refunds/[id]        — Approve/reject refund
GET    /api/store/wishlist            — Get user's wishlist
POST   /api/store/wishlist            — Add/remove product from wishlist

# Growth & Community (Phase 10)
GET    /api/v1/leaderboard            — Public API: leaderboard
GET    /api/v1/users/[id]             — Public API: user profile
GET    /api/v1/projects               — Public API: project gallery
GET    /api/events                    — Community events calendar
POST   /api/admin/events              — Create community event
```

---

## Gamification System

**XP Values (existing):** blog_post_published (50), blog_comment (5), project_submitted (30), project_featured (100), product_sold (20), product_reviewed (10), daily_login (5), streak_7_days (50), streak_30_days (200), referred_user (25), community_helper (15).

**XP Values (planned):** challenge_entry (20), challenge_winner (200), first_follower (10), 10_followers (50), 100_followers (200), helpful_report (10), series_completed (75), profile_verified (50).

**Levels:** 1-Noob (0), 2-Script Kiddie (100), 3-Vibe Coder (300), 4-Prompt Whisperer (600), 5-AI Tamer (1000), 6-Code Wizard (2000), 7-Agent Builder (4000), 8-Tuga Master (8000), 9-Vibe Lord (15000), 10-Lenda (30000).

**Badges (existing):** First Post, First Sale, 7-Day Streak, 30-Day Streak, Top Seller, Community Star, OG Member, etc.

**Badges (planned):** Challenge Champion, Social Butterfly (50 followers), Curator (10 collections), Mentor (50 helpful reports), Referral King (10 referrals), Series Author (complete a content series), Verified Member, Event Organizer.

---

## Git Workflow

### Branch Strategy

```
main                    ← Production (automatic deploy via Vercel)
├── develop             ← Integration branch
│   ├── feature/xxx     ← New feature
│   ├── fix/xxx         ← Bug fix
│   ├── refactor/xxx    ← Refactoring
│   └── content/xxx     ← Content (blog posts, copy)
```

### Commit & Merge Rules

**REQUIRED for every completed task:**

1. **Create branch** from `develop`:

   ```bash
   git checkout develop && git pull origin develop && git checkout -b feature/feature-name
   ```

2. **Semantic commits** (Conventional Commits): `feat:`, `fix:`, `refactor:`, `style:`, `docs:`, `chore:`

3. **Push and create PR** → `feature/xxx → develop`

4. **PR Review** — Verify: compiles, TS types correct, no console.logs, follows project patterns

5. **Merge to develop**: `git merge --no-ff feature/feature-name`

6. **Release to main** (when stable): `git merge --no-ff develop` + `git tag -a v0.X.0`

### Pre-commit Checklist

- [ ] `npm run build` passes
- [ ] `npm run lint` has no warnings
- [ ] TypeScript types correct
- [ ] No leftover `console.log` or `TODO`
- [ ] Env vars documented if new
- [ ] DB migrations created if schema changed

---

## Build Phases

> **Priority:** Community first, monetization last. The store/marketplace is the final phase.

### Phase 1: Foundation (#1-#8) ✅ COMPLETE

**Goal:** Deployed site with Discord login, neon-hacker layout, and working navigation.

- ✅ #1 Initialize Next.js 16 + TypeScript + Tailwind + shadcn/ui
- ✅ #2 Configure Neon DB + Drizzle ORM + base schema (users)
- ✅ #3 Implement NextAuth with Discord OAuth
- ✅ #4 Create base layout: Header, Footer, dark neon theme
- ✅ #5 Create placeholder pages (home, blog, showcase, leaderboard, newsletter)
- ✅ #6 Setup Vercel deployment (automatic CI/CD)
- ✅ #7 Configure ESLint, Prettier, Husky pre-commit hooks
- ✅ #8 Implement basic role system (auth middleware)

### Phase 2: Blog & Admin (#9-#22) ✅ COMPLETE

**Goal:** Publishable blog with admin panel, 3 author types, and polished UX.

- ✅ #9 Complete blog schema (posts, categories, comments) + migrations
- ✅ #10 Admin dashboard with stats overview
- ✅ #11 Admin blog posts CRUD with Tiptap editor
- ✅ #12 Public post listing page (filters, pagination)
- ✅ #13 Individual post page (SEO, dynamic OG image)
- ✅ #14 Categories and tags system
- ✅ #15 Threaded comments system
- ✅ #16 Post likes/bookmarks
- ✅ #17 Community/guest post submission flow
- ✅ #18 Admin: approve/reject community posts
- ✅ #19 User management in admin (roles, ban)
- ✅ #20 Automatic RSS feed and sitemap
- ✅ #21 Full-text search on posts
- ✅ #22 Complete responsive design for blog

### Phase 3: Community — Showcase, Gamification & Newsletter (#23-#40) ✅ COMPLETE

**Goal:** Living community with showcase, gamification, newsletter, and impactful homepage.

- ✅ #23-#28 Project showcase: schema, gallery, project page, submission flow, admin, R2 image upload
- ✅ #29-#34 Gamification: XP/badges/levels schema, XP triggers, leaderboard page, badges system, public profile, level-colored avatar rings
- ✅ #35-#39 Newsletter: schema, landing page, subscription, admin campaigns (Resend), automation (welcome, digest)
- ✅ #40 Complete homepage: animated hero, community stats, featured content, leaderboard widget, Discord CTA

### Phase 4: Marketplace & Polish (#41-#55) ⚠️ PARTIAL

**Goal:** Complete application with marketplace, polished, secure, and production-ready.

- ✅ #41-#50 Store: schema, Stripe integration, product listing/detail, checkout, download (R2 presigned), seller dashboard, reviews, admin, webhooks
- #51 Animations/effects polish (page transitions, micro-interactions)
- #52 Complete SEO (dynamic OG images, structured data/JSON-LD, canonical URLs)
- #53 Error/loading/empty states for all pages
- #54 Performance audit (Core Web Vitals, image optimization, bundle analysis)
- #55 Security audit (rate limiting, CSRF, XSS, input sanitization)
- Dashboard navigation from main UI — add "Dashboard" link to UserMenu (desktop + mobile) so authenticated users can reach their dashboard (products, projects, purchases, profile) without manually navigating to /dashboard

### Phase 5: User Management & Moderation (#56-#68)

**Goal:** Robust user management, self-service account features, and moderation tools.

- #56 User dashboard home — activity feed showing recent XP events, comments on user's posts, new followers
- #57 User settings page — email preferences, notification toggles, privacy settings, theme preference
- #58 Account deletion / data export — GDPR-compliant self-service account deletion and data export (JSON)
- #59 User-to-user follow system — follow/unfollow users, followers/following lists on profile
- #60 User activity log — admin view of all actions per user (posts, comments, purchases, reports)
- #61 Content reporting system — users can report posts, comments, projects, products, and reviews with reason categories
- #62 Admin moderation queue — unified queue for all reported content (posts, comments, projects, reviews) with bulk actions
- #63 Comment moderation — edit/delete any comment, auto-flag comments with links or profanity, shadow-ban capability
- #64 IP-based rate limiting — per-endpoint rate limits (auth, comments, submissions) using upstash/ratelimit or similar
- #65 Admin audit log — track all admin/moderator actions (role changes, bans, approvals, deletions) with timestamps and actor
- #66 User role upgrade requests — members can request seller/author role via form, admin approves/rejects
- #67 Bulk user management — admin bulk actions: mass email, mass role change, export user list (CSV)
- #68 User profile verification — verified badge for recognized community members (manual admin grant)

### Phase 6: Social & Engagement (#69-#80)

**Goal:** Social features that increase retention, engagement, and community interaction.

- #69 Notification system — in-app notifications (bell icon) for: new followers, replies to comments, post approved, XP milestones, badge earned
- #70 Notification preferences API — per-type toggle (in-app, email) for each notification category
- #71 Real-time notifications — WebSocket or SSE for live notification delivery without page refresh
- #72 User mentions — @username in comments and posts, triggers notification to mentioned user
- #73 Direct messaging — private messages between users (inbox page, unread count in header)
- #74 Showcase project voting — upvote/downvote projects, sort by votes, prevent vote manipulation
- #75 Blog post sharing — native share button (Web Share API), copy link, share to Twitter/LinkedIn/Discord
- #76 Weekly digest email — automated weekly email summarizing new posts, top projects, leaderboard changes
- #77 Referral system — unique referral links per user, XP reward for referred signups, referral leaderboard
- #78 Community challenges — time-limited challenges (e.g. "build X in 48h"), submission + voting, prize badges
- #79 User collections — save/organize bookmarked posts and projects into named collections
- #80 Activity streaks enhancement — visual streak calendar (GitHub-style), streak freeze (1 per month), streak recovery challenges

### Phase 7: Content & Discovery (#81-#92)

**Goal:** Rich content experience with better discovery, SEO, and editorial tools.

- #81 Dynamic OG images — auto-generated OG images for posts, projects, and profiles using @vercel/og or satori
- #82 Structured data / JSON-LD — Article, Product, Person, BreadcrumbList schema markup on all relevant pages
- #83 Related content suggestions — "You might also like" on post pages and project pages based on tags/category
- #84 Content series/playlists — group blog posts into ordered series (e.g. "Intro to Vibe Coding" parts 1-5)
- #85 Table of contents — auto-generated TOC for long blog posts, sticky sidebar on desktop
- #86 Code syntax highlighting — proper syntax highlighting in blog posts with copy button and language badge
- #87 Blog post versioning — revision history for posts, diff view in admin, restore previous versions
- #88 Draft autosave — periodic autosave for blog post editor and product editor (localStorage + server)
- #89 Scheduled publishing — set future publish date for posts and newsletter campaigns
- #90 Content analytics dashboard — per-post/project analytics: views over time, referral sources, engagement rate
- #91 Tag pages — dedicated /blog/tag/[tag] pages with tag cloud on blog index
- #92 Multi-language support (i18n) — PT/EN language toggle, translated UI strings, posts can have language metadata

### Phase 8: Marketplace Enhancements (#93-#104)

**Goal:** Mature marketplace with subscriptions, seller tools, and buyer protections.

- #93 Stripe webhook hardening — idempotent webhook processing, retry handling, event logging, signature verification
- #94 Subscription/premium tier — recurring payments via Stripe, premium member perks (early access, exclusive content, no ads)
- #95 Seller analytics dashboard — sales over time chart, revenue breakdown, top products, buyer demographics
- #96 Product versioning & updates — sellers can push updates to existing products, buyers get notified
- #97 Product bundles — sellers can create bundles of multiple products at a discount
- #98 Coupon/discount codes — seller-created or admin-created discount codes with usage limits and expiry
- #99 Buyer purchase receipts — email receipt on purchase (Resend), downloadable invoice PDF
- #100 Refund flow — buyer can request refund within 14 days, seller/admin approves, Stripe refund API
- #101 Seller payout management — Stripe Connect for seller payouts, payout history, tax info collection
- #102 Product preview/demo — free preview content or demo for products before purchase
- #103 Wishlist — save products to wishlist, get notified on price changes or new products from followed sellers
- #104 Store categories & collections — admin-curated collections (e.g. "Best Agent Kits"), product categories with icons

### Phase 9: Infrastructure & DevOps (#105-#114)

**Goal:** Production-hardened infrastructure with monitoring, testing, and CI/CD.

- #105 Error monitoring — Sentry integration for client and server error tracking with source maps
- #106 Logging & observability — structured logging (pino), request tracing, Vercel analytics integration
- #107 Automated testing — unit tests (Vitest) for critical paths: auth, payments, XP calculations, API routes
- #108 E2E testing — Playwright tests for critical user flows: login, post creation, purchase, profile edit
- #109 Database backups & branching strategy — automated Neon backups, staging branch for testing migrations
- #110 CI/CD pipeline — GitHub Actions: lint, type-check, test, build on PR; auto-deploy preview on Vercel
- #111 Feature flags — simple feature flag system (DB or env-based) for gradual rollouts
- #112 CDN & caching strategy — Vercel Edge Config, stale-while-revalidate headers, R2 public bucket CDN
- #113 Database query optimization — add indexes for common queries, N+1 detection, connection pool tuning
- #114 Environment management — staging environment on Vercel, Neon branch per preview deploy

### Phase 10: Growth & Community Tools (#115-#125)

**Goal:** Tools for community growth, analytics, and self-sustaining engagement loops.

- #115 Admin analytics dashboard — site-wide metrics: DAU/MAU, new signups, content published, revenue, retention curves
- #116 Discord bot integration — sync roles/XP between VibeTuga and Discord, post notifications to channels
- #117 Public API — versioned REST API (v1) for community-built tools: user stats, leaderboard, project gallery
- #118 Embed widgets — embeddable leaderboard/profile/badge widgets for users' personal sites
- #119 Contributor program — formalized contributor roles, contributor page, special badges, monthly highlights
- #120 Community events calendar — events page with upcoming streams, workshops, challenges, meetups
- #121 Twitch/YouTube integration — auto-import stream schedule, live indicator in header, VOD links
- #122 SEO landing pages — dedicated landing pages for key terms: "vibe coding Portugal", "AI programming community PT"
- #123 Onboarding flow — guided first-time experience: connect Discord, set display name, pick interests, earn welcome badge
- #124 Privacy & legal pages — privacy policy, terms of service, cookie consent banner (GDPR-compliant)
- #125 Accessibility audit — full WCAG AA compliance review, screen reader testing, keyboard navigation for all flows

---

## Debugging Guide

| Issue                      | Likely Cause            | Solution                                                             |
| -------------------------- | ----------------------- | -------------------------------------------------------------------- |
| Discord OAuth fails        | Wrong redirect URI      | Check DISCORD_CLIENT_ID and callback URL in Discord Developer Portal |
| Neon DB connection timeout | Connection pooling      | Use `?sslmode=require` and connection pooler URL                     |
| Drizzle migration fails    | Schema out of sync      | `npx drizzle-kit push` or `npx drizzle-kit generate` + `migrate`     |
| Stripe webhook 400         | Wrong webhook secret    | Check STRIPE_WEBHOOK_SECRET, use `stripe listen --forward-to` in dev |
| Vercel build fails         | Wrong types             | Run `npm run build` locally first, fix TS errors                     |
| Images won't load          | next.config domains     | Add R2 public URL domain to `images.remotePatterns` in next.config   |
| Auth session null          | Missing NEXTAUTH_SECRET | Generate with `openssl rand -base64 32`                              |
| Hydration mismatch         | Server/client mismatch  | Check `use client` directives, dynamic imports with `ssr: false`     |
| R2 upload fails            | Wrong credentials/CORS  | Check R2 bucket CORS policy allows your app origin; verify keys      |

---

## Important Notes

1. **Neon DB branching** — Use Neon branches to test migrations without affecting production
2. **Stripe Test Mode** — Always develop in test mode, only switch to live before launch
3. **i18n** — Site initially in Portuguese (PT), Phase 7 adds EN language toggle
4. **Accessibility** — WCAG AA contrast and keyboard navigation despite neon/dark design
5. **Edge Cases** — Always handle: loading, empty, error, and offline states
6. **Caching** — Use Next.js ISR for blog posts and products (revalidate every 60s)
7. **Build priority** — Community and content first, monetization (store) last
8. **R2 uploads** — Use presigned URLs for direct browser-to-R2 uploads; never proxy large files through API routes
9. **R2 private files** — Product downloads in private bucket; short-lived presigned URLs after purchase verification
10. **Environment variables** — All vars documented in `.env.example`
11. **Documentation verification:** When in doubt about any library API, usage pattern, or breaking change — especially for Next.js 16, Drizzle ORM, NextAuth v5, or any other dependency — use **context7** MCP to fetch up-to-date documentation before writing code. Do not rely solely on training data; always verify against current docs.
12. **GDPR compliance** — Phase 5 adds account deletion and data export; collect only necessary data, respect unsubscribe
13. **Rate limiting** — Phase 5 adds per-endpoint rate limits; critical for auth, comments, submissions, and API endpoints
14. **Notifications** — Phase 6 introduces in-app + email notifications; always respect user preferences from `user_settings`
15. **Public API** — Phase 10 adds versioned REST API (v1); design with rate limits and API keys from the start
16. **Real-time features** — Phase 6 uses SSE for notifications; consider WebSocket upgrade if DMs require real-time chat

---

## Design Context

### Users

Portuguese-speaking developers, creators, and AI enthusiasts into vibe coding and agent-assisted development. They arrive via Discord, Twitch, or organic search. Builders who want to learn, showcase, discover tools, and compete on leaderboards. The job to be done is belonging to a tribe while leveling up AI-assisted development skills.

### Brand Personality

**Bold. Rebellious. Fun.** Underground hacker energy — breaks conventions, doesn't take itself too seriously. Confident and direct, never corporate. Feels like a crew, not a company. Portuguese identity = cultural pride and inside jokes, not decorative motifs.

**Emotional goals:** excitement on landing, pride when showcasing, competitive fire on leaderboard, belonging in community.

### Aesthetic Direction

**Visual tone:** Dark, electric, terminal-native. Neon on deep dark — with restraint, not generic "dark mode with glowing stuff."

**References:** Vercel/Linear (polish), Warp/Fig (terminal-native), Product Hunt/Indie Hackers (community), Hackathon/CTF sites (competitive).

**Anti-references:** Generic SaaS, over-designed Dribbble, old-school forums, "AI slop" aesthetic.

### Design Principles

1. **Earned intensity** — Every effect must serve a purpose. Restraint makes intensity hit harder.
2. **Terminal-native, not terminal-cosplay** — Authentic hacker aesthetic. Monospace for code, not body text.
3. **Community surfaces over marketing surfaces** — Show real activity over static copy.
4. **Competitive energy** — Gamification should create genuine motivation, not feel gimmicky.
5. **Portuguese pride, not Portuguese pastiche** — Cultural identity through tone, not decorative motifs.

**Accessibility:** WCAG AA — 4.5:1 contrast, keyboard navigation, `prefers-reduced-motion`, 44px touch targets.

---

## Git & PR Workflow

- **Never commit directly to `main`**
- For each task/feature, create a feature branch: `feat/<short-name>`
- Commit frequently with clear messages (Conventional Commits)
- When complete, use `/pr-management` to manage: branch → create → review → merge
- PR titles: concise (under 70 chars). Body: what changed + how to test.
- Remote: `git@github.com:ClaudeNightshifter/vibetuga.com-test.git`
- GitHub account: DPr00f

---

## Available Skills

Skills in `.claude/skills/` invoked via slash commands:

**Workflow:** `/scan` (code duplication)

**Design:** `/frontend-design`, `/animate`, `/arrange`, `/typeset`, `/colorize`, `/bolder`, `/quieter`, `/delight`, `/overdrive`, `/polish`, `/normalize`, `/extract`

**Quality:** `/audit`, `/optimize`, `/harden`, `/react-best-practices`, `/seo-optimizer`, `/simplify`

**Content & UX:** `/critique`, `/clarify`, `/onboard`, `/adapt`, `/distill`

**Setup:** `/theme-factory`, `/skill-creator`
