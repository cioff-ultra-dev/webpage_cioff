ALTER TABLE "groups" ADD COLUMN "general_diector_photo_storage_id" integer;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "groups" ADD CONSTRAINT "groups_general_diector_photo_storage_id_storage_id_fk" FOREIGN KEY ("general_diector_photo_storage_id") REFERENCES "public"."storage"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
