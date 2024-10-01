ALTER TABLE "prod"."festivals" DROP CONSTRAINT "festivals_email_unique";--> statement-breakpoint
ALTER TABLE "prod"."festivals" ALTER COLUMN "email" DROP NOT NULL;