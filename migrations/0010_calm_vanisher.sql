CREATE TABLE IF NOT EXISTS "prod"."report_festival" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "prod"."report_group" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "prod"."report_ns" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "prod"."national_section_lang" ALTER COLUMN "about" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "prod"."national_section_lang" ALTER COLUMN "about_young" DROP NOT NULL;