ALTER TABLE "festivals" ADD COLUMN "socia_media_links_id" integer;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "festivals" ADD CONSTRAINT "festivals_socia_media_links_id_social_media_links_id_fk" FOREIGN KEY ("socia_media_links_id") REFERENCES "public"."social_media_links"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
