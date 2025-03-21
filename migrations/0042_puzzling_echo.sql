CREATE TABLE IF NOT EXISTS "report_festival_non_groups" (
	"id" serial PRIMARY KEY NOT NULL,
	"how_many" integer,
	"email_provided" text,
	"report_festival_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "report_festival" ALTER COLUMN "slug" SET DEFAULT '';--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "report_festival_non_groups" ADD CONSTRAINT "report_festival_non_groups_report_festival_id_report_festival_id_fk" FOREIGN KEY ("report_festival_id") REFERENCES "public"."report_festival"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
