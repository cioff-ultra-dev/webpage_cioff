ALTER TABLE "subgroup_to_categories" RENAME COLUMN "group_id" TO "subgroup_id";--> statement-breakpoint
ALTER TABLE "subgroup_to_categories" DROP CONSTRAINT "subgroup_to_categories_group_id_subgroups_id_fk";
--> statement-breakpoint
ALTER TABLE "subgroup_to_categories" DROP CONSTRAINT "subgroup_to_categories_group_id_category_id_pk";--> statement-breakpoint
ALTER TABLE "subgroup_to_categories" ADD CONSTRAINT "subgroup_to_categories_subgroup_id_category_id_pk" PRIMARY KEY("subgroup_id","category_id");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "subgroup_to_categories" ADD CONSTRAINT "subgroup_to_categories_subgroup_id_subgroups_id_fk" FOREIGN KEY ("subgroup_id") REFERENCES "public"."subgroups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
