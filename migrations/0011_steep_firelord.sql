ALTER TABLE "groups" ADD COLUMN "cover_photo_id" integer;--> statement-breakpoint
ALTER TABLE "groups" ADD COLUMN "logo_id" integer;--> statement-breakpoint
ALTER TABLE "groups" ADD COLUMN "video_link" text;--> statement-breakpoint
ALTER TABLE "groups" ADD COLUMN "facebook_link" text;--> statement-breakpoint
ALTER TABLE "groups" ADD COLUMN "instagram_link" text;--> statement-breakpoint
ALTER TABLE "groups" ADD COLUMN "website_link" text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "groups" ADD CONSTRAINT "groups_cover_photo_id_storages_id_fk" FOREIGN KEY ("cover_photo_id") REFERENCES "public"."storages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "groups" ADD CONSTRAINT "groups_logo_id_storages_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."storages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
