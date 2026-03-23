CREATE TABLE "content_analytics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content_type" varchar(50) NOT NULL,
	"content_id" uuid NOT NULL,
	"date" date NOT NULL,
	"views" integer DEFAULT 0 NOT NULL,
	"unique_views" integer DEFAULT 0 NOT NULL,
	"referral_source" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "content_analytics_upsert_idx" ON "content_analytics" USING btree ("content_type","content_id","date","referral_source");--> statement-breakpoint
CREATE INDEX "content_analytics_content_idx" ON "content_analytics" USING btree ("content_type","content_id");