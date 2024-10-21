CREATE TABLE IF NOT EXISTS "festival_to_connected" (
	"source_festival_id" integer,
	"target_component_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	CONSTRAINT "festival_to_connected_source_festival_id_target_component_id_pk" PRIMARY KEY("source_festival_id","target_component_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "festival_to_connected" ADD CONSTRAINT "festival_to_connected_source_festival_id_festivals_id_fk" FOREIGN KEY ("source_festival_id") REFERENCES "public"."festivals"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "festival_to_connected" ADD CONSTRAINT "festival_to_connected_target_component_id_festivals_id_fk" FOREIGN KEY ("target_component_id") REFERENCES "public"."festivals"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
