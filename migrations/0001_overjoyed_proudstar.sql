DO $$ BEGIN
 CREATE TYPE "public"."state_mode" AS ENUM('offline', 'online');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "event_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"tag" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "events_to_event_types" (
	"event_id" integer NOT NULL,
	"event_types_id" integer NOT NULL,
	CONSTRAINT "events_to_event_types_event_id_event_types_id_pk" PRIMARY KEY("event_id","event_types_id")
);
--> statement-breakpoint
ALTER TABLE "events" RENAME COLUMN "name" TO "title";--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "state_mode" "state_mode" DEFAULT 'offline';--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "description" text NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "logo" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "url" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "approved" boolean;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "password" text NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "events_to_event_types" ADD CONSTRAINT "events_to_event_types_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "events_to_event_types" ADD CONSTRAINT "events_to_event_types_event_types_id_event_types_id_fk" FOREIGN KEY ("event_types_id") REFERENCES "public"."event_types"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
