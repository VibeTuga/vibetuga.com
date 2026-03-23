CREATE TYPE "public"."project_status" AS ENUM('pending', 'approved', 'featured', 'rejected');--> statement-breakpoint
CREATE TABLE "showcase_project" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"author_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text,
	"cover_image" text,
	"gallery_images" text[],
	"live_url" varchar(512),
	"repo_url" varchar(512),
	"video_url" varchar(512),
	"tech_stack" text[],
	"ai_tools_used" text[],
	"status" "project_status" DEFAULT 'pending' NOT NULL,
	"votes_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "showcase_project_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "showcase_project" ADD CONSTRAINT "showcase_project_author_id_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;