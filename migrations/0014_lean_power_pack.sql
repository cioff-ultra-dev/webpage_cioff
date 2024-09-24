ALTER TABLE "groups" RENAME COLUMN "general_diector_photo_storage_id" TO "director_photo_storage_id";--> statement-breakpoint
ALTER TABLE "groups" DROP CONSTRAINT "groups_general_diector_photo_storage_id_storage_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "groups" ADD CONSTRAINT "groups_director_photo_storage_id_storage_id_fk" FOREIGN KEY ("director_photo_storage_id") REFERENCES "public"."storage"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
