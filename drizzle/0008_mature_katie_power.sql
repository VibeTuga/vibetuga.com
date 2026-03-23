CREATE TYPE "public"."report_status" AS ENUM('pending', 'resolved', 'dismissed');--> statement-breakpoint
CREATE TABLE "report" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reporter_id" uuid NOT NULL,
	"content_type" varchar(50) NOT NULL,
	"content_id" uuid NOT NULL,
	"reason" varchar(50) NOT NULL,
	"details" text,
	"status" "report_status" DEFAULT 'pending' NOT NULL,
	"resolved_by" uuid,
	"resolved_note" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "report" ADD CONSTRAINT "report_reporter_id_user_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report" ADD CONSTRAINT "report_resolved_by_user_id_fk" FOREIGN KEY ("resolved_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "report_content_idx" ON "report" USING btree ("content_type","content_id");--> statement-breakpoint
CREATE INDEX "report_status_idx" ON "report" USING btree ("status");--> statement-breakpoint
CREATE INDEX "report_reporter_idx" ON "report" USING btree ("reporter_id");