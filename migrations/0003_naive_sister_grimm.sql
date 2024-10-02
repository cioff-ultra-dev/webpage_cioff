ALTER TABLE "national_section_positions" ALTER COLUMN "birth_date" SET DATA TYPE date;--> statement-breakpoint
ALTER TABLE "national_section_positions" ALTER COLUMN "birth_date" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "national_section_positions" ALTER COLUMN "dead_date" SET DATA TYPE date;--> statement-breakpoint
ALTER TABLE "national_section_positions" ALTER COLUMN "dead_date" DROP DEFAULT;