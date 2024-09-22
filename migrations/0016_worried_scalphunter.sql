DO $$ BEGIN
 CREATE TYPE "public"."length_activity" AS ENUM('hours', 'days');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."modality_activity" AS ENUM('In Person', 'Online');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."type_activity" AS ENUM('Conference', 'Workshop', 'Seminar', 'Congress', 'National Festival');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "activities" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" "type_activity",
	"modality" "modality_activity",
	"length" "length_activity",
	"length_size" integer,
	"performer_size" integer,
	"report_national_section_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "report_national_sections" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text,
	"festival_size" integer,
	"group_size" integer,
	"association_size" integer,
	"individual_memeber_size" integer,
	"active_national_commission" boolean,
	"work_description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "activities" ADD CONSTRAINT "activities_report_national_section_id_report_national_sections_id_fk" FOREIGN KEY ("report_national_section_id") REFERENCES "public"."report_national_sections"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
