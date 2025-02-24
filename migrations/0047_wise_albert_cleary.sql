ALTER TABLE "rating_group_to_festivals" ALTER COLUMN "financial_compensation" SET DATA TYPE integer USING "financial_compensation"::integer;--> statement-breakpoint
ALTER TABLE "report_group" ALTER COLUMN "slug" SET DEFAULT '';
