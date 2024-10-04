ALTER TABLE "labs"."countries" ADD COLUMN "country_lang" integer;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "labs"."countries" ADD CONSTRAINT "countries_country_lang_languages_id_fk" FOREIGN KEY ("country_lang") REFERENCES "labs"."languages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "labs"."festivals" DROP COLUMN IF EXISTS "old_id";