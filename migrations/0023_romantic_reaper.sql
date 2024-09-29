CREATE TABLE IF NOT EXISTS "other_social_media_links" (
	"id" serial NOT NULL,
	"name" text,
	"link" text,
	"social_media_link_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "social_media_links" RENAME COLUMN "name" TO "facebook_link";--> statement-breakpoint
ALTER TABLE "social_media_links" RENAME COLUMN "slug" TO "instagram_link";--> statement-breakpoint
ALTER TABLE "social_media_links" RENAME COLUMN "link" TO "website_link";--> statement-breakpoint
ALTER TABLE "social_media_links" ALTER COLUMN "facebook_link" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "national_section" ADD COLUMN "socia_media_links_id" integer;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "other_social_media_links" ADD CONSTRAINT "other_social_media_links_social_media_link_id_social_media_links_id_fk" FOREIGN KEY ("social_media_link_id") REFERENCES "public"."social_media_links"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "national_section" ADD CONSTRAINT "national_section_socia_media_links_id_social_media_links_id_fk" FOREIGN KEY ("socia_media_links_id") REFERENCES "public"."social_media_links"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
