CREATE TABLE "blog_series" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text,
	"cover_image" text,
	"author_id" uuid NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "blog_series_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "blog_series_post" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"series_id" uuid NOT NULL,
	"post_id" uuid NOT NULL,
	"order" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "blog_series" ADD CONSTRAINT "blog_series_author_id_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_series_post" ADD CONSTRAINT "blog_series_post_series_id_blog_series_id_fk" FOREIGN KEY ("series_id") REFERENCES "public"."blog_series"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_series_post" ADD CONSTRAINT "blog_series_post_post_id_blog_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."blog_post"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "blog_series_author_idx" ON "blog_series" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "blog_series_slug_idx" ON "blog_series" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "blog_series_post_unique_idx" ON "blog_series_post" USING btree ("series_id","post_id");--> statement-breakpoint
CREATE INDEX "blog_series_post_series_idx" ON "blog_series_post" USING btree ("series_id");--> statement-breakpoint
CREATE INDEX "blog_series_post_post_idx" ON "blog_series_post" USING btree ("post_id");