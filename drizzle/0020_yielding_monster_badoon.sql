CREATE TYPE "public"."refund_status" AS ENUM('pending', 'approved', 'rejected', 'refunded');--> statement-breakpoint
CREATE TABLE "product_update" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"version" varchar(50) NOT NULL,
	"changelog" text NOT NULL,
	"download_key" varchar(512),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "store_collection_product" (
	"collection_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "store_collection_product_collection_id_product_id_pk" PRIMARY KEY("collection_id","product_id")
);
--> statement-breakpoint
CREATE TABLE "store_collection" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(200) NOT NULL,
	"slug" varchar(200) NOT NULL,
	"description" text,
	"cover_image" text,
	"is_featured" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "store_collection_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "store_coupon" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(50) NOT NULL,
	"seller_id" uuid,
	"discount_percent" smallint,
	"discount_amount_cents" integer,
	"max_uses" integer,
	"current_uses" integer DEFAULT 0 NOT NULL,
	"expires_at" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "store_coupon_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "store_refund" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"purchase_id" uuid NOT NULL,
	"buyer_id" uuid NOT NULL,
	"reason" text NOT NULL,
	"status" "refund_status" DEFAULT 'pending' NOT NULL,
	"admin_notes" text,
	"stripe_refund_id" varchar(255),
	"resolved_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"resolved_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "store_wishlist" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stripe_webhook_event" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"stripe_event_id" varchar(255) NOT NULL,
	"event_type" varchar(100) NOT NULL,
	"processed_at" timestamp DEFAULT now() NOT NULL,
	"status" varchar(50) DEFAULT 'processed' NOT NULL,
	CONSTRAINT "stripe_webhook_event_stripe_event_id_unique" UNIQUE("stripe_event_id")
);
--> statement-breakpoint
ALTER TABLE "product_update" ADD CONSTRAINT "product_update_product_id_store_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."store_product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_collection_product" ADD CONSTRAINT "store_collection_product_collection_id_store_collection_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."store_collection"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_collection_product" ADD CONSTRAINT "store_collection_product_product_id_store_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."store_product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_coupon" ADD CONSTRAINT "store_coupon_seller_id_user_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_refund" ADD CONSTRAINT "store_refund_purchase_id_store_purchase_id_fk" FOREIGN KEY ("purchase_id") REFERENCES "public"."store_purchase"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_refund" ADD CONSTRAINT "store_refund_buyer_id_user_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_refund" ADD CONSTRAINT "store_refund_resolved_by_user_id_fk" FOREIGN KEY ("resolved_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_wishlist" ADD CONSTRAINT "store_wishlist_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_wishlist" ADD CONSTRAINT "store_wishlist_product_id_store_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."store_product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "product_update_product_idx" ON "product_update" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "store_collection_product_collection_idx" ON "store_collection_product" USING btree ("collection_id");--> statement-breakpoint
CREATE INDEX "store_collection_product_product_idx" ON "store_collection_product" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "store_collection_slug_idx" ON "store_collection" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "store_collection_featured_idx" ON "store_collection" USING btree ("is_featured");--> statement-breakpoint
CREATE INDEX "store_coupon_code_idx" ON "store_coupon" USING btree ("code");--> statement-breakpoint
CREATE INDEX "store_coupon_seller_idx" ON "store_coupon" USING btree ("seller_id");--> statement-breakpoint
CREATE INDEX "store_refund_purchase_idx" ON "store_refund" USING btree ("purchase_id");--> statement-breakpoint
CREATE INDEX "store_refund_buyer_idx" ON "store_refund" USING btree ("buyer_id");--> statement-breakpoint
CREATE INDEX "store_refund_status_idx" ON "store_refund" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "store_wishlist_user_product_idx" ON "store_wishlist" USING btree ("user_id","product_id");--> statement-breakpoint
CREATE INDEX "store_wishlist_user_idx" ON "store_wishlist" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "store_wishlist_product_idx" ON "store_wishlist" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "stripe_webhook_event_stripe_id_idx" ON "stripe_webhook_event" USING btree ("stripe_event_id");--> statement-breakpoint
CREATE INDEX "stripe_webhook_event_type_idx" ON "stripe_webhook_event" USING btree ("event_type");