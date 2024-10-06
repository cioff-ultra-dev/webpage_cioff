ALTER TABLE "national_section_positions" RENAME COLUMN "type_position_id" TO "old_type_position_id";--> statement-breakpoint
ALTER TABLE "national_section_positions" DROP CONSTRAINT "national_section_positions_type_position_id_old_type_positions_id_fk";
--> statement-breakpoint
ALTER TABLE "national_section_positions" ADD COLUMN "new_type_position_id" integer;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "national_section_positions" ADD CONSTRAINT "national_section_positions_old_type_position_id_old_type_positions_id_fk" FOREIGN KEY ("old_type_position_id") REFERENCES "public"."old_type_positions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "national_section_positions" ADD CONSTRAINT "national_section_positions_new_type_position_id_new_type_positions_id_fk" FOREIGN KEY ("new_type_position_id") REFERENCES "public"."new_type_positions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
