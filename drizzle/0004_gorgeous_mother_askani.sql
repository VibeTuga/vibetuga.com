CREATE TYPE "public"."product_status" AS ENUM('draft', 'pending', 'approved', 'rejected', 'archived');--> statement-breakpoint
CREATE TYPE "public"."product_type" AS ENUM('skill', 'auto_runner', 'agent_kit', 'prompt_pack', 'template', 'course', 'guide', 'other');--> statement-breakpoint
CREATE TYPE "public"."subscription_plan" AS ENUM('monthly', 'yearly');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('active', 'canceled', 'past_due');--> statement-breakpoint
CREATE TABLE "store_product" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"seller_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text,
	"price_cents" integer NOT NULL,
	"product_type" "product_type" DEFAULT 'other' NOT NULL,
	"status" "product_status" DEFAULT 'draft' NOT NULL,
	"stripe_price_id" varchar(255),
	"download_key" varchar(512),
	"cover_image" text,
	"tags" text[],
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "store_product_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "store_purchase" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"buyer_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"price_paid_cents" integer NOT NULL,
	"stripe_payment_id" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "store_review" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"reviewer_id" uuid NOT NULL,
	"rating" smallint NOT NULL,
	"comment" text,
	"is_verified_purchase" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscription" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"plan" "subscription_plan" NOT NULL,
	"stripe_subscription_id" varchar(255),
	"stripe_customer_id" varchar(255),
	"status" "subscription_status" DEFAULT 'active' NOT NULL,
	"current_period_start" timestamp NOT NULL,
	"current_period_end" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "store_product" ADD CONSTRAINT "store_product_seller_id_user_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_purchase" ADD CONSTRAINT "store_purchase_buyer_id_user_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_purchase" ADD CONSTRAINT "store_purchase_product_id_store_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."store_product"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_review" ADD CONSTRAINT "store_review_product_id_store_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."store_product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_review" ADD CONSTRAINT "store_review_reviewer_id_user_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "store_product_seller_idx" ON "store_product" USING btree ("seller_id");--> statement-breakpoint
CREATE INDEX "store_product_slug_idx" ON "store_product" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "store_product_status_idx" ON "store_product" USING btree ("status");--> statement-breakpoint
CREATE INDEX "store_product_type_idx" ON "store_product" USING btree ("product_type");--> statement-breakpoint
CREATE INDEX "store_purchase_buyer_idx" ON "store_purchase" USING btree ("buyer_id");--> statement-breakpoint
CREATE INDEX "store_purchase_product_idx" ON "store_purchase" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "store_review_product_idx" ON "store_review" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "store_review_reviewer_idx" ON "store_review" USING btree ("reviewer_id");--> statement-breakpoint
CREATE INDEX "subscription_user_idx" ON "subscription" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "subscription_stripe_idx" ON "subscription" USING btree ("stripe_subscription_id");