CREATE TYPE "public"."privacy_level" AS ENUM('public', 'members', 'private');--> statement-breakpoint
CREATE TABLE "user_setting" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"email_notifications" boolean DEFAULT true NOT NULL,
	"in_app_notifications" boolean DEFAULT true NOT NULL,
	"privacy_level" "privacy_level" DEFAULT 'public' NOT NULL,
	"locale" varchar(10) DEFAULT 'pt' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_setting_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "user_setting" ADD CONSTRAINT "user_setting_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;