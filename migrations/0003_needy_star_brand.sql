DROP TABLE "etl_festivals";--> statement-breakpoint
ALTER TABLE "festivals" ALTER COLUMN "name" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "festivals" ALTER COLUMN "director_name" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "festivals" ALTER COLUMN "description" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "festivals" ALTER COLUMN "location" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "festivals" ALTER COLUMN "current_dates" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "festivals" ADD COLUMN "email" text;--> statement-breakpoint
ALTER TABLE "festivals" ADD COLUMN "url" text;--> statement-breakpoint
ALTER TABLE "festivals" ADD COLUMN "contact" text;--> statement-breakpoint
ALTER TABLE "festivals" ADD COLUMN "country_id" integer;--> statement-breakpoint
ALTER TABLE "festivals" ADD COLUMN "url_validated" boolean;--> statement-breakpoint
ALTER TABLE "festivals" ADD COLUMN "categories" text;--> statement-breakpoint
ALTER TABLE "festivals" ADD COLUMN "lang" integer;--> statement-breakpoint
ALTER TABLE "festivals" ADD COLUMN "publish" boolean;