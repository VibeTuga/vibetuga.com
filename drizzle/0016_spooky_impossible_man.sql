CREATE TABLE "blog_revision" (
	"id" serial PRIMARY KEY NOT NULL,
	"post_id" uuid NOT NULL,
	"title" varchar(500) NOT NULL,
	"content" text NOT NULL,
	"edited_by" uuid,
	"revision_number" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "blog_revision" ADD CONSTRAINT "blog_revision_post_id_blog_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."blog_post"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_revision" ADD CONSTRAINT "blog_revision_edited_by_user_id_fk" FOREIGN KEY ("edited_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "blog_revision_post_number_idx" ON "blog_revision" USING btree ("post_id","revision_number");--> statement-breakpoint
CREATE INDEX "blog_revision_post_idx" ON "blog_revision" USING btree ("post_id");