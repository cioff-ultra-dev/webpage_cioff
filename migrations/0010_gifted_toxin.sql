CREATE TABLE IF NOT EXISTS "category_groups" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "text" text;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "category_group_id" integer;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "categories" ADD CONSTRAINT "categories_category_group_id_category_groups_id_fk" FOREIGN KEY ("category_group_id") REFERENCES "public"."category_groups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
