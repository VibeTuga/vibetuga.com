CREATE TYPE "public"."post_status" AS ENUM('draft', 'pending_review', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."post_type" AS ENUM('admin', 'community', 'guest');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'moderator', 'author', 'seller', 'member');--> statement-breakpoint
CREATE TABLE "account" (
	"userId" uuid NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text
);
--> statement-breakpoint
CREATE TABLE "blog_category" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"description" text,
	"color" varchar(7) NOT NULL,
	"icon" varchar(50),
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "blog_category_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "blog_comment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" uuid NOT NULL,
	"author_id" uuid NOT NULL,
	"parent_id" uuid,
	"content" text NOT NULL,
	"is_approved" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "blog_post_bookmark" (
	"post_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "blog_post_bookmark_post_id_user_id_pk" PRIMARY KEY("post_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "blog_post_like" (
	"post_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "blog_post_like_post_id_user_id_pk" PRIMARY KEY("post_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "blog_post" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"author_id" uuid NOT NULL,
	"category_id" uuid,
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"excerpt" text,
	"content" text NOT NULL,
	"status" "post_status" DEFAULT 'draft' NOT NULL,
	"post_type" "post_type" DEFAULT 'community' NOT NULL,
	"tags" text[],
	"cover_image" text,
	"reading_time_minutes" integer DEFAULT 0 NOT NULL,
	"views_count" integer DEFAULT 0 NOT NULL,
	"likes_count" integer DEFAULT 0 NOT NULL,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "blog_post_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"sessionToken" text PRIMARY KEY NOT NULL,
	"userId" uuid NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"discord_id" varchar(255) NOT NULL,
	"discord_username" varchar(255) NOT NULL,
	"discord_avatar" varchar(255),
	"email" varchar(255),
	"emailVerified" timestamp,
	"display_name" varchar(255),
	"bio" text,
	"website_url" varchar(512),
	"image" text,
	"name" text,
	"role" "user_role" DEFAULT 'member' NOT NULL,
	"xp_points" integer DEFAULT 0 NOT NULL,
	"level" integer DEFAULT 1 NOT NULL,
	"streak_days" integer DEFAULT 0 NOT NULL,
	"is_banned" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_discord_id_unique" UNIQUE("discord_id")
);
--> statement-breakpoint
CREATE TABLE "verificationToken" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_comment" ADD CONSTRAINT "blog_comment_post_id_blog_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."blog_post"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_comment" ADD CONSTRAINT "blog_comment_author_id_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_comment" ADD CONSTRAINT "blog_comment_parent_id_blog_comment_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."blog_comment"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_post_bookmark" ADD CONSTRAINT "blog_post_bookmark_post_id_blog_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."blog_post"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_post_bookmark" ADD CONSTRAINT "blog_post_bookmark_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_post_like" ADD CONSTRAINT "blog_post_like_post_id_blog_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."blog_post"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_post_like" ADD CONSTRAINT "blog_post_like_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_post" ADD CONSTRAINT "blog_post_author_id_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_post" ADD CONSTRAINT "blog_post_category_id_blog_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."blog_category"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;