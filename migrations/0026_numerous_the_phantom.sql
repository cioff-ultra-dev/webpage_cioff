CREATE TABLE IF NOT EXISTS "festivals_lang" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text DEFAULT '' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"address" text,
	"lang" integer,
	"festival_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "festivals_lang" ADD CONSTRAINT "festivals_lang_lang_languages_id_fk" FOREIGN KEY ("lang") REFERENCES "public"."languages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "festivals_lang" ADD CONSTRAINT "festivals_lang_festival_id_festivals_id_fk" FOREIGN KEY ("festival_id") REFERENCES "public"."festivals"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "festivals" ADD CONSTRAINT "festivals_country_id_countries_id_fk" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "festivals" DROP COLUMN IF EXISTS "address";--> statement-breakpoint
ALTER TABLE "festivals" DROP COLUMN IF EXISTS "name";--> statement-breakpoint
ALTER TABLE "festivals" DROP COLUMN IF EXISTS "description";--> statement-breakpoint
ALTER TABLE "festivals" DROP COLUMN IF EXISTS "lang";