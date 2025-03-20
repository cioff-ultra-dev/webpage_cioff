CREATE TABLE IF NOT EXISTS "festival_cover_photos" (
	"id" serial PRIMARY KEY NOT NULL,
	"festival_id" integer,
	"photo_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "group_cover_photos" (
	"id" serial PRIMARY KEY NOT NULL,
	"group_id" integer,
	"photo_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "national_cover_photos" (
	"id" serial PRIMARY KEY NOT NULL,
	"national_section_id" integer,
	"photo_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "festival_cover_photos" ADD CONSTRAINT "festival_cover_photos_festival_id_festivals_id_fk" FOREIGN KEY ("festival_id") REFERENCES "public"."festivals"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "festival_cover_photos" ADD CONSTRAINT "festival_cover_photos_photo_id_storage_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."storage"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "group_cover_photos" ADD CONSTRAINT "group_cover_photos_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "group_cover_photos" ADD CONSTRAINT "group_cover_photos_photo_id_storage_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."storage"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "national_cover_photos" ADD CONSTRAINT "national_cover_photos_national_section_id_national_section_id_fk" FOREIGN KEY ("national_section_id") REFERENCES "public"."national_section"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "national_cover_photos" ADD CONSTRAINT "national_cover_photos_photo_id_storage_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."storage"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
