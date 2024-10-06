ALTER TABLE "sub_pages" ADD COLUMN "country_id" integer;--> statement-breakpoint
ALTER TABLE "sub_pages" ADD COLUMN "socia_media_links_id" integer;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "slug" text NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "category_group_id" integer;--> statement-breakpoint
ALTER TABLE "groups" ADD COLUMN "cover_photo_id" integer;--> statement-breakpoint
ALTER TABLE "groups" ADD COLUMN "logo_id" integer;--> statement-breakpoint
ALTER TABLE "groups" ADD COLUMN "video_link" text;--> statement-breakpoint
ALTER TABLE "groups" ADD COLUMN "facebook_link" text;--> statement-breakpoint
ALTER TABLE "groups" ADD COLUMN "instagram_link" text;--> statement-breakpoint
ALTER TABLE "groups" ADD COLUMN "website_link" text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sub_pages" ADD CONSTRAINT "sub_pages_country_id_countries_id_fk" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sub_pages" ADD CONSTRAINT "sub_pages_socia_media_links_id_social_media_links_id_fk" FOREIGN KEY ("socia_media_links_id") REFERENCES "public"."social_media_links"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "events" ADD CONSTRAINT "events_category_group_id_category_groups_id_fk" FOREIGN KEY ("category_group_id") REFERENCES "public"."category_groups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "groups" ADD CONSTRAINT "groups_cover_photo_id_storage_id_fk" FOREIGN KEY ("cover_photo_id") REFERENCES "public"."storage"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "groups" ADD CONSTRAINT "groups_logo_id_storage_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."storage"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
