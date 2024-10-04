ALTER TABLE "labs"."countries" RENAME COLUMN "country_lang" TO "native_lang";--> statement-breakpoint
ALTER TABLE "labs"."countries" DROP CONSTRAINT "countries_country_lang_languages_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "labs"."countries" ADD CONSTRAINT "countries_native_lang_languages_id_fk" FOREIGN KEY ("native_lang") REFERENCES "labs"."languages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
