CREATE TYPE "public"."referral_status" AS ENUM('pending', 'completed', 'expired');--> statement-breakpoint
CREATE TABLE "referral" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"referrer_id" uuid NOT NULL,
	"referred_user_id" uuid,
	"referral_code" varchar(50) NOT NULL,
	"status" "referral_status" DEFAULT 'pending' NOT NULL,
	"xp_awarded" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	CONSTRAINT "referral_referral_code_unique" UNIQUE("referral_code")
);
--> statement-breakpoint
ALTER TABLE "referral" ADD CONSTRAINT "referral_referrer_id_user_id_fk" FOREIGN KEY ("referrer_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral" ADD CONSTRAINT "referral_referred_user_id_user_id_fk" FOREIGN KEY ("referred_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "referral_referrer_idx" ON "referral" USING btree ("referrer_id");--> statement-breakpoint
CREATE INDEX "referral_code_idx" ON "referral" USING btree ("referral_code");--> statement-breakpoint
CREATE INDEX "referral_status_idx" ON "referral" USING btree ("status");