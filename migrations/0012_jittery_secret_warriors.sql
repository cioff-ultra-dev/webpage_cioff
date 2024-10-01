CREATE TABLE IF NOT EXISTS "prod"."rating_questions_lang" (
	"id" serial PRIMARY KEY NOT NULL,
	"lang" integer,
	"rating_question_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "prod"."rating_questions" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "prod"."rating_results" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"rating_type_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "prod"."rating_type" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "prod"."report_festival_lang" (
	"id" serial PRIMARY KEY NOT NULL,
	"lang" integer,
	"report_festival_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "prod"."report_group_lang" (
	"id" serial PRIMARY KEY NOT NULL,
	"lang" integer,
	"report_group_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "prod"."report_ns_lang" (
	"id" serial PRIMARY KEY NOT NULL,
	"lang" integer,
	"report_ns_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "prod"."report_ns_type_categories_lang" (
	"id" serial PRIMARY KEY NOT NULL,
	"lang" integer,
	"report_ns_type_category_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "prod"."report_ns_type_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "prod"."rating_questions_lang" ADD CONSTRAINT "rating_questions_lang_lang_languages_id_fk" FOREIGN KEY ("lang") REFERENCES "prod"."languages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "prod"."rating_questions_lang" ADD CONSTRAINT "rating_questions_lang_rating_question_id_rating_questions_id_fk" FOREIGN KEY ("rating_question_id") REFERENCES "prod"."rating_questions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "prod"."rating_results" ADD CONSTRAINT "rating_results_rating_type_id_rating_type_id_fk" FOREIGN KEY ("rating_type_id") REFERENCES "prod"."rating_type"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "prod"."report_festival_lang" ADD CONSTRAINT "report_festival_lang_lang_languages_id_fk" FOREIGN KEY ("lang") REFERENCES "prod"."languages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "prod"."report_festival_lang" ADD CONSTRAINT "report_festival_lang_report_festival_id_report_festival_id_fk" FOREIGN KEY ("report_festival_id") REFERENCES "prod"."report_festival"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "prod"."report_group_lang" ADD CONSTRAINT "report_group_lang_lang_languages_id_fk" FOREIGN KEY ("lang") REFERENCES "prod"."languages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "prod"."report_group_lang" ADD CONSTRAINT "report_group_lang_report_group_id_report_group_id_fk" FOREIGN KEY ("report_group_id") REFERENCES "prod"."report_group"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "prod"."report_ns_lang" ADD CONSTRAINT "report_ns_lang_lang_languages_id_fk" FOREIGN KEY ("lang") REFERENCES "prod"."languages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "prod"."report_ns_lang" ADD CONSTRAINT "report_ns_lang_report_ns_id_report_ns_id_fk" FOREIGN KEY ("report_ns_id") REFERENCES "prod"."report_ns"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "prod"."report_ns_type_categories_lang" ADD CONSTRAINT "report_ns_type_categories_lang_lang_languages_id_fk" FOREIGN KEY ("lang") REFERENCES "prod"."languages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "prod"."report_ns_type_categories_lang" ADD CONSTRAINT "report_ns_type_categories_lang_report_ns_type_category_id_report_ns_type_categories_id_fk" FOREIGN KEY ("report_ns_type_category_id") REFERENCES "prod"."report_ns_type_categories"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
