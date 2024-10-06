CREATE TABLE IF NOT EXISTS "type_positions" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "national_section_positions_test" ADD COLUMN "type_position_id" integer;--> statement-breakpoint
ALTER TABLE "national_section_positions" ADD COLUMN "type_position_id" integer;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "national_section_positions_test" ADD CONSTRAINT "national_section_positions_test_type_position_id_type_positions_id_fk" FOREIGN KEY ("type_position_id") REFERENCES "public"."type_positions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "national_section_positions" ADD CONSTRAINT "national_section_positions_type_position_id_type_positions_id_fk" FOREIGN KEY ("type_position_id") REFERENCES "public"."type_positions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
