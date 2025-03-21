ALTER TABLE "rating_group_to_festivals" ALTER COLUMN "rating_result" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "rating_group_to_festivals" ADD COLUMN "general_comment" text NOT NULL;--> statement-breakpoint
ALTER TABLE "rating_group_to_festivals" ADD COLUMN "type_of_compensation" text;--> statement-breakpoint
ALTER TABLE "rating_group_to_festivals" ADD COLUMN "financial_compensation" text;--> statement-breakpoint
ALTER TABLE "rating_group_to_festivals" ADD COLUMN "in_kind_compnesation" text;--> statement-breakpoint
ALTER TABLE "rating_group_to_festivals_answers" ADD COLUMN "comment" text;