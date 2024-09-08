ALTER TABLE "festivals" ALTER COLUMN "name" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "festivals" ALTER COLUMN "name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "festivals" ALTER COLUMN "description" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "festivals" ALTER COLUMN "description" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "festivals" ALTER COLUMN "director_name" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "festivals" ALTER COLUMN "director_name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "name" text;