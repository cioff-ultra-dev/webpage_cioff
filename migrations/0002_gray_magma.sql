ALTER TABLE "national_section_positions" DROP CONSTRAINT "national_section_positions_email_unique";--> statement-breakpoint
ALTER TABLE "national_section_positions" ALTER COLUMN "email" SET NOT NULL;