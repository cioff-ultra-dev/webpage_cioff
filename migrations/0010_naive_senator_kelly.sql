CREATE TABLE IF NOT EXISTS "group_photos" (
	"id" serial PRIMARY KEY NOT NULL,
	"group_id" integer,
	"photo_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "group_photos" ADD CONSTRAINT "group_photos_group_id_festivals_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."festivals"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "group_photos" ADD CONSTRAINT "group_photos_photo_id_storages_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."storages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
