ALTER TABLE "type_positions" RENAME TO "old_type_positions";--> statement-breakpoint
ALTER TABLE "national_section_positions" DROP CONSTRAINT "national_section_positions_type_position_id_type_positions_id_fk";
--> statement-breakpoint
ALTER TABLE "type_positions_lang" DROP CONSTRAINT "type_positions_lang_type_position_id_type_positions_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "national_section_positions" ADD CONSTRAINT "national_section_positions_type_position_id_old_type_positions_id_fk" FOREIGN KEY ("type_position_id") REFERENCES "public"."old_type_positions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "type_positions_lang" ADD CONSTRAINT "type_positions_lang_type_position_id_new_type_positions_id_fk" FOREIGN KEY ("type_position_id") REFERENCES "public"."new_type_positions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
