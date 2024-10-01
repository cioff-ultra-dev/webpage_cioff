ALTER TABLE "prod"."national_section_lang" ADD COLUMN "lang" integer;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "prod"."national_section_lang" ADD CONSTRAINT "national_section_lang_lang_languages_id_fk" FOREIGN KEY ("lang") REFERENCES "prod"."languages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
