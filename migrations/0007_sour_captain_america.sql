CREATE TABLE IF NOT EXISTS "session_group" (
	"id" serial PRIMARY KEY NOT NULL
);
--> statement-breakpoint
ALTER TABLE "festivals_to_categories" ADD CONSTRAINT "festivals_to_categories_festival_id_category_id_pk" PRIMARY KEY("festival_id","category_id");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "festivals_to_categories" ADD CONSTRAINT "festivals_to_categories_festival_id_festivals_id_fk" FOREIGN KEY ("festival_id") REFERENCES "public"."festivals"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "festivals_to_categories" ADD CONSTRAINT "festivals_to_categories_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "festivals_to_categories" DROP COLUMN IF EXISTS "id";