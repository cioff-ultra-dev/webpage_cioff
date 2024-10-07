CREATE TABLE IF NOT EXISTS "type_national_section" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "type_national_section_lang" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"lang" integer,
	"type_national_section_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "national_section" ADD COLUMN "type_national_section_id" integer;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "type_national_section_lang" ADD CONSTRAINT "type_national_section_lang_lang_languages_id_fk" FOREIGN KEY ("lang") REFERENCES "public"."languages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "type_national_section_lang" ADD CONSTRAINT "type_national_section_lang_type_national_section_id_type_national_section_id_fk" FOREIGN KEY ("type_national_section_id") REFERENCES "public"."type_national_section"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "national_section" ADD CONSTRAINT "national_section_type_national_section_id_type_national_section_id_fk" FOREIGN KEY ("type_national_section_id") REFERENCES "public"."type_national_section"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
