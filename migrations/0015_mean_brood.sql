CREATE TABLE IF NOT EXISTS "video_tutorial_links" (
	"id" serial PRIMARY KEY NOT NULL,
	"lang" integer,
	"role" integer,
	"link" text NOT NULL,
	"tag" text
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "video_tutorial_links" ADD CONSTRAINT "video_tutorial_links_lang_languages_id_fk" FOREIGN KEY ("lang") REFERENCES "public"."languages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "video_tutorial_links" ADD CONSTRAINT "video_tutorial_links_role_roles_id_fk" FOREIGN KEY ("role") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
