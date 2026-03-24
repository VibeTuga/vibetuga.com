CREATE TABLE "store_bundle_item" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bundle_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "store_collection_product" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"collection_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
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
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "store_collection_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "store_wishlist" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "store_product" ADD COLUMN "is_bundle" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "store_bundle_item" ADD CONSTRAINT "store_bundle_item_bundle_id_store_product_id_fk" FOREIGN KEY ("bundle_id") REFERENCES "public"."store_product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_bundle_item" ADD CONSTRAINT "store_bundle_item_product_id_store_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."store_product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_collection_product" ADD CONSTRAINT "store_collection_product_collection_id_store_collection_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."store_collection"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_collection_product" ADD CONSTRAINT "store_collection_product_product_id_store_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."store_product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_wishlist" ADD CONSTRAINT "store_wishlist_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_wishlist" ADD CONSTRAINT "store_wishlist_product_id_store_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."store_product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "store_bundle_item_unique_idx" ON "store_bundle_item" USING btree ("bundle_id","product_id");--> statement-breakpoint
CREATE INDEX "store_bundle_item_bundle_idx" ON "store_bundle_item" USING btree ("bundle_id");--> statement-breakpoint
CREATE UNIQUE INDEX "store_collection_product_unique_idx" ON "store_collection_product" USING btree ("collection_id","product_id");--> statement-breakpoint
CREATE INDEX "store_collection_product_collection_idx" ON "store_collection_product" USING btree ("collection_id");--> statement-breakpoint
CREATE INDEX "store_collection_slug_idx" ON "store_collection" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "store_collection_featured_idx" ON "store_collection" USING btree ("is_featured");--> statement-breakpoint
CREATE UNIQUE INDEX "store_wishlist_user_product_idx" ON "store_wishlist" USING btree ("user_id","product_id");--> statement-breakpoint
CREATE INDEX "store_wishlist_user_idx" ON "store_wishlist" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "store_wishlist_product_idx" ON "store_wishlist" USING btree ("product_id");