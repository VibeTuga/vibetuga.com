import {
  pgTable,
  text,
  varchar,
  integer,
  boolean,
  timestamp,
  pgEnum,
  primaryKey,
  uuid,
  serial,
  smallint,
  index,
  uniqueIndex,
  date,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import type { AdapterAccountType } from "@auth/core/adapters";

// ─── Enums ──────────────────────────────────────────────────

export const userRoleEnum = pgEnum("user_role", [
  "admin",
  "moderator",
  "author",
  "seller",
  "member",
]);

export const postStatusEnum = pgEnum("post_status", [
  "draft",
  "pending_review",
  "published",
  "archived",
]);

export const postTypeEnum = pgEnum("post_type", ["admin", "community", "guest"]);

export const projectStatusEnum = pgEnum("project_status", [
  "pending",
  "approved",
  "featured",
  "rejected",
]);

export const subscriberStatusEnum = pgEnum("subscriber_status", [
  "active",
  "unsubscribed",
  "bounced",
]);

export const campaignStatusEnum = pgEnum("campaign_status", [
  "draft",
  "scheduled",
  "sending",
  "sent",
  "failed",
]);

export const productTypeEnum = pgEnum("product_type", [
  "skill",
  "auto_runner",
  "agent_kit",
  "prompt_pack",
  "template",
  "course",
  "guide",
  "other",
]);

export const productStatusEnum = pgEnum("product_status", [
  "draft",
  "pending",
  "approved",
  "rejected",
  "archived",
]);

export const subscriptionPlanEnum = pgEnum("subscription_plan", ["monthly", "yearly"]);

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "active",
  "canceled",
  "past_due",
]);

export const roleRequestStatusEnum = pgEnum("role_request_status", [
  "pending",
  "approved",
  "rejected",
]);

// ─── Users ──────────────────────────────────────────────────

export const users = pgTable("user", {
  id: uuid("id").primaryKey().defaultRandom(),
  discordId: varchar("discord_id", { length: 255 }).unique().notNull(),
  discordUsername: varchar("discord_username", { length: 255 }).notNull(),
  discordAvatar: varchar("discord_avatar", { length: 255 }),
  email: varchar("email", { length: 255 }),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  displayName: varchar("display_name", { length: 255 }),
  bio: text("bio"),
  websiteUrl: varchar("website_url", { length: 512 }),
  image: text("image"),
  name: text("name"),
  role: userRoleEnum("role").default("member").notNull(),
  xpPoints: integer("xp_points").default(0).notNull(),
  level: integer("level").default(1).notNull(),
  streakDays: integer("streak_days").default(0).notNull(),
  isBanned: boolean("is_banned").default(false).notNull(),
  isVerified: boolean("is_verified").default(false).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ one, many }) => ({
  blogPosts: many(blogPosts),
  blogComments: many(blogComments),
  blogPostLikes: many(blogPostLikes),
  blogPostBookmarks: many(blogPostBookmarks),
  showcaseProjects: many(showcaseProjects),
  xpEvents: many(xpEvents),
  userBadges: many(userBadges),
  newsletterSubscriptions: many(newsletterSubscribers),
  storeProducts: many(storeProducts),
  storePurchases: many(storePurchases),
  storeReviews: many(storeReviews),
  storeWishlists: many(storeWishlists),
  subscriptions: many(subscriptions),
  settings: one(userSettings, {
    fields: [users.id],
    references: [userSettings.userId],
  }),
  roleRequests: many(roleRequests, { relationName: "roleRequestUser" }),
  roleRequestsReviewed: many(roleRequests, { relationName: "roleRequestReviewer" }),
  followers: many(userFollows, { relationName: "following" }),
  following: many(userFollows, { relationName: "follower" }),
  notifications: many(notifications, { relationName: "notificationRecipient" }),
  actedNotifications: many(notifications, { relationName: "notificationActor" }),
  projectVotes: many(projectVotes),
  referralsMade: many(referrals, { relationName: "referralsMade" }),
  referralsReceived: many(referrals, { relationName: "referralsReceived" }),
  collections: many(collections),
  sentMessages: many(directMessages, { relationName: "sentMessages" }),
  receivedMessages: many(directMessages, { relationName: "receivedMessages" }),
  challengeEntries: many(challengeEntries),
  challengeEntryVotes: many(challengeEntryVotes),
  blogSeries: many(blogSeries),
  blogRevisions: many(blogRevisions),
}));

// ─── NextAuth Required Tables ───────────────────────────────

export const accounts = pgTable(
  "account",
  {
    userId: uuid("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    {
      compoundKey: primaryKey({
        columns: [account.provider, account.providerAccountId],
      }),
    },
  ],
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: uuid("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (verificationToken) => [
    {
      compositePk: primaryKey({
        columns: [verificationToken.identifier, verificationToken.token],
      }),
    },
  ],
);

// ─── Blog Categories ────────────────────────────────────────

export const blogCategories = pgTable("blog_category", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).unique().notNull(),
  description: text("description"),
  color: varchar("color", { length: 7 }).notNull(),
  icon: varchar("icon", { length: 50 }),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const blogCategoriesRelations = relations(blogCategories, ({ many }) => ({
  posts: many(blogPosts),
}));

// ─── Blog Posts ─────────────────────────────────────────────

export const blogPosts = pgTable("blog_post", {
  id: uuid("id").primaryKey().defaultRandom(),
  authorId: uuid("author_id")
    .notNull()
    .references(() => users.id),
  categoryId: uuid("category_id").references(() => blogCategories.id),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).unique().notNull(),
  excerpt: text("excerpt"),
  content: text("content").notNull(),
  status: postStatusEnum("status").default("draft").notNull(),
  postType: postTypeEnum("post_type").default("community").notNull(),
  tags: text("tags").array(),
  coverImage: text("cover_image"),
  readingTimeMinutes: integer("reading_time_minutes").default(0).notNull(),
  viewsCount: integer("views_count").default(0).notNull(),
  likesCount: integer("likes_count").default(0).notNull(),
  publishedAt: timestamp("published_at", { mode: "date" }),
  scheduledPublishAt: timestamp("scheduled_publish_at", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const blogPostsRelations = relations(blogPosts, ({ one, many }) => ({
  author: one(users, {
    fields: [blogPosts.authorId],
    references: [users.id],
  }),
  category: one(blogCategories, {
    fields: [blogPosts.categoryId],
    references: [blogCategories.id],
  }),
  comments: many(blogComments),
  likes: many(blogPostLikes),
  bookmarks: many(blogPostBookmarks),
  seriesEntries: many(blogSeriesPosts),
  revisions: many(blogRevisions),
}));

// ─── Blog Comments ──────────────────────────────────────────

export const blogComments = pgTable("blog_comment", {
  id: uuid("id").primaryKey().defaultRandom(),
  postId: uuid("post_id")
    .notNull()
    .references(() => blogPosts.id, { onDelete: "cascade" }),
  authorId: uuid("author_id")
    .notNull()
    .references(() => users.id),
  parentId: uuid("parent_id").references((): AnyPgColumn => blogComments.id),
  content: text("content").notNull(),
  isApproved: boolean("is_approved").default(true).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const blogCommentsRelations = relations(blogComments, ({ one, many }) => ({
  post: one(blogPosts, {
    fields: [blogComments.postId],
    references: [blogPosts.id],
  }),
  author: one(users, {
    fields: [blogComments.authorId],
    references: [users.id],
  }),
  parent: one(blogComments, {
    fields: [blogComments.parentId],
    references: [blogComments.id],
    relationName: "commentThread",
  }),
  children: many(blogComments, {
    relationName: "commentThread",
  }),
}));

// ─── Blog Post Likes ────────────────────────────────────────

export const blogPostLikes = pgTable(
  "blog_post_like",
  {
    postId: uuid("post_id")
      .notNull()
      .references(() => blogPosts.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.postId, t.userId] })],
);

export const blogPostLikesRelations = relations(blogPostLikes, ({ one }) => ({
  post: one(blogPosts, {
    fields: [blogPostLikes.postId],
    references: [blogPosts.id],
  }),
  user: one(users, {
    fields: [blogPostLikes.userId],
    references: [users.id],
  }),
}));

// ─── Blog Post Bookmarks ────────────────────────────────────

export const blogPostBookmarks = pgTable(
  "blog_post_bookmark",
  {
    postId: uuid("post_id")
      .notNull()
      .references(() => blogPosts.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.postId, t.userId] })],
);

export const blogPostBookmarksRelations = relations(blogPostBookmarks, ({ one }) => ({
  post: one(blogPosts, {
    fields: [blogPostBookmarks.postId],
    references: [blogPosts.id],
  }),
  user: one(users, {
    fields: [blogPostBookmarks.userId],
    references: [users.id],
  }),
}));

// ─── Showcase Projects ─────────────────────────────────────

export const showcaseProjects = pgTable("showcase_project", {
  id: uuid("id").primaryKey().defaultRandom(),
  authorId: uuid("author_id")
    .notNull()
    .references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).unique().notNull(),
  description: text("description"),
  coverImage: text("cover_image"),
  galleryImages: text("gallery_images").array(),
  liveUrl: varchar("live_url", { length: 512 }),
  repoUrl: varchar("repo_url", { length: 512 }),
  videoUrl: varchar("video_url", { length: 512 }),
  techStack: text("tech_stack").array(),
  aiToolsUsed: text("ai_tools_used").array(),
  status: projectStatusEnum("status").default("pending").notNull(),
  votesCount: integer("votes_count").default(0).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const showcaseProjectsRelations = relations(showcaseProjects, ({ one, many }) => ({
  author: one(users, {
    fields: [showcaseProjects.authorId],
    references: [users.id],
  }),
  votes: many(projectVotes),
}));

// ─── Project Votes ───────────────────────────────────────────

export const projectVotes = pgTable(
  "project_vote",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => showcaseProjects.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    voteType: varchar("vote_type", { length: 10 }).notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("project_vote_project_user_idx").on(t.projectId, t.userId),
    index("project_vote_user_idx").on(t.userId),
  ],
);

export const projectVotesRelations = relations(projectVotes, ({ one }) => ({
  project: one(showcaseProjects, {
    fields: [projectVotes.projectId],
    references: [showcaseProjects.id],
  }),
  user: one(users, {
    fields: [projectVotes.userId],
    references: [users.id],
  }),
}));

// ─── XP Events ──────────────────────────────────────────────

export const xpEvents = pgTable("xp_event", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  action: varchar("action", { length: 100 }).notNull(),
  xpAmount: integer("xp_amount").notNull(),
  referenceId: uuid("reference_id"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const xpEventsRelations = relations(xpEvents, ({ one }) => ({
  user: one(users, {
    fields: [xpEvents.userId],
    references: [users.id],
  }),
}));

// ─── Badges ─────────────────────────────────────────────────

export const badges = pgTable("badge", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).unique().notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 50 }),
  criteria: text("criteria"),
  xpReward: integer("xp_reward").default(0).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const badgesRelations = relations(badges, ({ many }) => ({
  userBadges: many(userBadges),
}));

// ─── User Badges ─────────────────────────────────────────────

export const userBadges = pgTable(
  "user_badge",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    badgeId: uuid("badge_id")
      .notNull()
      .references(() => badges.id, { onDelete: "cascade" }),
    awardedAt: timestamp("awarded_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.badgeId] })],
);

export const userBadgesRelations = relations(userBadges, ({ one }) => ({
  user: one(users, {
    fields: [userBadges.userId],
    references: [users.id],
  }),
  badge: one(badges, {
    fields: [userBadges.badgeId],
    references: [badges.id],
  }),
}));

// ─── Levels ──────────────────────────────────────────────────

export const levels = pgTable("level", {
  level: integer("level").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  xpRequired: integer("xp_required").notNull(),
  perks: text("perks"),
});

// ─── Newsletter Subscribers ──────────────────────────────────

export const newsletterSubscribers = pgTable("newsletter_subscriber", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  status: subscriberStatusEnum("status").default("active").notNull(),
  source: varchar("source", { length: 100 }).default("website").notNull(),
  subscribedAt: timestamp("subscribed_at", { mode: "date" }).defaultNow().notNull(),
  unsubscribedAt: timestamp("unsubscribed_at", { mode: "date" }),
});

export const newsletterSubscribersRelations = relations(newsletterSubscribers, ({ one }) => ({
  user: one(users, {
    fields: [newsletterSubscribers.userId],
    references: [users.id],
  }),
}));

// ─── Newsletter Campaigns ────────────────────────────────────

export const newsletterCampaigns = pgTable("newsletter_campaign", {
  id: uuid("id").primaryKey().defaultRandom(),
  subject: varchar("subject", { length: 255 }).notNull(),
  content: text("content").notNull(),
  status: campaignStatusEnum("status").default("draft").notNull(),
  sentCount: integer("sent_count").default(0).notNull(),
  openCount: integer("open_count").default(0).notNull(),
  clickCount: integer("click_count").default(0).notNull(),
  scheduledAt: timestamp("scheduled_at", { mode: "date" }),
  sentAt: timestamp("sent_at", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

// ─── Store Products ────────────────────────────────────────

export const storeProducts = pgTable(
  "store_product",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sellerId: uuid("seller_id")
      .notNull()
      .references(() => users.id),
    title: varchar("title", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).unique().notNull(),
    description: text("description"),
    priceCents: integer("price_cents").notNull(),
    productType: productTypeEnum("product_type").default("other").notNull(),
    status: productStatusEnum("status").default("draft").notNull(),
    stripePriceId: varchar("stripe_price_id", { length: 255 }),
    downloadKey: varchar("download_key", { length: 512 }),
    coverImage: text("cover_image"),
    tags: text("tags").array(),
    isBundle: boolean("is_bundle").default(false).notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => [
    index("store_product_seller_idx").on(t.sellerId),
    index("store_product_slug_idx").on(t.slug),
    index("store_product_status_idx").on(t.status),
    index("store_product_type_idx").on(t.productType),
  ],
);

export const storeProductsRelations = relations(storeProducts, ({ one, many }) => ({
  seller: one(users, {
    fields: [storeProducts.sellerId],
    references: [users.id],
  }),
  purchases: many(storePurchases),
  reviews: many(storeReviews),
  wishlists: many(storeWishlists),
  bundleItems: many(storeBundleItems, { relationName: "bundleProducts" }),
  includedInBundles: many(storeBundleItems, { relationName: "bundledProduct" }),
  collectionProducts: many(storeCollectionProducts),
}));

// ─── Store Purchases ───────────────────────────────────────

export const storePurchases = pgTable(
  "store_purchase",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    buyerId: uuid("buyer_id")
      .notNull()
      .references(() => users.id),
    productId: uuid("product_id")
      .notNull()
      .references(() => storeProducts.id),
    pricePaidCents: integer("price_paid_cents").notNull(),
    stripePaymentId: varchar("stripe_payment_id", { length: 255 }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => [
    index("store_purchase_buyer_idx").on(t.buyerId),
    index("store_purchase_product_idx").on(t.productId),
  ],
);

export const storePurchasesRelations = relations(storePurchases, ({ one }) => ({
  buyer: one(users, {
    fields: [storePurchases.buyerId],
    references: [users.id],
  }),
  product: one(storeProducts, {
    fields: [storePurchases.productId],
    references: [storeProducts.id],
  }),
}));

// ─── Store Reviews ─────────────────────────────────────────

export const storeReviews = pgTable(
  "store_review",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => storeProducts.id, { onDelete: "cascade" }),
    reviewerId: uuid("reviewer_id")
      .notNull()
      .references(() => users.id),
    rating: smallint("rating").notNull(),
    comment: text("comment"),
    isVerifiedPurchase: boolean("is_verified_purchase").default(false).notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => [
    index("store_review_product_idx").on(t.productId),
    index("store_review_reviewer_idx").on(t.reviewerId),
  ],
);

export const storeReviewsRelations = relations(storeReviews, ({ one }) => ({
  product: one(storeProducts, {
    fields: [storeReviews.productId],
    references: [storeProducts.id],
  }),
  reviewer: one(users, {
    fields: [storeReviews.reviewerId],
    references: [users.id],
  }),
}));

// ─── Subscriptions ─────────────────────────────────────────

export const subscriptions = pgTable(
  "subscription",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    plan: subscriptionPlanEnum("plan").notNull(),
    stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }),
    stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
    status: subscriptionStatusEnum("status").default("active").notNull(),
    currentPeriodStart: timestamp("current_period_start", { mode: "date" }).notNull(),
    currentPeriodEnd: timestamp("current_period_end", { mode: "date" }).notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => [
    index("subscription_user_idx").on(t.userId),
    index("subscription_stripe_idx").on(t.stripeSubscriptionId),
  ],
);

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
}));

// ─── Privacy Level Enum ──────────────────────────────────────

export const privacyLevelEnum = pgEnum("privacy_level", ["public", "members", "private"]);

// ─── User Settings ──────────────────────────────────────────

export const userSettings = pgTable("user_setting", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  emailNotifications: boolean("email_notifications").default(true).notNull(),
  inAppNotifications: boolean("in_app_notifications").default(true).notNull(),
  privacyLevel: privacyLevelEnum("privacy_level").default("public").notNull(),
  locale: varchar("locale", { length: 10 }).default("pt").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const userSettingsRelations = relations(userSettings, ({ one }) => ({
  user: one(users, {
    fields: [userSettings.userId],
    references: [users.id],
  }),
}));

// ─── Role Requests ──────────────────────────────────────────

export const roleRequests = pgTable(
  "role_request",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    requestedRole: userRoleEnum("requested_role").notNull(),
    reason: text("reason").notNull(),
    status: roleRequestStatusEnum("status").default("pending").notNull(),
    reviewedBy: uuid("reviewed_by").references(() => users.id, {
      onDelete: "set null",
    }),
    reviewNote: text("review_note"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => [
    index("role_request_user_idx").on(t.userId),
    index("role_request_status_idx").on(t.status),
  ],
);

export const roleRequestsRelations = relations(roleRequests, ({ one }) => ({
  user: one(users, {
    fields: [roleRequests.userId],
    references: [users.id],
    relationName: "roleRequestUser",
  }),
  reviewer: one(users, {
    fields: [roleRequests.reviewedBy],
    references: [users.id],
    relationName: "roleRequestReviewer",
  }),
}));

// ─── Reports ─────────────────────────────────────────────────

export const reportStatusEnum = pgEnum("report_status", ["pending", "resolved", "dismissed"]);

export const reports = pgTable(
  "report",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    reporterId: uuid("reporter_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    contentType: varchar("content_type", { length: 50 }).notNull(),
    contentId: uuid("content_id").notNull(),
    reason: varchar("reason", { length: 100 }).notNull(),
    details: text("details"),
    status: reportStatusEnum("status").default("pending").notNull(),
    resolvedBy: uuid("resolved_by").references(() => users.id, {
      onDelete: "set null",
    }),
    resolvedNote: text("resolved_note"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => [
    index("report_reporter_idx").on(t.reporterId),
    index("report_content_idx").on(t.contentType, t.contentId),
    index("report_status_idx").on(t.status),
  ],
);

export const reportsRelations = relations(reports, ({ one }) => ({
  reporter: one(users, {
    fields: [reports.reporterId],
    references: [users.id],
    relationName: "reportReporter",
  }),
  resolver: one(users, {
    fields: [reports.resolvedBy],
    references: [users.id],
    relationName: "reportResolver",
  }),
}));

// ─── User Follows ────────────────────────────────────────────

export const userFollows = pgTable(
  "user_follow",
  {
    followerId: uuid("follower_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    followingId: uuid("following_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.followerId, t.followingId] })],
);

export const userFollowsRelations = relations(userFollows, ({ one }) => ({
  follower: one(users, {
    fields: [userFollows.followerId],
    references: [users.id],
    relationName: "follower",
  }),
  following: one(users, {
    fields: [userFollows.followingId],
    references: [users.id],
    relationName: "following",
  }),
}));

// ─── Admin Audit Log ─────────────────────────────────────────

export const adminAuditLog = pgTable(
  "admin_audit_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    actorId: uuid("actor_id").references(() => users.id, {
      onDelete: "set null",
    }),
    action: varchar("action", { length: 100 }).notNull(),
    targetType: varchar("target_type", { length: 50 }).notNull(),
    targetId: varchar("target_id", { length: 255 }).notNull(),
    details: text("details"),
    ipAddress: varchar("ip_address", { length: 45 }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => [
    index("audit_log_actor_idx").on(t.actorId),
    index("audit_log_created_idx").on(t.createdAt),
    index("audit_log_action_idx").on(t.action),
  ],
);

export const adminAuditLogRelations = relations(adminAuditLog, ({ one }) => ({
  actor: one(users, {
    fields: [adminAuditLog.actorId],
    references: [users.id],
  }),
}));

// ─── Notifications ──────────────────────────────────────────

export const notifications = pgTable(
  "notification",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 50 }).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    body: text("body"),
    link: varchar("link", { length: 500 }),
    isRead: boolean("is_read").default(false).notNull(),
    actorId: uuid("actor_id").references(() => users.id, {
      onDelete: "set null",
    }),
    referenceId: varchar("reference_id", { length: 255 }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => [
    index("notification_user_read_idx").on(t.userId, t.isRead),
    index("notification_user_created_idx").on(t.userId, t.createdAt),
  ],
);

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
    relationName: "notificationRecipient",
  }),
  actor: one(users, {
    fields: [notifications.actorId],
    references: [users.id],
    relationName: "notificationActor",
  }),
}));

// ─── Referrals ──────────────────────────────────────────────

export const referralStatusEnum = pgEnum("referral_status", ["pending", "completed", "expired"]);

export const referrals = pgTable(
  "referral",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    referrerId: uuid("referrer_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    referredUserId: uuid("referred_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    referralCode: varchar("referral_code", { length: 50 }).unique().notNull(),
    status: referralStatusEnum("status").default("pending").notNull(),
    xpAwarded: integer("xp_awarded").default(0).notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    completedAt: timestamp("completed_at", { mode: "date" }),
  },
  (t) => [
    index("referral_referrer_idx").on(t.referrerId),
    index("referral_code_idx").on(t.referralCode),
    index("referral_status_idx").on(t.status),
  ],
);

export const referralsRelations = relations(referrals, ({ one }) => ({
  referrer: one(users, {
    fields: [referrals.referrerId],
    references: [users.id],
    relationName: "referralsMade",
  }),
  referredUser: one(users, {
    fields: [referrals.referredUserId],
    references: [users.id],
    relationName: "referralsReceived",
  }),
}));

// ─── Collections ────────────────────────────────────────────

export const collections = pgTable(
  "collection",
  {
    id: serial("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 100 }).notNull(),
    description: text("description"),
    isPublic: boolean("is_public").default(false).notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => [index("collection_user_idx").on(t.userId)],
);

export const collectionsRelations = relations(collections, ({ one, many }) => ({
  user: one(users, {
    fields: [collections.userId],
    references: [users.id],
  }),
  items: many(collectionItems),
}));

// ─── Collection Items ───────────────────────────────────────

export const collectionItems = pgTable(
  "collection_item",
  {
    id: serial("id").primaryKey(),
    collectionId: integer("collection_id")
      .notNull()
      .references(() => collections.id, { onDelete: "cascade" }),
    itemType: varchar("item_type", { length: 50 }).notNull(),
    itemId: varchar("item_id", { length: 255 }).notNull(),
    addedAt: timestamp("added_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("collection_item_unique_idx").on(t.collectionId, t.itemType, t.itemId),
    index("collection_item_collection_idx").on(t.collectionId),
  ],
);

export const collectionItemsRelations = relations(collectionItems, ({ one }) => ({
  collection: one(collections, {
    fields: [collectionItems.collectionId],
    references: [collections.id],
  }),
}));

// ─── Direct Messages ───────────────────────────────────────

// ─── Challenges ─────────────────────────────────────────────

export const challengeStatusEnum = pgEnum("challenge_status", [
  "draft",
  "active",
  "voting",
  "completed",
]);

export const challengeEntryStatusEnum = pgEnum("challenge_entry_status", [
  "submitted",
  "winner",
  "disqualified",
]);

export const challenges = pgTable(
  "challenge",
  {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 200 }).notNull(),
    description: text("description").notNull(),
    startAt: timestamp("start_at", { mode: "date" }).notNull(),
    endAt: timestamp("end_at", { mode: "date" }).notNull(),
    badgeRewardId: uuid("badge_reward_id").references(() => badges.id, {
      onDelete: "set null",
    }),
    xpReward: integer("xp_reward").default(0).notNull(),
    status: challengeStatusEnum("status").default("draft").notNull(),
    createdBy: uuid("created_by").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => [index("challenge_status_idx").on(t.status), index("challenge_start_idx").on(t.startAt)],
);

export const challengesRelations = relations(challenges, ({ one, many }) => ({
  badgeReward: one(badges, {
    fields: [challenges.badgeRewardId],
    references: [badges.id],
  }),
  creator: one(users, {
    fields: [challenges.createdBy],
    references: [users.id],
  }),
  entries: many(challengeEntries),
}));

export const challengeEntries = pgTable(
  "challenge_entry",
  {
    id: serial("id").primaryKey(),
    challengeId: integer("challenge_id")
      .notNull()
      .references(() => challenges.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    submissionUrl: varchar("submission_url", { length: 500 }).notNull(),
    description: text("description"),
    votesCount: integer("votes_count").default(0).notNull(),
    status: challengeEntryStatusEnum("status").default("submitted").notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("challenge_entry_unique_idx").on(t.challengeId, t.userId),
    index("challenge_entry_challenge_idx").on(t.challengeId),
    index("challenge_entry_user_idx").on(t.userId),
  ],
);

export const challengeEntriesRelations = relations(challengeEntries, ({ one }) => ({
  challenge: one(challenges, {
    fields: [challengeEntries.challengeId],
    references: [challenges.id],
  }),
  user: one(users, {
    fields: [challengeEntries.userId],
    references: [users.id],
  }),
}));

// ─── Challenge Entry Votes ──────────────────────────────────

export const challengeEntryVotes = pgTable(
  "challenge_entry_vote",
  {
    entryId: integer("entry_id")
      .notNull()
      .references(() => challengeEntries.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.entryId, t.userId] }),
    index("challenge_entry_vote_user_idx").on(t.userId),
  ],
);

export const challengeEntryVotesRelations = relations(challengeEntryVotes, ({ one }) => ({
  entry: one(challengeEntries, {
    fields: [challengeEntryVotes.entryId],
    references: [challengeEntries.id],
  }),
  user: one(users, {
    fields: [challengeEntryVotes.userId],
    references: [users.id],
  }),
}));

// ─── Direct Messages ───────────────────────────────────────

export const directMessages = pgTable(
  "direct_message",
  {
    id: serial("id").primaryKey(),
    senderId: uuid("sender_id").references(() => users.id, {
      onDelete: "set null",
    }),
    recipientId: uuid("recipient_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    isRead: boolean("is_read").default(false).notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => [
    index("dm_recipient_read_idx").on(t.recipientId, t.isRead),
    index("dm_conversation_idx").on(t.senderId, t.recipientId, t.createdAt),
  ],
);

export const directMessagesRelations = relations(directMessages, ({ one }) => ({
  sender: one(users, {
    fields: [directMessages.senderId],
    references: [users.id],
    relationName: "sentMessages",
  }),
  recipient: one(users, {
    fields: [directMessages.recipientId],
    references: [users.id],
    relationName: "receivedMessages",
  }),
}));

// ─── Blog Series ──────────────────────────────────────────

export const blogSeries = pgTable(
  "blog_series",
  {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 200 }).notNull(),
    slug: varchar("slug", { length: 200 }).unique().notNull(),
    description: text("description"),
    coverImage: varchar("cover_image", { length: 500 }),
    authorId: uuid("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => [index("blog_series_author_idx").on(t.authorId), index("blog_series_slug_idx").on(t.slug)],
);

export const blogSeriesRelations = relations(blogSeries, ({ one, many }) => ({
  author: one(users, {
    fields: [blogSeries.authorId],
    references: [users.id],
  }),
  posts: many(blogSeriesPosts),
}));

// ─── Blog Series Posts ────────────────────────────────────

export const blogSeriesPosts = pgTable(
  "blog_series_post",
  {
    id: serial("id").primaryKey(),
    seriesId: integer("series_id")
      .notNull()
      .references(() => blogSeries.id, { onDelete: "cascade" }),
    postId: uuid("post_id")
      .notNull()
      .references(() => blogPosts.id, { onDelete: "cascade" }),
    order: integer("order").notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("blog_series_post_unique_idx").on(t.seriesId, t.postId),
    index("blog_series_post_series_idx").on(t.seriesId),
    index("blog_series_post_post_idx").on(t.postId),
  ],
);

export const blogSeriesPostsRelations = relations(blogSeriesPosts, ({ one }) => ({
  series: one(blogSeries, {
    fields: [blogSeriesPosts.seriesId],
    references: [blogSeries.id],
  }),
  post: one(blogPosts, {
    fields: [blogSeriesPosts.postId],
    references: [blogPosts.id],
  }),
}));

// ─── Blog Revisions ──────────────────────────────────────

export const blogRevisions = pgTable(
  "blog_revision",
  {
    id: serial("id").primaryKey(),
    postId: uuid("post_id")
      .notNull()
      .references(() => blogPosts.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 500 }).notNull(),
    content: text("content").notNull(),
    editedBy: uuid("edited_by").references(() => users.id, {
      onDelete: "set null",
    }),
    revisionNumber: integer("revision_number").notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("blog_revision_post_number_idx").on(t.postId, t.revisionNumber),
    index("blog_revision_post_idx").on(t.postId),
  ],
);

export const blogRevisionsRelations = relations(blogRevisions, ({ one }) => ({
  post: one(blogPosts, {
    fields: [blogRevisions.postId],
    references: [blogPosts.id],
  }),
  editor: one(users, {
    fields: [blogRevisions.editedBy],
    references: [users.id],
  }),
}));

// ─── Content Analytics ────────────────────────────────────

export const contentAnalytics = pgTable(
  "content_analytics",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    contentType: varchar("content_type", { length: 50 }).notNull(),
    contentId: uuid("content_id").notNull(),
    date: date("date", { mode: "string" }).notNull(),
    views: integer("views").default(0).notNull(),
    uniqueViews: integer("unique_views").default(0).notNull(),
    referralSource: varchar("referral_source", { length: 255 }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("content_analytics_upsert_idx").on(
      t.contentType,
      t.contentId,
      t.date,
      t.referralSource,
    ),
    index("content_analytics_content_idx").on(t.contentType, t.contentId),
  ],
);

// ─── Store Wishlists ────────────────────────────────────────

export const storeWishlists = pgTable(
  "store_wishlist",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => storeProducts.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("store_wishlist_user_product_idx").on(t.userId, t.productId),
    index("store_wishlist_user_idx").on(t.userId),
    index("store_wishlist_product_idx").on(t.productId),
  ],
);

export const storeWishlistsRelations = relations(storeWishlists, ({ one }) => ({
  user: one(users, {
    fields: [storeWishlists.userId],
    references: [users.id],
  }),
  product: one(storeProducts, {
    fields: [storeWishlists.productId],
    references: [storeProducts.id],
  }),
}));

// ─── Store Collections ──────────────────────────────────────

export const storeCollections = pgTable(
  "store_collection",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 200 }).notNull(),
    slug: varchar("slug", { length: 200 }).unique().notNull(),
    description: text("description"),
    coverImage: text("cover_image"),
    isFeatured: boolean("is_featured").default(false).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => [
    index("store_collection_slug_idx").on(t.slug),
    index("store_collection_featured_idx").on(t.isFeatured),
  ],
);

export const storeCollectionsRelations = relations(storeCollections, ({ many }) => ({
  products: many(storeCollectionProducts),
}));

// ─── Store Collection Products ──────────────────────────────

export const storeCollectionProducts = pgTable(
  "store_collection_product",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    collectionId: uuid("collection_id")
      .notNull()
      .references(() => storeCollections.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => storeProducts.id, { onDelete: "cascade" }),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("store_collection_product_unique_idx").on(t.collectionId, t.productId),
    index("store_collection_product_collection_idx").on(t.collectionId),
  ],
);

export const storeCollectionProductsRelations = relations(storeCollectionProducts, ({ one }) => ({
  collection: one(storeCollections, {
    fields: [storeCollectionProducts.collectionId],
    references: [storeCollections.id],
  }),
  product: one(storeProducts, {
    fields: [storeCollectionProducts.productId],
    references: [storeProducts.id],
  }),
}));

// ─── Store Bundle Items ─────────────────────────────────────

export const storeBundleItems = pgTable(
  "store_bundle_item",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    bundleId: uuid("bundle_id")
      .notNull()
      .references(() => storeProducts.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => storeProducts.id, { onDelete: "cascade" }),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("store_bundle_item_unique_idx").on(t.bundleId, t.productId),
    index("store_bundle_item_bundle_idx").on(t.bundleId),
  ],
);

export const storeBundleItemsRelations = relations(storeBundleItems, ({ one }) => ({
  bundle: one(storeProducts, {
    fields: [storeBundleItems.bundleId],
    references: [storeProducts.id],
    relationName: "bundleProducts",
  }),
  product: one(storeProducts, {
    fields: [storeBundleItems.productId],
    references: [storeProducts.id],
    relationName: "bundledProduct",
  }),
}));
