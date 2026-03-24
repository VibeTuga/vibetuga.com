-- Add 'trialing' to subscription_status enum
ALTER TYPE "subscription_status" ADD VALUE IF NOT EXISTS 'trialing';

-- Add canceled_at column to subscription table
ALTER TABLE "subscription" ADD COLUMN IF NOT EXISTS "canceled_at" timestamp;

-- Create stripe_event table for webhook idempotency
CREATE TABLE IF NOT EXISTS "stripe_event" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"stripe_event_id" varchar(255) NOT NULL,
	"event_type" varchar(100) NOT NULL,
	"processed_at" timestamp DEFAULT now() NOT NULL,
	"payload" text,
	"error" text,
	CONSTRAINT "stripe_event_stripe_event_id_unique" UNIQUE("stripe_event_id")
);

-- Indexes for stripe_event
CREATE INDEX IF NOT EXISTS "stripe_event_type_idx" ON "stripe_event" USING btree ("event_type");
CREATE INDEX IF NOT EXISTS "stripe_event_processed_idx" ON "stripe_event" USING btree ("processed_at");
