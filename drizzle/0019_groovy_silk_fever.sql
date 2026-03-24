ALTER TABLE "store_purchase" ADD COLUMN "stripe_transfer_id" varchar(255);--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "stripe_connect_account_id" varchar(255);--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "stripe_connect_onboarded" boolean DEFAULT false NOT NULL;