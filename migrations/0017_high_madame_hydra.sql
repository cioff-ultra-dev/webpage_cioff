ALTER TABLE "national_section" ADD COLUMN "created_by" text;--> statement-breakpoint
ALTER TABLE "national_section" ADD COLUMN "updated_by" text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "national_section" ADD CONSTRAINT "national_section_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "national_section" ADD CONSTRAINT "national_section_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
