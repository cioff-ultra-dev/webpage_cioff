ALTER TABLE "festivals" ADD COLUMN "accomodation_id" integer;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "festivals" ADD CONSTRAINT "festivals_accomodation_id_storage_id_fk" FOREIGN KEY ("accomodation_id") REFERENCES "public"."storage"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
