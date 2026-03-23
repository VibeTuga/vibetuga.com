CREATE TABLE "project_vote" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"vote_type" varchar(10) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "project_vote" ADD CONSTRAINT "project_vote_project_id_showcase_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."showcase_project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_vote" ADD CONSTRAINT "project_vote_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "project_vote_project_user_idx" ON "project_vote" USING btree ("project_id","user_id");--> statement-breakpoint
CREATE INDEX "project_vote_user_idx" ON "project_vote" USING btree ("user_id");