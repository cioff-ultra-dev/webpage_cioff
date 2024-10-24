CREATE TABLE IF NOT EXISTS "festival_group_to_regions" (
	"festival_id" integer,
	"region_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	CONSTRAINT "festival_group_to_regions_festival_id_region_id_pk" PRIMARY KEY("festival_id","region_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "festival_group_to_regions" ADD CONSTRAINT "festival_group_to_regions_festival_id_festivals_id_fk" FOREIGN KEY ("festival_id") REFERENCES "public"."festivals"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "festival_group_to_regions" ADD CONSTRAINT "festival_group_to_regions_region_id_regions_id_fk" FOREIGN KEY ("region_id") REFERENCES "public"."regions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
