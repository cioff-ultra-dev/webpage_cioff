CREATE TABLE IF NOT EXISTS "statuses_lang" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text,
	"status_id" integer,
	"lang_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "festivals" ADD COLUMN "status_id" integer;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "statuses_lang" ADD CONSTRAINT "statuses_lang_status_id_statuses_id_fk" FOREIGN KEY ("status_id") REFERENCES "public"."statuses"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "statuses_lang" ADD CONSTRAINT "statuses_lang_lang_id_languages_id_fk" FOREIGN KEY ("lang_id") REFERENCES "public"."languages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "festivals" ADD CONSTRAINT "festivals_status_id_statuses_id_fk" FOREIGN KEY ("status_id") REFERENCES "public"."statuses"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
