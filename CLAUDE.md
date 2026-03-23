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

### Store Tables (Phase 4 — Low Priority)

| Table             | Key Fields                                                                                                                                                       | Purpose             |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| `store_products`  | seller_id, title, slug, price_cents, product_type (`skill`/`auto_runner`/`agent_kit`/`prompt_pack`/`template`/`course`/`guide`/`other`), status, stripe_price_id | Digital marketplace |
| `subscriptions`   | user_id, plan (`monthly`/`yearly`), stripe_subscription_id, current_period_start/end                                                                             | Premium access      |
| `store_purchases` | buyer_id, product_id, price_paid_cents, stripe_payment_id                                                                                                        | Purchase records    |
| `store_reviews`   | product_id, reviewer_id, rating (1-5), is_verified_purchase                                                                                                      | Product reviews     |

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

| Role        | Blog                   | Store            | Showcase         | Admin      |
| ----------- | ---------------------- | ---------------- | ---------------- | ---------- |
| `member`    | Comment, submit post   | Buy, review      | Submit project   | —          |
| `author`    | Publish posts directly | Buy, review      | Submit project   | —          |
| `seller`    | Comment, submit post   | Sell + buy       | Submit project   | —          |
| `moderator` | Approve posts, edit    | Approve products | Approve projects | Partial    |
| `admin`     | Everything             | Everything       | Everything       | Everything |

Users can have multiple sub-roles via upgrade (e.g. member → seller).

---

## API Routes

```
POST   /api/auth/[...nextauth]      — Auth endpoints (NextAuth)
GET    /api/blog/posts               — List posts (paginated, filters)
POST   /api/blog/posts               — Create post (auth: author+)
PATCH  /api/blog/posts/[id]          — Edit post
DELETE /api/blog/posts/[id]          — Delete post
POST   /api/blog/posts/[id]/like     — Like/unlike post
POST   /api/blog/comments            — Create comment
GET    /api/showcase/projects         — List projects
POST   /api/showcase/projects         — Submit project
GET    /api/leaderboard               — Rankings
GET    /api/users/[id]/profile        — Public profile
PATCH  /api/users/me                  — Edit own profile
POST   /api/newsletter/subscribe      — Subscribe to newsletter
POST   /api/newsletter/campaigns      — Create campaign (auth: admin)
GET    /api/store/products            — List products (Phase 4)
POST   /api/store/products            — Create product (auth: seller+)
POST   /api/store/checkout            — Start Stripe checkout
POST   /api/store/reviews             — Submit review
POST   /api/webhook/stripe            — Stripe webhook
POST   /api/webhook/discord           — Discord webhook (optional)
POST   /api/upload/presign            — Generate R2 presigned upload URL
GET    /api/upload/[key]              — Serve private R2 assets (auth-gated)
GET    /api/search                    — Global search
```

---

## Gamification System

**XP Values:** blog_post_published (50), blog_comment (5), project_submitted (30), project_featured (100), product_sold (20), product_reviewed (10), daily_login (5), streak_7_days (50), streak_30_days (200), referred_user (25), community_helper (15).

**Levels:** 1-Noob (0), 2-Script Kiddie (100), 3-Vibe Coder (300), 4-Prompt Whisperer (600), 5-AI Tamer (1000), 6-Code Wizard (2000), 7-Agent Builder (4000), 8-Tuga Master (8000), 9-Vibe Lord (15000), 10-Lenda (30000).

**Badges:** First Post, First Sale, 7-Day Streak, 30-Day Streak, Top Seller, Community Star, OG Member, etc.

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

### Phase 1: Foundation (#1-#8)

**Goal:** Deployed site with Discord login, neon-hacker layout, and working navigation.

- #1 Initialize Next.js 16 + TypeScript + Tailwind + shadcn/ui
- #2 Configure Neon DB + Drizzle ORM + base schema (users)
- #3 Implement NextAuth with Discord OAuth
- #4 Create base layout: Header, Footer, dark neon theme
- #5 Create placeholder pages (home, blog, showcase, leaderboard, newsletter)
- #6 Setup Vercel deployment (automatic CI/CD)
- #7 Configure ESLint, Prettier, Husky pre-commit hooks
- #8 Implement basic role system (auth middleware)

### Phase 2: Blog & Admin (#9-#22)

**Goal:** Publishable blog with admin panel, 3 author types, and polished UX.

- #9 Complete blog schema (posts, categories, comments) + migrations
- #10 Admin dashboard with stats overview
- #11 Admin blog posts CRUD with Tiptap editor
- #12 Public post listing page (filters, pagination)
- #13 Individual post page (SEO, dynamic OG image)
- #14 Categories and tags system
- #15 Threaded comments system
- #16 Post likes/bookmarks
- #17 Community/guest post submission flow
- #18 Admin: approve/reject community posts
- #19 User management in admin (roles, ban)
- #20 Automatic RSS feed and sitemap
- #21 Full-text search on posts
- #22 Complete responsive design for blog

### Phase 3: Community — Showcase, Gamification & Newsletter (#23-#40)

**Goal:** Living community with showcase, gamification, newsletter, and impactful homepage.

- #23-#28 Project showcase: schema, gallery, project page, submission flow, admin, R2 image upload
- #29-#34 Gamification: XP/badges/levels schema, XP triggers, leaderboard page, badges system, public profile, level-colored avatar rings
- #35-#39 Newsletter: schema, landing page, subscription, admin campaigns (Resend), automation (welcome, digest)
- #40 Complete homepage: animated hero, community stats, featured content, leaderboard widget, Discord CTA

### Phase 4: Marketplace & Polish (#41-#55)

**Goal:** Complete application with marketplace, polished, secure, and production-ready.

- #41-#50 Store: schema, Stripe integration, product listing/detail, checkout, download (R2 presigned), seller dashboard, reviews, admin, webhooks
- #51-#55 Polish: animations/effects, complete SEO, error/loading/empty states, performance audit (Core Web Vitals), security audit (rate limiting, CSRF, XSS)

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
3. **i18n** — Site initially in Portuguese (PT), structure prepared for future English support
4. **Accessibility** — WCAG AA contrast and keyboard navigation despite neon/dark design
5. **Edge Cases** — Always handle: loading, empty, error, and offline states
6. **Caching** — Use Next.js ISR for blog posts and products (revalidate every 60s)
7. **Build priority** — Community and content first, monetization (store) last
8. **R2 uploads** — Use presigned URLs for direct browser-to-R2 uploads; never proxy large files through API routes
9. **R2 private files** — Product downloads in private bucket; short-lived presigned URLs after purchase verification
10. **Environment variables** — All vars documented in `.env.example`
11. **Documentation verification:** When in doubt about any library API, usage pattern, or breaking change — especially for Next.js 16, Drizzle ORM, NextAuth v5, or any other dependency — use **context7** MCP to fetch up-to-date documentation before writing code. Do not rely solely on training data; always verify against current docs.

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
