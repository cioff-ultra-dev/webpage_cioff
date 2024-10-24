CREATE TABLE IF NOT EXISTS "transport_locations" (
	"id" serial PRIMARY KEY NOT NULL,
	"location" text,
	"lat" text,
	"lng" text,
	"festival_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transport_locations" ADD CONSTRAINT "transport_locations_festival_id_festivals_id_fk" FOREIGN KEY ("festival_id") REFERENCES "public"."festivals"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
