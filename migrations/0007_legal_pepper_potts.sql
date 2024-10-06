CREATE TABLE IF NOT EXISTS "type_positions_lang" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type_position_id" integer,
	"lang_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "national_section_positions" ADD COLUMN "title" text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "type_positions_lang" ADD CONSTRAINT "type_positions_lang_type_position_id_type_positions_id_fk" FOREIGN KEY ("type_position_id") REFERENCES "public"."type_positions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "type_positions_lang" ADD CONSTRAINT "type_positions_lang_lang_id_languages_id_fk" FOREIGN KEY ("lang_id") REFERENCES "public"."languages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
