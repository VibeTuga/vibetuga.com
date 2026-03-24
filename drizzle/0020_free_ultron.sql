ALTER TYPE "public"."subscription_status" ADD VALUE 'trialing';--> statement-breakpoint
CREATE TABLE "product_update" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" uuid NOT NULL,
	"version" varchar(50) NOT NULL,
	"changelog" text NOT NULL,
	"download_url" varchar(512),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stripe_event" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"stripe_event_id" varchar(255) NOT NULL,
	"event_type" varchar(100) NOT NULL,
	"processed_at" timestamp DEFAULT now() NOT NULL,
	"payload" text,
	"error" text,
	CONSTRAINT "stripe_event_stripe_event_id_unique" UNIQUE("stripe_event_id")
);
--> statement-breakpoint
ALTER TABLE "blog_post" ADD COLUMN "language" varchar(10) DEFAULT 'pt' NOT NULL;--> statement-breakpoint
ALTER TABLE "subscription" ADD COLUMN "canceled_at" timestamp;--> statement-breakpoint
ALTER TABLE "product_update" ADD CONSTRAINT "product_update_product_id_store_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."store_product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "product_update_product_idx" ON "product_update" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "product_update_created_idx" ON "product_update" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "stripe_event_type_idx" ON "stripe_event" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "stripe_event_processed_idx" ON "stripe_event" USING btree ("processed_at");