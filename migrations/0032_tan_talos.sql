CREATE TABLE IF NOT EXISTS "repertories" (
	"id" serial PRIMARY KEY NOT NULL,
	"gallery" text,
	"youtube_id" text,
	"group_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "repertories_lang" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text,
	"description" text,
	"repertory_id" integer,
	"lang" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "repertories" ADD CONSTRAINT "repertories_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "repertories_lang" ADD CONSTRAINT "repertories_lang_repertory_id_repertories_id_fk" FOREIGN KEY ("repertory_id") REFERENCES "public"."repertories"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "repertories_lang" ADD CONSTRAINT "repertories_lang_lang_languages_id_fk" FOREIGN KEY ("lang") REFERENCES "public"."languages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
