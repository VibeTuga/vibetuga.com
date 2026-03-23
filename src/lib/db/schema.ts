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
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  blogPosts: many(blogPosts),
  blogComments: many(blogComments),
  blogPostLikes: many(blogPostLikes),
  blogPostBookmarks: many(blogPostBookmarks),
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
