ALTER TABLE "festivals" ADD COLUMN IF NOT EXISTS "address" text;--> statement-breakpoint
ALTER TABLE "festivals" ADD COLUMN IF NOT EXISTS "name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "festivals" ADD COLUMN IF NOT EXISTS "email" text;--> statement-breakpoint
ALTER TABLE "festivals" ADD COLUMN IF NOT EXISTS "owner_id" text;--> statement-breakpoint
ALTER TABLE "festivals" ADD COLUMN IF NOT EXISTS "url" text;--> statement-breakpoint
ALTER TABLE "festivals" ADD COLUMN IF NOT EXISTS "contact" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "festivals" ADD COLUMN IF NOT EXISTS "url_validated" boolean;--> statement-breakpoint
ALTER TABLE "festivals" ADD COLUMN IF NOT EXISTS "description" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "festivals" ADD COLUMN IF NOT EXISTS "phone" text;--> statement-breakpoint
ALTER TABLE "festivals" ADD COLUMN IF NOT EXISTS "state_mode" "state_mode" DEFAULT 'offline';--> statement-breakpoint
ALTER TABLE "festivals" ADD COLUMN IF NOT EXISTS "location" text;--> statement-breakpoint
ALTER TABLE "festivals" ADD COLUMN IF NOT EXISTS "current_dates" text;--> statement-breakpoint
ALTER TABLE "festivals" ADD COLUMN IF NOT EXISTS "next_dates" text;--> statement-breakpoint
ALTER TABLE "festivals" ADD COLUMN IF NOT EXISTS "lat" text;--> statement-breakpoint
ALTER TABLE "festivals" ADD COLUMN IF NOT EXISTS "lng" text;--> statement-breakpoint
ALTER TABLE "festivals" ADD COLUMN IF NOT EXISTS "transport_lat" text;--> statement-breakpoint
ALTER TABLE "festivals" ADD COLUMN IF NOT EXISTS "transport_lng" text;--> statement-breakpoint
ALTER TABLE "festivals" ADD COLUMN IF NOT EXISTS "translator_languages" text;--> statement-breakpoint
ALTER TABLE "festivals" ADD COLUMN IF NOT EXISTS "peoples" integer;--> statement-breakpoint
ALTER TABLE "festivals" ADD COLUMN IF NOT EXISTS "logo" text;--> statement-breakpoint
ALTER TABLE "festivals" ADD COLUMN IF NOT EXISTS "cover" text;--> statement-breakpoint
ALTER TABLE "festivals" ADD COLUMN IF NOT EXISTS "photos" text;--> statement-breakpoint
ALTER TABLE "festivals" ADD COLUMN IF NOT EXISTS "youtube_id" text;--> statement-breakpoint
ALTER TABLE "festivals" ADD COLUMN IF NOT EXISTS "director_name" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "festivals" ADD COLUMN IF NOT EXISTS "categories" text;--> statement-breakpoint
ALTER TABLE "festivals" ADD COLUMN IF NOT EXISTS "lang" integer;--> statement-breakpoint
ALTER TABLE "festivals" ADD COLUMN IF NOT EXISTS "publish" boolean;--> statement-breakpoint
ALTER TABLE "festivals" ADD COLUMN IF NOT EXISTS "certification_member_id" integer;
