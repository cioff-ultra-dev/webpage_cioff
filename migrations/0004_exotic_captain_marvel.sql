ALTER TABLE "type_groups" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "type_groups" ADD COLUMN "updated_at" timestamp;