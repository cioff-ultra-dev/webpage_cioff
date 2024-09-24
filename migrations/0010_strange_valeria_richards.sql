CREATE TABLE IF NOT EXISTS "groups_to_categories" (
	"festival_id" integer,
	"category_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	CONSTRAINT "groups_to_categories_festival_id_category_id_pk" PRIMARY KEY("festival_id","category_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "groups_to_categories" ADD CONSTRAINT "groups_to_categories_festival_id_groups_id_fk" FOREIGN KEY ("festival_id") REFERENCES "public"."groups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "groups_to_categories" ADD CONSTRAINT "groups_to_categories_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
