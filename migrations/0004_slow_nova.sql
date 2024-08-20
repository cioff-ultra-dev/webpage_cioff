ALTER TABLE "event_types" RENAME COLUMN "tag" TO "slug";--> statement-breakpoint
ALTER TABLE "event_types" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "event_types" ADD COLUMN "updated_at" timestamp;