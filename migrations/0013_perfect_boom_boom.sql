CREATE TABLE IF NOT EXISTS "prod"."rating_festival_results_lang" (
	"id" serial PRIMARY KEY NOT NULL,
	"comment" text,
	"lang" integer NOT NULL,
	"rating_festival_to_groups_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "prod"."rating_festival_to_groups_answers_lang" (
	"id" serial PRIMARY KEY NOT NULL,
	"comment" text,
	"lang" integer NOT NULL,
	"rating_festival_to_groups_answers_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "prod"."rating_festival_to_groups_answers" (
	"id" serial PRIMARY KEY NOT NULL,
	"rating" integer NOT NULL,
	"rating_festival_to_groups_id" integer NOT NULL,
	"rating_question_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "prod"."rating_festival_to_groups" (
	"id" serial PRIMARY KEY NOT NULL,
	"rating_result" integer NOT NULL,
	"report_festival_id" integer NOT NULL,
	"group_id" integer,
	"name_no_cioff_group" text,
	"amount_persons_group" integer,
	"is_invitation_per_website" boolean,
	"is_invitation_per_ns" boolean,
	"is_group_live_music" boolean,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "prod"."rating_group_to_festivals_answers_lang" (
	"id" serial PRIMARY KEY NOT NULL,
	"comment" text,
	"lang" integer NOT NULL,
	"rating_group_to_festivals_answers_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "prod"."rating_group_results_lang" (
	"id" serial PRIMARY KEY NOT NULL,
	"comment" text,
	"lang" integer NOT NULL,
	"report_group_to_festivals_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "prod"."rating_group_to_festivals_answers" (
	"id" serial PRIMARY KEY NOT NULL,
	"rating" integer NOT NULL,
	"report_group_to_festivals_id" integer NOT NULL,
	"rating_question_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "prod"."rating_group_to_festivals" (
	"id" serial PRIMARY KEY NOT NULL,
	"rating_result" integer NOT NULL,
	"report_group_id" integer NOT NULL,
	"festival_id" integer,
	"name_no_cioff_festival" text,
	"introduction_before_performances" boolean,
	"is_logos_present" boolean,
	"at_least_5_foregin_groups" boolean,
	"festival_cover_travel_costs" boolean,
	"refreshments_during_performances" boolean,
	"financial_compensation_per_member" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "prod"."report_festival_activities" (
	"id" serial PRIMARY KEY NOT NULL,
	"report_type_category_id" integer NOT NULL,
	"report_festival_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "prod"."report_group_type_locales" (
	"id" serial PRIMARY KEY NOT NULL,
	"report_type_category_id" integer NOT NULL,
	"report_group_to_festivals_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "prod"."report_group_type_locales_sleep" (
	"id" serial PRIMARY KEY NOT NULL,
	"report_type_category_id" integer NOT NULL,
	"report_group_to_festivals_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "prod"."report_ns_activities" (
	"id" serial PRIMARY KEY NOT NULL,
	"report_type_category_id" integer NOT NULL,
	"report_ns_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "prod"."report_type_categories_lang" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"lang" integer NOT NULL,
	"report_type_category_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "prod"."report_type_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"oriented_to" text,
	"subType" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
DROP TABLE "prod"."rating_results";--> statement-breakpoint
DROP TABLE "prod"."report_festival_lang";--> statement-breakpoint
DROP TABLE "prod"."report_group_lang";--> statement-breakpoint
DROP TABLE "prod"."report_ns_type_categories_lang";--> statement-breakpoint
DROP TABLE "prod"."report_ns_type_categories";--> statement-breakpoint
ALTER TABLE "prod"."rating_type" RENAME COLUMN "slug" TO "name";--> statement-breakpoint
ALTER TABLE "prod"."rating_questions_lang" ALTER COLUMN "lang" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "prod"."rating_questions_lang" ALTER COLUMN "rating_question_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "prod"."report_ns_lang" ALTER COLUMN "lang" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "prod"."report_ns_lang" ALTER COLUMN "report_ns_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "prod"."rating_questions_lang" ADD COLUMN "name" text;--> statement-breakpoint
ALTER TABLE "prod"."rating_questions_lang" ADD COLUMN "tooltip" text;--> statement-breakpoint
ALTER TABLE "prod"."rating_questions" ADD COLUMN "rating_type_id" integer;--> statement-breakpoint
ALTER TABLE "prod"."report_festival" ADD COLUMN "festival_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "prod"."report_festival" ADD COLUMN "amount_people" integer;--> statement-breakpoint
ALTER TABLE "prod"."report_festival" ADD COLUMN "any_disabled_adults" integer;--> statement-breakpoint
ALTER TABLE "prod"."report_festival" ADD COLUMN "any_disabled_youth" integer;--> statement-breakpoint
ALTER TABLE "prod"."report_festival" ADD COLUMN "any_disabled_children" integer;--> statement-breakpoint
ALTER TABLE "prod"."report_festival" ADD COLUMN "amount_performances" integer;--> statement-breakpoint
ALTER TABLE "prod"."report_festival" ADD COLUMN "average_cost_ticket" integer;--> statement-breakpoint
ALTER TABLE "prod"."report_festival" ADD COLUMN "source_data" text;--> statement-breakpoint
ALTER TABLE "prod"."report_group" ADD COLUMN "group_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "prod"."report_group" ADD COLUMN "amount_persons_travelled" integer;--> statement-breakpoint
ALTER TABLE "prod"."report_group" ADD COLUMN "ich" text;--> statement-breakpoint
ALTER TABLE "prod"."report_ns_lang" ADD COLUMN "title" text;--> statement-breakpoint
ALTER TABLE "prod"."report_ns_lang" ADD COLUMN "comment" text;--> statement-breakpoint
ALTER TABLE "prod"."report_ns" ADD COLUMN "ns_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "prod"."report_ns" ADD COLUMN "number_festivals" integer;--> statement-breakpoint
ALTER TABLE "prod"."report_ns" ADD COLUMN "number_groups" integer;--> statement-breakpoint
ALTER TABLE "prod"."report_ns" ADD COLUMN "number_associations_or_other_organizations" integer;--> statement-breakpoint
ALTER TABLE "prod"."report_ns" ADD COLUMN "number_individual_members" integer;--> statement-breakpoint
ALTER TABLE "prod"."report_ns" ADD COLUMN "is_actively_engaged_nc" boolean;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "prod"."rating_festival_results_lang" ADD CONSTRAINT "rating_festival_results_lang_lang_languages_id_fk" FOREIGN KEY ("lang") REFERENCES "prod"."languages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "prod"."rating_festival_results_lang" ADD CONSTRAINT "rating_festival_results_lang_rating_festival_to_groups_id_rating_festival_to_groups_id_fk" FOREIGN KEY ("rating_festival_to_groups_id") REFERENCES "prod"."rating_festival_to_groups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "prod"."rating_festival_to_groups_answers_lang" ADD CONSTRAINT "rating_festival_to_groups_answers_lang_lang_languages_id_fk" FOREIGN KEY ("lang") REFERENCES "prod"."languages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "prod"."rating_festival_to_groups_answers_lang" ADD CONSTRAINT "rating_festival_to_groups_answers_lang_rating_festival_to_groups_answers_id_rating_festival_to_groups_answers_id_fk" FOREIGN KEY ("rating_festival_to_groups_answers_id") REFERENCES "prod"."rating_festival_to_groups_answers"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "prod"."rating_festival_to_groups_answers" ADD CONSTRAINT "rating_festival_to_groups_answers_rating_festival_to_groups_id_rating_festival_to_groups_id_fk" FOREIGN KEY ("rating_festival_to_groups_id") REFERENCES "prod"."rating_festival_to_groups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "prod"."rating_festival_to_groups_answers" ADD CONSTRAINT "rating_festival_to_groups_answers_rating_question_id_rating_questions_id_fk" FOREIGN KEY ("rating_question_id") REFERENCES "prod"."rating_questions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "prod"."rating_festival_to_groups" ADD CONSTRAINT "rating_festival_to_groups_report_festival_id_report_festival_id_fk" FOREIGN KEY ("report_festival_id") REFERENCES "prod"."report_festival"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "prod"."rating_festival_to_groups" ADD CONSTRAINT "rating_festival_to_groups_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "prod"."groups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "prod"."rating_group_to_festivals_answers_lang" ADD CONSTRAINT "rating_group_to_festivals_answers_lang_lang_languages_id_fk" FOREIGN KEY ("lang") REFERENCES "prod"."languages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "prod"."rating_group_to_festivals_answers_lang" ADD CONSTRAINT "rating_group_to_festivals_answers_lang_rating_group_to_festivals_answers_id_rating_group_to_festivals_answers_id_fk" FOREIGN KEY ("rating_group_to_festivals_answers_id") REFERENCES "prod"."rating_group_to_festivals_answers"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "prod"."rating_group_results_lang" ADD CONSTRAINT "rating_group_results_lang_lang_languages_id_fk" FOREIGN KEY ("lang") REFERENCES "prod"."languages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "prod"."rating_group_results_lang" ADD CONSTRAINT "rating_group_results_lang_report_group_to_festivals_id_rating_group_to_festivals_id_fk" FOREIGN KEY ("report_group_to_festivals_id") REFERENCES "prod"."rating_group_to_festivals"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "prod"."rating_group_to_festivals_answers" ADD CONSTRAINT "rating_group_to_festivals_answers_report_group_to_festivals_id_rating_group_to_festivals_id_fk" FOREIGN KEY ("report_group_to_festivals_id") REFERENCES "prod"."rating_group_to_festivals"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "prod"."rating_group_to_festivals_answers" ADD CONSTRAINT "rating_group_to_festivals_answers_rating_question_id_rating_questions_id_fk" FOREIGN KEY ("rating_question_id") REFERENCES "prod"."rating_questions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "prod"."rating_group_to_festivals" ADD CONSTRAINT "rating_group_to_festivals_report_group_id_report_group_id_fk" FOREIGN KEY ("report_group_id") REFERENCES "prod"."report_group"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "prod"."rating_group_to_festivals" ADD CONSTRAINT "rating_group_to_festivals_festival_id_festivals_id_fk" FOREIGN KEY ("festival_id") REFERENCES "prod"."festivals"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "prod"."report_festival_activities" ADD CONSTRAINT "report_festival_activities_report_type_category_id_report_type_categories_id_fk" FOREIGN KEY ("report_type_category_id") REFERENCES "prod"."report_type_categories"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "prod"."report_festival_activities" ADD CONSTRAINT "report_festival_activities_report_festival_id_report_festival_id_fk" FOREIGN KEY ("report_festival_id") REFERENCES "prod"."report_festival"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "prod"."report_group_type_locales" ADD CONSTRAINT "report_group_type_locales_report_type_category_id_report_type_categories_id_fk" FOREIGN KEY ("report_type_category_id") REFERENCES "prod"."report_type_categories"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "prod"."report_group_type_locales" ADD CONSTRAINT "report_group_type_locales_report_group_to_festivals_id_rating_group_to_festivals_id_fk" FOREIGN KEY ("report_group_to_festivals_id") REFERENCES "prod"."rating_group_to_festivals"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "prod"."report_group_type_locales_sleep" ADD CONSTRAINT "report_group_type_locales_sleep_report_type_category_id_report_type_categories_id_fk" FOREIGN KEY ("report_type_category_id") REFERENCES "prod"."report_type_categories"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "prod"."report_group_type_locales_sleep" ADD CONSTRAINT "report_group_type_locales_sleep_report_group_to_festivals_id_rating_group_to_festivals_id_fk" FOREIGN KEY ("report_group_to_festivals_id") REFERENCES "prod"."rating_group_to_festivals"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "prod"."report_ns_activities" ADD CONSTRAINT "report_ns_activities_report_type_category_id_report_type_categories_id_fk" FOREIGN KEY ("report_type_category_id") REFERENCES "prod"."report_type_categories"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "prod"."report_ns_activities" ADD CONSTRAINT "report_ns_activities_report_ns_id_report_ns_id_fk" FOREIGN KEY ("report_ns_id") REFERENCES "prod"."report_ns"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "prod"."report_type_categories_lang" ADD CONSTRAINT "report_type_categories_lang_lang_languages_id_fk" FOREIGN KEY ("lang") REFERENCES "prod"."languages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "prod"."report_type_categories_lang" ADD CONSTRAINT "report_type_categories_lang_report_type_category_id_report_type_categories_id_fk" FOREIGN KEY ("report_type_category_id") REFERENCES "prod"."report_type_categories"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "prod"."rating_questions" ADD CONSTRAINT "rating_questions_rating_type_id_rating_type_id_fk" FOREIGN KEY ("rating_type_id") REFERENCES "prod"."rating_type"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "prod"."report_festival" ADD CONSTRAINT "report_festival_festival_id_festivals_id_fk" FOREIGN KEY ("festival_id") REFERENCES "prod"."festivals"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "prod"."report_group" ADD CONSTRAINT "report_group_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "prod"."groups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "prod"."report_ns" ADD CONSTRAINT "report_ns_ns_id_national_section_id_fk" FOREIGN KEY ("ns_id") REFERENCES "prod"."national_section"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
