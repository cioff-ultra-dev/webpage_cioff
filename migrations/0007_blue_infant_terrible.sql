ALTER TABLE "group_to_categories" RENAME COLUMN "festival_id" TO "group_id";--> statement-breakpoint
ALTER TABLE "group_to_categories" DROP CONSTRAINT "group_to_categories_festival_id_groups_id_fk";
--> statement-breakpoint
ALTER TABLE "group_to_categories" DROP CONSTRAINT "group_to_categories_festival_id_category_id_pk";--> statement-breakpoint
ALTER TABLE "group_to_categories" ADD CONSTRAINT "group_to_categories_group_id_category_id_pk" PRIMARY KEY("group_id","category_id");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "group_to_categories" ADD CONSTRAINT "group_to_categories_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
