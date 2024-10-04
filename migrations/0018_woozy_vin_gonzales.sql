CREATE SCHEMA "public";
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "public"."categories_lang" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"lang" integer,
	"category_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "public"."categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"icon" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "public"."countries_lang" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"lang" integer,
	"country_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "public"."countries" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"lat" text,
	"lng" text,
	"native_lang" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "public"."design" (
	"id" serial PRIMARY KEY NOT NULL,
	"banner_media_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "public"."announcements_files" (
	"id" serial PRIMARY KEY NOT NULL,
	"email_id" integer,
	"media_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "public"."announcements" (
	"id" serial PRIMARY KEY NOT NULL,
	"to" text NOT NULL,
	"from" text NOT NULL,
	"subject" text NOT NULL,
	"description" text NOT NULL,
	"category_names" text NOT NULL,
	"created_by" integer,
	"updated_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "public"."events" (
	"id" serial PRIMARY KEY NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"festival_id" integer,
	"active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "public"."events_to_groups" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" integer,
	"group_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "public"."festival_photos" (
	"id" serial PRIMARY KEY NOT NULL,
	"festival_id" integer,
	"photo_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "public"."festival_to_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"festival_id" integer,
	"category_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "public"."festivals_lang" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text DEFAULT '' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"address" text NOT NULL,
	"lang" integer,
	"festival_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "public"."festivals" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"state_mode" text DEFAULT 'offline',
	"url_validated" boolean DEFAULT false,
	"director_name" text DEFAULT '' NOT NULL,
	"email" text,
	"url" text,
	"contact" text,
	"phone" text,
	"lat" text,
	"lng" text,
	"transport_lat" text,
	"transport_lng" text,
	"youtube_id" text,
	"published" boolean DEFAULT false,
	"country_id" integer,
	"logo_id" integer,
	"cover_id" integer,
	"created_by" integer,
	"updated_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "public"."groups_lang" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"address" text NOT NULL,
	"general_director_profile" text,
	"artistic_director_profile" text,
	"lang" integer,
	"group_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "public"."groups" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text,
	"phone" text,
	"general_director_name" text NOT NULL,
	"artistic_director_name" text,
	"general_director_photo_id" integer,
	"artistic_director_photo_id" integer,
	"type_id" integer,
	"created_by" integer,
	"updated_by" integer,
	"published" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "public"."languages" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "public"."menu_lang" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text,
	"lang" integer,
	"menu_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "public"."menu" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"order" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "public"."national_section_lang" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"about" text,
	"about_young" text,
	"ns_id" integer,
	"lang" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "public"."national_section_positions_lang" (
	"id" serial PRIMARY KEY NOT NULL,
	"short_bio" text NOT NULL,
	"lang" integer,
	"ns_positions_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "public"."national_section_positions" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"phone" text NOT NULL,
	"email" text NOT NULL,
	"birth_date" timestamp NOT NULL,
	"dead_date" timestamp,
	"is_honorable" boolean DEFAULT false,
	"photo_id" integer,
	"ns_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	CONSTRAINT "national_section_positions_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "public"."national_section" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"published" boolean DEFAULT false,
	"country_id" integer,
	"created_by" integer,
	"updated_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "public"."owners" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"festival_id" integer,
	"group_id" integer,
	"ns_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "public"."permissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "public"."rating_festival_results_lang" (
	"id" serial PRIMARY KEY NOT NULL,
	"comment" text,
	"lang" integer NOT NULL,
	"rating_festival_to_groups_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "public"."rating_festival_to_groups_answers_lang" (
	"id" serial PRIMARY KEY NOT NULL,
	"comment" text,
	"lang" integer NOT NULL,
	"rating_festival_to_groups_answers_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "public"."rating_festival_to_groups_answers" (
	"id" serial PRIMARY KEY NOT NULL,
	"rating" integer NOT NULL,
	"rating_festival_to_groups_id" integer NOT NULL,
	"rating_question_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "public"."rating_festival_to_groups" (
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
CREATE TABLE IF NOT EXISTS "public"."rating_group_to_festivals_answers_lang" (
	"id" serial PRIMARY KEY NOT NULL,
	"comment" text,
	"lang" integer NOT NULL,
	"rating_group_to_festivals_answers_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "public"."rating_group_results_lang" (
	"id" serial PRIMARY KEY NOT NULL,
	"comment" text,
	"lang" integer NOT NULL,
	"report_group_to_festivals_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "public"."rating_group_to_festivals_answers" (
	"id" serial PRIMARY KEY NOT NULL,
	"rating" integer NOT NULL,
	"report_group_to_festivals_id" integer NOT NULL,
	"rating_question_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "public"."rating_group_to_festivals" (
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
CREATE TABLE IF NOT EXISTS "public"."rating_questions_lang" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text,
	"tooltip" text,
	"lang" integer NOT NULL,
	"rating_question_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "public"."rating_questions" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"rating_type_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "public"."rating_type" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "public"."report_festival_activities" (
	"id" serial PRIMARY KEY NOT NULL,
	"report_type_category_id" integer NOT NULL,
	"report_festival_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "public"."report_festival" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"festival_id" integer NOT NULL,
	"amount_people" integer,
	"any_disabled_adults" integer,
	"any_disabled_youth" integer,
	"any_disabled_children" integer,
	"amount_performances" integer,
	"average_cost_ticket" integer,
	"source_data" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "public"."report_group" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"group_id" integer NOT NULL,
	"amount_persons_travelled" integer,
	"ich" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "public"."report_group_type_locales" (
	"id" serial PRIMARY KEY NOT NULL,
	"report_type_category_id" integer NOT NULL,
	"report_group_to_festivals_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "public"."report_group_type_locales_sleep" (
	"id" serial PRIMARY KEY NOT NULL,
	"report_type_category_id" integer NOT NULL,
	"report_group_to_festivals_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "public"."report_ns_activities" (
	"id" serial PRIMARY KEY NOT NULL,
	"report_type_category_id" integer NOT NULL,
	"report_ns_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "public"."report_ns_lang" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text,
	"comment" text,
	"lang" integer NOT NULL,
	"report_ns_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "public"."report_ns" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"ns_id" integer NOT NULL,
	"number_festivals" integer,
	"number_groups" integer,
	"number_associations_or_other_organizations" integer,
	"number_individual_members" integer,
	"is_actively_engaged_nc" boolean,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "public"."report_type_categories_lang" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"lang" integer NOT NULL,
	"report_type_category_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "public"."report_type_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"oriented_to" text,
	"subType" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "public"."roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "public"."roles_to_permissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"role_id" integer,
	"permission_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "public"."social_media_links" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"link" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "public"."storage" (
	"id" serial PRIMARY KEY NOT NULL,
	"url" text NOT NULL,
	"name" text,
	"aux" text,
	"keywords" text,
	"lang" integer,
	"is_file" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "public"."sub_pages" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"url" text NOT NULL,
	"is_news" boolean DEFAULT false,
	"original_date" timestamp NOT NULL,
	"published" boolean DEFAULT false,
	"created_by" integer,
	"updated_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "public"."sub_pages_texts_lang" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"lang" integer,
	"subpage_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "public"."timeline_lang" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"lang" integer,
	"timeline_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "public"."timeline" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"video_id" text,
	"media_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "public"."type_groups" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "public"."users" (
	"id" serial PRIMARY KEY NOT NULL,
	"role_id" integer,
	"country_id" integer,
	"email" text NOT NULL,
	"email_verified" timestamp,
	"password" text NOT NULL,
	"firstname" text NOT NULL,
	"lastname" text NOT NULL,
	"title" text,
	"address" text,
	"city" text,
	"zip" text,
	"phone" text,
	"image_id" integer,
	"active" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "public"."categories_lang" ADD CONSTRAINT "categories_lang_lang_languages_id_fk" FOREIGN KEY ("lang") REFERENCES "public"."languages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "public"."categories_lang" ADD CONSTRAINT "categories_lang_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "public"."countries_lang" ADD CONSTRAINT "countries_lang_lang_languages_id_fk" FOREIGN KEY ("lang") REFERENCES "public"."languages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "public"."countries_lang" ADD CONSTRAINT "countries_lang_country_id_countries_id_fk" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "public"."countries" ADD CONSTRAINT "countries_native_lang_languages_id_fk" FOREIGN KEY ("native_lang") REFERENCES "public"."languages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "public"."design" ADD CONSTRAINT "design_banner_media_id_storage_id_fk" FOREIGN KEY ("banner_media_id") REFERENCES "public"."storage"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "public"."announcements_files" ADD CONSTRAINT "announcements_files_email_id_announcements_id_fk" FOREIGN KEY ("email_id") REFERENCES "public"."announcements"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "public"."announcements_files" ADD CONSTRAINT "announcements_files_media_id_storage_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."storage"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "public"."announcements" ADD CONSTRAINT "announcements_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "public"."announcements" ADD CONSTRAINT "announcements_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "public"."events" ADD CONSTRAINT "events_festival_id_festivals_id_fk" FOREIGN KEY ("festival_id") REFERENCES "public"."festivals"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "public"."events_to_groups" ADD CONSTRAINT "events_to_groups_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "public"."events_to_groups" ADD CONSTRAINT "events_to_groups_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "public"."festival_photos" ADD CONSTRAINT "festival_photos_festival_id_festivals_id_fk" FOREIGN KEY ("festival_id") REFERENCES "public"."festivals"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "public"."festival_photos" ADD CONSTRAINT "festival_photos_photo_id_storage_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."storage"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "public"."festival_to_categories" ADD CONSTRAINT "festival_to_categories_festival_id_festivals_id_fk" FOREIGN KEY ("festival_id") REFERENCES "public"."festivals"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "public"."festival_to_categories" ADD CONSTRAINT "festival_to_categories_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "public"."festivals_lang" ADD CONSTRAINT "festivals_lang_lang_languages_id_fk" FOREIGN KEY ("lang") REFERENCES "public"."languages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "public"."festivals_lang" ADD CONSTRAINT "festivals_lang_festival_id_festivals_id_fk" FOREIGN KEY ("festival_id") REFERENCES "public"."festivals"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "public"."festivals" ADD CONSTRAINT "festivals_country_id_countries_id_fk" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "public"."festivals" ADD CONSTRAINT "festivals_logo_id_storage_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."storage"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "public"."festivals" ADD CONSTRAINT "festivals_cover_id_storage_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."storage"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "public"."festivals" ADD CONSTRAINT "festivals_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "public"."festivals" ADD CONSTRAINT "festivals_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "public"."groups_lang" ADD CONSTRAINT "groups_lang_lang_languages_id_fk" FOREIGN KEY ("lang") REFERENCES "public"."languages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "public"."groups_lang" ADD CONSTRAINT "groups_lang_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "public"."groups" ADD CONSTRAINT "groups_general_director_photo_id_storage_id_fk" FOREIGN KEY ("general_director_photo_id") REFERENCES "public"."storage"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "public"."groups" ADD CONSTRAINT "groups_artistic_director_photo_id_storage_id_fk" FOREIGN KEY ("artistic_director_photo_id") REFERENCES "public"."storage"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "public"."groups" ADD CONSTRAINT "groups_type_id_type_groups_id_fk" FOREIGN KEY ("type_id") REFERENCES "public"."type_groups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "public"."groups" ADD CONSTRAINT "groups_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "public"."groups" ADD CONSTRAINT "groups_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "public"."menu_lang" ADD CONSTRAINT "menu_lang_lang_languages_id_fk" FOREIGN KEY ("lang") REFERENCES "public"."languages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "public"."menu_lang" ADD CONSTRAINT "menu_lang_menu_id_menu_id_fk" FOREIGN KEY ("menu_id") REFERENCES "public"."menu"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "public"."national_section_lang" ADD CONSTRAINT "national_section_lang_ns_id_national_section_id_fk" FOREIGN KEY ("ns_id") REFERENCES "public"."national_section"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "public"."national_section_lang" ADD CONSTRAINT "national_section_lang_lang_languages_id_fk" FOREIGN KEY ("lang") REFERENCES "public"."languages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "public"."national_section_positions_lang" ADD CONSTRAINT "national_section_positions_lang_lang_languages_id_fk" FOREIGN KEY ("lang") REFERENCES "public"."languages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "public"."national_section_positions_lang" ADD CONSTRAINT "national_section_positions_lang_ns_positions_id_national_section_positions_id_fk" FOREIGN KEY ("ns_positions_id") REFERENCES "public"."national_section_positions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "public"."national_section_positions" ADD CONSTRAINT "national_section_positions_photo_id_storage_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."storage"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "public"."national_section_positions" ADD CONSTRAINT "national_section_positions_ns_id_national_section_id_fk" FOREIGN KEY ("ns_id") REFERENCES "public"."national_section"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "public"."national_section" ADD CONSTRAINT "national_section_country_id_countries_id_fk" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "public"."national_section" ADD CONSTRAINT "national_section_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "public"."national_section" ADD CONSTRAINT "national_section_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "public"."owners" ADD CONSTRAINT "owners_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "public"."owners" ADD CONSTRAINT "owners_festival_id_festivals_id_fk" FOREIGN KEY ("festival_id") REFERENCES "public"."festivals"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "public"."owners" ADD CONSTRAINT "owners_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "public"."owners" ADD CONSTRAINT "owners_ns_id_national_section_id_fk" FOREIGN KEY ("ns_id") REFERENCES "public"."national_section"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "public"."rating_festival_results_lang" ADD CONSTRAINT "rating_festival_results_lang_lang_languages_id_fk" FOREIGN KEY ("lang") REFERENCES "public"."languages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "public"."rating_festival_results_lang" ADD CONSTRAINT "rating_festival_results_lang_rating_festival_to_groups_id_rating_festival_to_groups_id_fk" FOREIGN KEY ("rating_festival_to_groups_id") REFERENCES "public"."rating_festival_to_groups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "public"."rating_festival_to_groups_answers_lang" ADD CONSTRAINT "rating_festival_to_groups_answers_lang_lang_languages_id_fk" FOREIGN KEY ("lang") REFERENCES "public"."languages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "public"."rating_festival_to_groups_answers_lang" ADD CONSTRAINT "rating_festival_to_groups_answers_lang_rating_festival_to_groups_answers_id_rating_festival_to_groups_answers_id_fk" FOREIGN KEY ("rating_festival_to_groups_answers_id") REFERENCES "public"."rating_festival_to_groups_answers"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "public"."rating_festival_to_groups_answers" ADD CONSTRAINT "rating_festival_to_groups_answers_rating_festival_to_groups_id_rating_festival_to_groups_id_fk" FOREIGN KEY ("rating_festival_to_groups_id") REFERENCES "public"."rating_festival_to_groups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "public"."rating_festival_to_groups_answers" ADD CONSTRAINT "rating_festival_to_groups_answers_rating_question_id_rating_questions_id_fk" FOREIGN KEY ("rating_question_id") REFERENCES "public"."rating_questions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "public"."rating_festival_to_groups" ADD CONSTRAINT "rating_festival_to_groups_report_festival_id_report_festival_id_fk" FOREIGN KEY ("report_festival_id") REFERENCES "public"."report_festival"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "public"."rating_festival_to_groups" ADD CONSTRAINT "rating_festival_to_groups_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "public"."rating_group_to_festivals_answers_lang" ADD CONSTRAINT "rating_group_to_festivals_answers_lang_lang_languages_id_fk" FOREIGN KEY ("lang") REFERENCES "public"."languages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "public"."rating_group_to_festivals_answers_lang" ADD CONSTRAINT "rating_group_to_festivals_answers_lang_rating_group_to_festivals_answers_id_rating_group_to_festivals_answers_id_fk" FOREIGN KEY ("rating_group_to_festivals_answers_id") REFERENCES "public"."rating_group_to_festivals_answers"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "public"."rating_group_results_lang" ADD CONSTRAINT "rating_group_results_lang_lang_languages_id_fk" FOREIGN KEY ("lang") REFERENCES "public"."languages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "public"."rating_group_results_lang" ADD CONSTRAINT "rating_group_results_lang_report_group_to_festivals_id_rating_group_to_festivals_id_fk" FOREIGN KEY ("report_group_to_festivals_id") REFERENCES "public"."rating_group_to_festivals"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "public"."rating_group_to_festivals_answers" ADD CONSTRAINT "rating_group_to_festivals_answers_report_group_to_festivals_id_rating_group_to_festivals_id_fk" FOREIGN KEY ("report_group_to_festivals_id") REFERENCES "public"."rating_group_to_festivals"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "public"."rating_group_to_festivals_answers" ADD CONSTRAINT "rating_group_to_festivals_answers_rating_question_id_rating_questions_id_fk" FOREIGN KEY ("rating_question_id") REFERENCES "public"."rating_questions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "public"."rating_group_to_festivals" ADD CONSTRAINT "rating_group_to_festivals_report_group_id_report_group_id_fk" FOREIGN KEY ("report_group_id") REFERENCES "public"."report_group"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "public"."rating_group_to_festivals" ADD CONSTRAINT "rating_group_to_festivals_festival_id_festivals_id_fk" FOREIGN KEY ("festival_id") REFERENCES "public"."festivals"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "public"."rating_questions_lang" ADD CONSTRAINT "rating_questions_lang_lang_languages_id_fk" FOREIGN KEY ("lang") REFERENCES "public"."languages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "public"."rating_questions_lang" ADD CONSTRAINT "rating_questions_lang_rating_question_id_rating_questions_id_fk" FOREIGN KEY ("rating_question_id") REFERENCES "public"."rating_questions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "public"."rating_questions" ADD CONSTRAINT "rating_questions_rating_type_id_rating_type_id_fk" FOREIGN KEY ("rating_type_id") REFERENCES "public"."rating_type"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "public"."report_festival_activities" ADD CONSTRAINT "report_festival_activities_report_type_category_id_report_type_categories_id_fk" FOREIGN KEY ("report_type_category_id") REFERENCES "public"."report_type_categories"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "public"."report_festival_activities" ADD CONSTRAINT "report_festival_activities_report_festival_id_report_festival_id_fk" FOREIGN KEY ("report_festival_id") REFERENCES "public"."report_festival"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "public"."report_festival" ADD CONSTRAINT "report_festival_festival_id_festivals_id_fk" FOREIGN KEY ("festival_id") REFERENCES "public"."festivals"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "public"."report_group" ADD CONSTRAINT "report_group_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "public"."report_group_type_locales" ADD CONSTRAINT "report_group_type_locales_report_type_category_id_report_type_categories_id_fk" FOREIGN KEY ("report_type_category_id") REFERENCES "public"."report_type_categories"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "public"."report_group_type_locales" ADD CONSTRAINT "report_group_type_locales_report_group_to_festivals_id_rating_group_to_festivals_id_fk" FOREIGN KEY ("report_group_to_festivals_id") REFERENCES "public"."rating_group_to_festivals"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "public"."report_group_type_locales_sleep" ADD CONSTRAINT "report_group_type_locales_sleep_report_type_category_id_report_type_categories_id_fk" FOREIGN KEY ("report_type_category_id") REFERENCES "public"."report_type_categories"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "public"."report_group_type_locales_sleep" ADD CONSTRAINT "report_group_type_locales_sleep_report_group_to_festivals_id_rating_group_to_festivals_id_fk" FOREIGN KEY ("report_group_to_festivals_id") REFERENCES "public"."rating_group_to_festivals"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "public"."report_ns_activities" ADD CONSTRAINT "report_ns_activities_report_type_category_id_report_type_categories_id_fk" FOREIGN KEY ("report_type_category_id") REFERENCES "public"."report_type_categories"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "public"."report_ns_activities" ADD CONSTRAINT "report_ns_activities_report_ns_id_report_ns_id_fk" FOREIGN KEY ("report_ns_id") REFERENCES "public"."report_ns"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "public"."report_ns_lang" ADD CONSTRAINT "report_ns_lang_lang_languages_id_fk" FOREIGN KEY ("lang") REFERENCES "public"."languages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "public"."report_ns_lang" ADD CONSTRAINT "report_ns_lang_report_ns_id_report_ns_id_fk" FOREIGN KEY ("report_ns_id") REFERENCES "public"."report_ns"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "public"."report_ns" ADD CONSTRAINT "report_ns_ns_id_national_section_id_fk" FOREIGN KEY ("ns_id") REFERENCES "public"."national_section"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "public"."report_type_categories_lang" ADD CONSTRAINT "report_type_categories_lang_lang_languages_id_fk" FOREIGN KEY ("lang") REFERENCES "public"."languages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "public"."report_type_categories_lang" ADD CONSTRAINT "report_type_categories_lang_report_type_category_id_report_type_categories_id_fk" FOREIGN KEY ("report_type_category_id") REFERENCES "public"."report_type_categories"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "public"."roles_to_permissions" ADD CONSTRAINT "roles_to_permissions_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "public"."roles_to_permissions" ADD CONSTRAINT "roles_to_permissions_permission_id_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "public"."storage" ADD CONSTRAINT "storage_lang_languages_id_fk" FOREIGN KEY ("lang") REFERENCES "public"."languages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "public"."sub_pages" ADD CONSTRAINT "sub_pages_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "public"."sub_pages" ADD CONSTRAINT "sub_pages_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "public"."sub_pages_texts_lang" ADD CONSTRAINT "sub_pages_texts_lang_lang_languages_id_fk" FOREIGN KEY ("lang") REFERENCES "public"."languages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "public"."sub_pages_texts_lang" ADD CONSTRAINT "sub_pages_texts_lang_subpage_id_sub_pages_id_fk" FOREIGN KEY ("subpage_id") REFERENCES "public"."sub_pages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "public"."timeline_lang" ADD CONSTRAINT "timeline_lang_lang_languages_id_fk" FOREIGN KEY ("lang") REFERENCES "public"."languages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "public"."timeline_lang" ADD CONSTRAINT "timeline_lang_timeline_id_timeline_id_fk" FOREIGN KEY ("timeline_id") REFERENCES "public"."timeline"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "public"."timeline" ADD CONSTRAINT "timeline_media_id_storage_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."storage"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "public"."users" ADD CONSTRAINT "users_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "public"."users" ADD CONSTRAINT "users_country_id_countries_id_fk" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "public"."users" ADD CONSTRAINT "users_image_id_storage_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."storage"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
