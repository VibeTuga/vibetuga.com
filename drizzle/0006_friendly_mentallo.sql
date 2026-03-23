CREATE TYPE "public"."role_request_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TABLE "role_request" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"requested_role" "user_role" NOT NULL,
	"reason" text NOT NULL,
	"status" "role_request_status" DEFAULT 'pending' NOT NULL,
	"reviewed_by" uuid,
	"review_note" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "role_request" ADD CONSTRAINT "role_request_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_request" ADD CONSTRAINT "role_request_reviewed_by_user_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "role_request_user_idx" ON "role_request" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "role_request_status_idx" ON "role_request" USING btree ("status");