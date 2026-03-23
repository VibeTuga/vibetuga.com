CREATE TYPE "public"."challenge_entry_status" AS ENUM('submitted', 'winner', 'disqualified');--> statement-breakpoint
CREATE TYPE "public"."challenge_status" AS ENUM('draft', 'active', 'voting', 'completed');--> statement-breakpoint
CREATE TABLE "challenge_entry" (
	"id" serial PRIMARY KEY NOT NULL,
	"challenge_id" integer NOT NULL,
	"user_id" uuid NOT NULL,
	"submission_url" varchar(500) NOT NULL,
	"description" text,
	"votes_count" integer DEFAULT 0 NOT NULL,
	"status" "challenge_entry_status" DEFAULT 'submitted' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "challenge_entry_vote" (
	"entry_id" integer NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "challenge_entry_vote_entry_id_user_id_pk" PRIMARY KEY("entry_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "challenge" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" text NOT NULL,
	"start_at" timestamp NOT NULL,
	"end_at" timestamp NOT NULL,
	"badge_reward_id" uuid,
	"xp_reward" integer DEFAULT 0 NOT NULL,
	"status" "challenge_status" DEFAULT 'draft' NOT NULL,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "challenge_entry" ADD CONSTRAINT "challenge_entry_challenge_id_challenge_id_fk" FOREIGN KEY ("challenge_id") REFERENCES "public"."challenge"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challenge_entry" ADD CONSTRAINT "challenge_entry_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challenge_entry_vote" ADD CONSTRAINT "challenge_entry_vote_entry_id_challenge_entry_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."challenge_entry"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challenge_entry_vote" ADD CONSTRAINT "challenge_entry_vote_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challenge" ADD CONSTRAINT "challenge_badge_reward_id_badge_id_fk" FOREIGN KEY ("badge_reward_id") REFERENCES "public"."badge"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challenge" ADD CONSTRAINT "challenge_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "challenge_entry_unique_idx" ON "challenge_entry" USING btree ("challenge_id","user_id");--> statement-breakpoint
CREATE INDEX "challenge_entry_challenge_idx" ON "challenge_entry" USING btree ("challenge_id");--> statement-breakpoint
CREATE INDEX "challenge_entry_user_idx" ON "challenge_entry" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "challenge_entry_vote_user_idx" ON "challenge_entry_vote" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "challenge_status_idx" ON "challenge" USING btree ("status");--> statement-breakpoint
CREATE INDEX "challenge_start_idx" ON "challenge" USING btree ("start_at");