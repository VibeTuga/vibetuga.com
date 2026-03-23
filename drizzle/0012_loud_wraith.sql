CREATE TABLE "direct_message" (
	"id" serial PRIMARY KEY NOT NULL,
	"sender_id" uuid,
	"recipient_id" uuid NOT NULL,
	"content" text NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "direct_message" ADD CONSTRAINT "direct_message_sender_id_user_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "direct_message" ADD CONSTRAINT "direct_message_recipient_id_user_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "dm_recipient_read_idx" ON "direct_message" USING btree ("recipient_id","is_read");--> statement-breakpoint
CREATE INDEX "dm_conversation_idx" ON "direct_message" USING btree ("sender_id","recipient_id","created_at");