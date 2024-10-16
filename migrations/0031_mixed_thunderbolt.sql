ALTER TABLE "subgroups" ADD COLUMN "has_another_contact" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "subgroups" ADD COLUMN "contact_mail" text;--> statement-breakpoint
ALTER TABLE "subgroups_lang" ADD COLUMN "lang" integer;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "subgroups_lang" ADD CONSTRAINT "subgroups_lang_lang_languages_id_fk" FOREIGN KEY ("lang") REFERENCES "public"."languages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
