ALTER TABLE "report_national_sections" ADD COLUMN "country_id" integer;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "report_national_sections" ADD CONSTRAINT "report_national_sections_country_id_countries_id_fk" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
