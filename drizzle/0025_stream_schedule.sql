CREATE TYPE "public"."stream_platform" AS ENUM('twitch', 'youtube');--> statement-breakpoint
CREATE TABLE "stream_schedule" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"platform" "stream_platform" NOT NULL,
	"title" varchar(300) NOT NULL,
	"description" text,
	"scheduled_at" timestamp NOT NULL,
	"duration" integer,
	"vod_url" text,
	"thumbnail_url" text,
	"is_live" boolean DEFAULT false NOT NULL,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint
ALTER TABLE "stream_schedule" ADD CONSTRAINT "stream_schedule_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "stream_schedule_scheduled_at_idx" ON "stream_schedule" USING btree ("scheduled_at");--> statement-breakpoint
CREATE INDEX "stream_schedule_is_live_idx" ON "stream_schedule" USING btree ("is_live");--> statement-breakpoint
CREATE INDEX "stream_schedule_platform_idx" ON "stream_schedule" USING btree ("platform");
