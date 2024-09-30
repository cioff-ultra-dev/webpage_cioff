ALTER TABLE "festivals" ADD COLUMN "ns_id" integer;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "festivals" ADD CONSTRAINT "festivals_ns_id_national_section_id_fk" FOREIGN KEY ("ns_id") REFERENCES "public"."national_section"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
