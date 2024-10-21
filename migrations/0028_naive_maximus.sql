ALTER TABLE "festivals" ADD COLUMN "region_for_groups" integer;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "festivals" ADD CONSTRAINT "festivals_region_for_groups_regions_id_fk" FOREIGN KEY ("region_for_groups") REFERENCES "public"."regions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
