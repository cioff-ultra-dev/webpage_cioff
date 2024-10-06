DO $$ BEGIN
 CREATE TYPE "public"."lang_code" AS ENUM('en', 'es', 'fr');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."length_activity" AS ENUM('Hours', 'Days');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."modality_activity" AS ENUM('In Person', 'Online');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."state_mode" AS ENUM('offline', 'online');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."type_activity" AS ENUM('Conference', 'Workshop', 'Seminar', 'Congress', 'National Festival');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "account" (
	"userId" text NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	CONSTRAINT "account_provider_providerAccountId_pk" PRIMARY KEY("provider","providerAccountId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "announcements_files" (
	"id" serial PRIMARY KEY NOT NULL,
	"announcement_id" integer,
	"media_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "announcements" (
	"id" serial PRIMARY KEY NOT NULL,
	"to" text NOT NULL,
	"from" text NOT NULL,
	"subject" text NOT NULL,
	"description" text NOT NULL,
	"category_names" text NOT NULL,
	"created_by" text,
	"updated_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "authenticator" (
	"credentialID" text NOT NULL,
	"userId" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"credentialPublicKey" text NOT NULL,
	"counter" integer NOT NULL,
	"credentialDeviceType" text NOT NULL,
	"credentialBackedUp" boolean NOT NULL,
	"transports" text,
	CONSTRAINT "authenticator_userId_credentialID_pk" PRIMARY KEY("userId","credentialID"),
	CONSTRAINT "authenticator_credentialID_unique" UNIQUE("credentialID")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "categories_lang" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"caption" text,
	"lang" integer,
	"category_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"icon" text,
	"category_group_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "category_groups" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "countries_lang" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"lang" integer,
	"country_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "countries" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"lat" text,
	"lng" text,
	"native_lang" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "design" (
	"id" serial PRIMARY KEY NOT NULL,
	"banner_media_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "events_lang" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text,
	"description" text,
	"lang" integer,
	"event_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "events" (
	"id" serial PRIMARY KEY NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"festival_id" integer,
	"ns_id" integer,
	"active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "events_to_groups" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" integer,
	"group_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "festival_photos" (
	"id" serial PRIMARY KEY NOT NULL,
	"festival_id" integer,
	"photo_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "festival_to_categories" (
	"festival_id" integer,
	"category_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	CONSTRAINT "festival_to_categories_festival_id_category_id_pk" PRIMARY KEY("festival_id","category_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "festivals_lang" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text DEFAULT '' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"address" text,
	"other_translator_language" text,
	"lang" integer,
	"festival_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "festivals" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text DEFAULT '',
	"email" text,
	"url" text,
	"contact" text DEFAULT '' NOT NULL,
	"url_validated" boolean,
	"phone" text,
	"state_mode" "state_mode" DEFAULT 'offline',
	"location" text,
	"lat" text,
	"lng" text,
	"transport_lat" text,
	"transport_lng" text,
	"translator_languages" text,
	"peoples" integer,
	"youtube_id" text,
	"director_name" text DEFAULT '' NOT NULL,
	"categories" text,
	"publish" boolean,
	"status_id" integer,
	"ns_id" integer,
	"certification_member_id" integer,
	"country_id" integer,
	"logo_id" integer,
	"cover_id" integer,
	"created_by" text,
	"updated_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "group_to_categories" (
	"group_id" integer,
	"category_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	CONSTRAINT "group_to_categories_group_id_category_id_pk" PRIMARY KEY("group_id","category_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "groups_lang" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"address" text,
	"general_director_profile" text,
	"artistic_director_profile" text,
	"musical_director_profile" text,
	"lang" integer,
	"group_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "groups" (
	"id" serial PRIMARY KEY NOT NULL,
	"general_director_name" text,
	"general_director_photo" text,
	"artistic_director_name" text,
	"artistic_director_photo" text,
	"musical_director_name" text,
	"musical_director_photo" text,
	"is_able_travel_live_music" boolean DEFAULT false,
	"members_number" integer,
	"phone" text,
	"general_director_photo_id" integer,
	"artistic_director_photo_id" integer,
	"musical_director_photo_id" integer,
	"ns_id" integer,
	"country_id" integer,
	"certification_member_id" integer,
	"created_by" text,
	"updated_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "languages" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"code" "lang_code" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "menu_lang" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text,
	"lang" integer,
	"menu_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "menu" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"order" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "national_section_positions_lang" (
	"id" serial PRIMARY KEY NOT NULL,
	"short_bio" text NOT NULL,
	"lang" integer,
	"ns_positions_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "national_section_lang" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"about" text NOT NULL,
	"lang" integer,
	"ns_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "national_section_positions" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"phone" text NOT NULL,
	"email" text NOT NULL,
	"birth_date" date,
	"dead_date" date,
	"is_honorable" boolean DEFAULT false,
	"photo_id" integer,
	"ns_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "national_section_positions_test" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"phone" text,
	"email" text,
	"country_name" text,
	"birth_date" date,
	"dead_date" date,
	"is_honorable" boolean DEFAULT false,
	"country_id" integer,
	"ns_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "national_section" (
	"id" serial PRIMARY KEY NOT NULL,
	"published" boolean DEFAULT false,
	"slug" text NOT NULL,
	"socia_media_links_id" integer,
	"country_id" integer,
	"created_by" text,
	"updated_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "other_social_media_links" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text,
	"link" text,
	"social_media_link_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "owners" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text,
	"festival_id" integer,
	"group_id" integer,
	"ns_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "permissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "rating_festival_results_lang" (
	"id" serial PRIMARY KEY NOT NULL,
	"comment" text,
	"lang" integer NOT NULL,
	"rating_festival_to_groups_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "rating_festival_to_groups_answers_lang" (
	"id" serial PRIMARY KEY NOT NULL,
	"comment" text,
	"lang" integer NOT NULL,
	"rating_festival_to_groups_answers_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "rating_festival_to_groups_answers" (
	"id" serial PRIMARY KEY NOT NULL,
	"rating" integer NOT NULL,
	"rating_festival_to_groups_id" integer NOT NULL,
	"rating_question_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "rating_festival_to_groups" (
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
CREATE TABLE IF NOT EXISTS "rating_group_to_festivals_answers_lang" (
	"id" serial PRIMARY KEY NOT NULL,
	"comment" text,
	"lang" integer NOT NULL,
	"rating_group_to_festivals_answers_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "rating_group_results_lang" (
	"id" serial PRIMARY KEY NOT NULL,
	"comment" text,
	"lang" integer NOT NULL,
	"report_group_to_festivals_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "rating_group_to_festivals_answers" (
	"id" serial PRIMARY KEY NOT NULL,
	"rating" integer NOT NULL,
	"report_group_to_festivals_id" integer NOT NULL,
	"rating_question_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "rating_group_to_festivals" (
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
CREATE TABLE IF NOT EXISTS "rating_questions_lang" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text,
	"tooltip" text,
	"lang" integer NOT NULL,
	"rating_question_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "rating_questions" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"rating_type_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "rating_type" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "report_festival_activities" (
	"id" serial PRIMARY KEY NOT NULL,
	"report_type_category_id" integer NOT NULL,
	"report_festival_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "report_festival" (
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
CREATE TABLE IF NOT EXISTS "report_group" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"group_id" integer NOT NULL,
	"amount_persons_travelled" integer,
	"ich" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "report_group_type_locales" (
	"id" serial PRIMARY KEY NOT NULL,
	"report_type_category_id" integer NOT NULL,
	"report_group_to_festivals_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "report_group_type_locales_sleep" (
	"id" serial PRIMARY KEY NOT NULL,
	"report_type_category_id" integer NOT NULL,
	"report_group_to_festivals_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "report_ns_activities" (
	"id" serial PRIMARY KEY NOT NULL,
	"report_type_category_id" integer NOT NULL,
	"report_ns_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "report_ns_lang" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text,
	"comment" text,
	"work_description" text,
	"lang" integer NOT NULL,
	"report_ns_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "report_ns" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"festival_size" integer,
	"group_size" integer,
	"association_size" integer,
	"individual_memeber_size" integer,
	"active_national_commission" boolean,
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
CREATE TABLE IF NOT EXISTS "report_type_categories_lang" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"lang" integer NOT NULL,
	"report_type_category_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "report_type_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"oriented_to" text,
	"subType" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "roles_to_permissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"role_id" integer,
	"permission_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "session_group" (
	"id" serial PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "session" (
	"sessionToken" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "social_media_links" (
	"id" serial PRIMARY KEY NOT NULL,
	"facebook_link" text,
	"instagram_link" text,
	"website_link" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "statuses_lang" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text,
	"status_id" integer,
	"lang_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "statuses" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text,
	"slug" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "storage" (
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
CREATE TABLE IF NOT EXISTS "sub_pages" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"url" text NOT NULL,
	"is_news" boolean DEFAULT false,
	"original_date" timestamp NOT NULL,
	"published" boolean DEFAULT false,
	"created_by" text,
	"updated_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sub_pages_texts_lang" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"lang" integer,
	"subpage_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "subgroup_to_categories" (
	"subgroup_id" integer,
	"category_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	CONSTRAINT "subgroup_to_categories_subgroup_id_category_id_pk" PRIMARY KEY("subgroup_id","category_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "subgroups_lang" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text,
	"contact_address" text,
	"subgroup_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "subgroups" (
	"id" serial PRIMARY KEY NOT NULL,
	"members_number" integer,
	"contact_name" text,
	"contact_phone" text,
	"group_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "timeline_lang" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"lang" integer,
	"timeline_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "timeline" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"video_id" text,
	"media_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user" (
	"id" text PRIMARY KEY NOT NULL,
	"role_id" integer,
	"country_id" integer,
	"title" text,
	"name" text,
	"firstname" text,
	"lastname" text,
	"email" text NOT NULL,
	"address" text,
	"city" text,
	"zip" text,
	"phone" text,
	"image_id" integer,
	"password" text,
	"active" boolean DEFAULT false,
	"emailVerified" timestamp,
	"is_creation_notified" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "verificationToken" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "verificationToken_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "activities" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text,
	"type" "type_activity",
	"modality" "modality_activity",
	"length" "length_activity",
	"length_size" integer,
	"performer_size" integer,
	"report_national_section_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "email_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"lang" integer,
	"template" text NOT NULL,
	"tag" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "festivals_to_statuses" (
	"festival_id" integer,
	"status_id" integer,
	"question" text,
	"text" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	CONSTRAINT "festivals_to_statuses_festival_id_status_id_pk" PRIMARY KEY("festival_id","status_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "announcements_files" ADD CONSTRAINT "announcements_files_announcement_id_announcements_id_fk" FOREIGN KEY ("announcement_id") REFERENCES "public"."announcements"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "announcements_files" ADD CONSTRAINT "announcements_files_media_id_storage_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."storage"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "announcements" ADD CONSTRAINT "announcements_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "announcements" ADD CONSTRAINT "announcements_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "authenticator" ADD CONSTRAINT "authenticator_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "categories_lang" ADD CONSTRAINT "categories_lang_lang_languages_id_fk" FOREIGN KEY ("lang") REFERENCES "public"."languages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "categories_lang" ADD CONSTRAINT "categories_lang_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "categories" ADD CONSTRAINT "categories_category_group_id_category_groups_id_fk" FOREIGN KEY ("category_group_id") REFERENCES "public"."category_groups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "countries_lang" ADD CONSTRAINT "countries_lang_lang_languages_id_fk" FOREIGN KEY ("lang") REFERENCES "public"."languages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "countries_lang" ADD CONSTRAINT "countries_lang_country_id_countries_id_fk" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "countries" ADD CONSTRAINT "countries_native_lang_languages_id_fk" FOREIGN KEY ("native_lang") REFERENCES "public"."languages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "design" ADD CONSTRAINT "design_banner_media_id_storage_id_fk" FOREIGN KEY ("banner_media_id") REFERENCES "public"."storage"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "events_lang" ADD CONSTRAINT "events_lang_lang_languages_id_fk" FOREIGN KEY ("lang") REFERENCES "public"."languages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "events_lang" ADD CONSTRAINT "events_lang_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "events" ADD CONSTRAINT "events_festival_id_festivals_id_fk" FOREIGN KEY ("festival_id") REFERENCES "public"."festivals"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "events" ADD CONSTRAINT "events_ns_id_national_section_id_fk" FOREIGN KEY ("ns_id") REFERENCES "public"."national_section"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "events_to_groups" ADD CONSTRAINT "events_to_groups_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "events_to_groups" ADD CONSTRAINT "events_to_groups_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "festival_photos" ADD CONSTRAINT "festival_photos_festival_id_festivals_id_fk" FOREIGN KEY ("festival_id") REFERENCES "public"."festivals"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "festival_photos" ADD CONSTRAINT "festival_photos_photo_id_storage_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."storage"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "festival_to_categories" ADD CONSTRAINT "festival_to_categories_festival_id_festivals_id_fk" FOREIGN KEY ("festival_id") REFERENCES "public"."festivals"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "festival_to_categories" ADD CONSTRAINT "festival_to_categories_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "festivals_lang" ADD CONSTRAINT "festivals_lang_lang_languages_id_fk" FOREIGN KEY ("lang") REFERENCES "public"."languages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "festivals_lang" ADD CONSTRAINT "festivals_lang_festival_id_festivals_id_fk" FOREIGN KEY ("festival_id") REFERENCES "public"."festivals"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "festivals" ADD CONSTRAINT "festivals_status_id_statuses_id_fk" FOREIGN KEY ("status_id") REFERENCES "public"."statuses"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "festivals" ADD CONSTRAINT "festivals_ns_id_national_section_id_fk" FOREIGN KEY ("ns_id") REFERENCES "public"."national_section"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "festivals" ADD CONSTRAINT "festivals_certification_member_id_storage_id_fk" FOREIGN KEY ("certification_member_id") REFERENCES "public"."storage"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "festivals" ADD CONSTRAINT "festivals_country_id_countries_id_fk" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "festivals" ADD CONSTRAINT "festivals_logo_id_storage_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."storage"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "festivals" ADD CONSTRAINT "festivals_cover_id_storage_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."storage"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "festivals" ADD CONSTRAINT "festivals_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "festivals" ADD CONSTRAINT "festivals_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "group_to_categories" ADD CONSTRAINT "group_to_categories_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "group_to_categories" ADD CONSTRAINT "group_to_categories_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "groups_lang" ADD CONSTRAINT "groups_lang_lang_languages_id_fk" FOREIGN KEY ("lang") REFERENCES "public"."languages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "groups_lang" ADD CONSTRAINT "groups_lang_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "groups" ADD CONSTRAINT "groups_general_director_photo_id_storage_id_fk" FOREIGN KEY ("general_director_photo_id") REFERENCES "public"."storage"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "groups" ADD CONSTRAINT "groups_artistic_director_photo_id_storage_id_fk" FOREIGN KEY ("artistic_director_photo_id") REFERENCES "public"."storage"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "groups" ADD CONSTRAINT "groups_musical_director_photo_id_storage_id_fk" FOREIGN KEY ("musical_director_photo_id") REFERENCES "public"."storage"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "groups" ADD CONSTRAINT "groups_ns_id_national_section_id_fk" FOREIGN KEY ("ns_id") REFERENCES "public"."national_section"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "groups" ADD CONSTRAINT "groups_country_id_countries_id_fk" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "groups" ADD CONSTRAINT "groups_certification_member_id_storage_id_fk" FOREIGN KEY ("certification_member_id") REFERENCES "public"."storage"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "groups" ADD CONSTRAINT "groups_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "groups" ADD CONSTRAINT "groups_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "menu_lang" ADD CONSTRAINT "menu_lang_lang_languages_id_fk" FOREIGN KEY ("lang") REFERENCES "public"."languages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "menu_lang" ADD CONSTRAINT "menu_lang_menu_id_menu_id_fk" FOREIGN KEY ("menu_id") REFERENCES "public"."menu"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "national_section_positions_lang" ADD CONSTRAINT "national_section_positions_lang_lang_languages_id_fk" FOREIGN KEY ("lang") REFERENCES "public"."languages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "national_section_positions_lang" ADD CONSTRAINT "national_section_positions_lang_ns_positions_id_national_section_positions_id_fk" FOREIGN KEY ("ns_positions_id") REFERENCES "public"."national_section_positions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "national_section_lang" ADD CONSTRAINT "national_section_lang_lang_languages_id_fk" FOREIGN KEY ("lang") REFERENCES "public"."languages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "national_section_lang" ADD CONSTRAINT "national_section_lang_ns_id_national_section_id_fk" FOREIGN KEY ("ns_id") REFERENCES "public"."national_section"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "national_section_positions" ADD CONSTRAINT "national_section_positions_photo_id_storage_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."storage"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "national_section_positions" ADD CONSTRAINT "national_section_positions_ns_id_national_section_id_fk" FOREIGN KEY ("ns_id") REFERENCES "public"."national_section"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "national_section_positions_test" ADD CONSTRAINT "national_section_positions_test_country_id_countries_id_fk" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "national_section_positions_test" ADD CONSTRAINT "national_section_positions_test_ns_id_national_section_id_fk" FOREIGN KEY ("ns_id") REFERENCES "public"."national_section"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "national_section" ADD CONSTRAINT "national_section_socia_media_links_id_social_media_links_id_fk" FOREIGN KEY ("socia_media_links_id") REFERENCES "public"."social_media_links"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "national_section" ADD CONSTRAINT "national_section_country_id_countries_id_fk" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "national_section" ADD CONSTRAINT "national_section_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "national_section" ADD CONSTRAINT "national_section_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "other_social_media_links" ADD CONSTRAINT "other_social_media_links_social_media_link_id_social_media_links_id_fk" FOREIGN KEY ("social_media_link_id") REFERENCES "public"."social_media_links"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "owners" ADD CONSTRAINT "owners_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "owners" ADD CONSTRAINT "owners_festival_id_festivals_id_fk" FOREIGN KEY ("festival_id") REFERENCES "public"."festivals"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "owners" ADD CONSTRAINT "owners_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "owners" ADD CONSTRAINT "owners_ns_id_national_section_id_fk" FOREIGN KEY ("ns_id") REFERENCES "public"."national_section"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "rating_festival_results_lang" ADD CONSTRAINT "rating_festival_results_lang_lang_languages_id_fk" FOREIGN KEY ("lang") REFERENCES "public"."languages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "rating_festival_results_lang" ADD CONSTRAINT "rating_festival_results_lang_rating_festival_to_groups_id_rating_festival_to_groups_id_fk" FOREIGN KEY ("rating_festival_to_groups_id") REFERENCES "public"."rating_festival_to_groups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "rating_festival_to_groups_answers_lang" ADD CONSTRAINT "rating_festival_to_groups_answers_lang_lang_languages_id_fk" FOREIGN KEY ("lang") REFERENCES "public"."languages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "rating_festival_to_groups_answers_lang" ADD CONSTRAINT "rating_festival_to_groups_answers_lang_rating_festival_to_groups_answers_id_rating_festival_to_groups_answers_id_fk" FOREIGN KEY ("rating_festival_to_groups_answers_id") REFERENCES "public"."rating_festival_to_groups_answers"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "rating_festival_to_groups_answers" ADD CONSTRAINT "rating_festival_to_groups_answers_rating_festival_to_groups_id_rating_festival_to_groups_id_fk" FOREIGN KEY ("rating_festival_to_groups_id") REFERENCES "public"."rating_festival_to_groups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "rating_festival_to_groups_answers" ADD CONSTRAINT "rating_festival_to_groups_answers_rating_question_id_rating_questions_id_fk" FOREIGN KEY ("rating_question_id") REFERENCES "public"."rating_questions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "rating_festival_to_groups" ADD CONSTRAINT "rating_festival_to_groups_report_festival_id_report_festival_id_fk" FOREIGN KEY ("report_festival_id") REFERENCES "public"."report_festival"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "rating_festival_to_groups" ADD CONSTRAINT "rating_festival_to_groups_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "rating_group_to_festivals_answers_lang" ADD CONSTRAINT "rating_group_to_festivals_answers_lang_lang_languages_id_fk" FOREIGN KEY ("lang") REFERENCES "public"."languages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "rating_group_to_festivals_answers_lang" ADD CONSTRAINT "rating_group_to_festivals_answers_lang_rating_group_to_festivals_answers_id_rating_group_to_festivals_answers_id_fk" FOREIGN KEY ("rating_group_to_festivals_answers_id") REFERENCES "public"."rating_group_to_festivals_answers"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "rating_group_results_lang" ADD CONSTRAINT "rating_group_results_lang_lang_languages_id_fk" FOREIGN KEY ("lang") REFERENCES "public"."languages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "rating_group_results_lang" ADD CONSTRAINT "rating_group_results_lang_report_group_to_festivals_id_rating_group_to_festivals_id_fk" FOREIGN KEY ("report_group_to_festivals_id") REFERENCES "public"."rating_group_to_festivals"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "rating_group_to_festivals_answers" ADD CONSTRAINT "rating_group_to_festivals_answers_report_group_to_festivals_id_rating_group_to_festivals_id_fk" FOREIGN KEY ("report_group_to_festivals_id") REFERENCES "public"."rating_group_to_festivals"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "rating_group_to_festivals_answers" ADD CONSTRAINT "rating_group_to_festivals_answers_rating_question_id_rating_questions_id_fk" FOREIGN KEY ("rating_question_id") REFERENCES "public"."rating_questions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "rating_group_to_festivals" ADD CONSTRAINT "rating_group_to_festivals_report_group_id_report_group_id_fk" FOREIGN KEY ("report_group_id") REFERENCES "public"."report_group"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "rating_group_to_festivals" ADD CONSTRAINT "rating_group_to_festivals_festival_id_festivals_id_fk" FOREIGN KEY ("festival_id") REFERENCES "public"."festivals"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "rating_questions_lang" ADD CONSTRAINT "rating_questions_lang_lang_languages_id_fk" FOREIGN KEY ("lang") REFERENCES "public"."languages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "rating_questions_lang" ADD CONSTRAINT "rating_questions_lang_rating_question_id_rating_questions_id_fk" FOREIGN KEY ("rating_question_id") REFERENCES "public"."rating_questions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "rating_questions" ADD CONSTRAINT "rating_questions_rating_type_id_rating_type_id_fk" FOREIGN KEY ("rating_type_id") REFERENCES "public"."rating_type"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "report_festival_activities" ADD CONSTRAINT "report_festival_activities_report_type_category_id_report_type_categories_id_fk" FOREIGN KEY ("report_type_category_id") REFERENCES "public"."report_type_categories"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "report_festival_activities" ADD CONSTRAINT "report_festival_activities_report_festival_id_report_festival_id_fk" FOREIGN KEY ("report_festival_id") REFERENCES "public"."report_festival"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "report_festival" ADD CONSTRAINT "report_festival_festival_id_festivals_id_fk" FOREIGN KEY ("festival_id") REFERENCES "public"."festivals"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "report_group" ADD CONSTRAINT "report_group_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "report_group_type_locales" ADD CONSTRAINT "report_group_type_locales_report_type_category_id_report_type_categories_id_fk" FOREIGN KEY ("report_type_category_id") REFERENCES "public"."report_type_categories"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "report_group_type_locales" ADD CONSTRAINT "report_group_type_locales_report_group_to_festivals_id_rating_group_to_festivals_id_fk" FOREIGN KEY ("report_group_to_festivals_id") REFERENCES "public"."rating_group_to_festivals"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "report_group_type_locales_sleep" ADD CONSTRAINT "report_group_type_locales_sleep_report_type_category_id_report_type_categories_id_fk" FOREIGN KEY ("report_type_category_id") REFERENCES "public"."report_type_categories"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "report_group_type_locales_sleep" ADD CONSTRAINT "report_group_type_locales_sleep_report_group_to_festivals_id_rating_group_to_festivals_id_fk" FOREIGN KEY ("report_group_to_festivals_id") REFERENCES "public"."rating_group_to_festivals"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "report_ns_activities" ADD CONSTRAINT "report_ns_activities_report_type_category_id_report_type_categories_id_fk" FOREIGN KEY ("report_type_category_id") REFERENCES "public"."report_type_categories"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "report_ns_activities" ADD CONSTRAINT "report_ns_activities_report_ns_id_report_ns_id_fk" FOREIGN KEY ("report_ns_id") REFERENCES "public"."report_ns"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "report_ns_lang" ADD CONSTRAINT "report_ns_lang_lang_languages_id_fk" FOREIGN KEY ("lang") REFERENCES "public"."languages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "report_ns_lang" ADD CONSTRAINT "report_ns_lang_report_ns_id_report_ns_id_fk" FOREIGN KEY ("report_ns_id") REFERENCES "public"."report_ns"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "report_ns" ADD CONSTRAINT "report_ns_ns_id_national_section_id_fk" FOREIGN KEY ("ns_id") REFERENCES "public"."national_section"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "report_type_categories_lang" ADD CONSTRAINT "report_type_categories_lang_lang_languages_id_fk" FOREIGN KEY ("lang") REFERENCES "public"."languages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "report_type_categories_lang" ADD CONSTRAINT "report_type_categories_lang_report_type_category_id_report_type_categories_id_fk" FOREIGN KEY ("report_type_category_id") REFERENCES "public"."report_type_categories"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "roles_to_permissions" ADD CONSTRAINT "roles_to_permissions_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "roles_to_permissions" ADD CONSTRAINT "roles_to_permissions_permission_id_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "statuses_lang" ADD CONSTRAINT "statuses_lang_status_id_statuses_id_fk" FOREIGN KEY ("status_id") REFERENCES "public"."statuses"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "statuses_lang" ADD CONSTRAINT "statuses_lang_lang_id_languages_id_fk" FOREIGN KEY ("lang_id") REFERENCES "public"."languages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "storage" ADD CONSTRAINT "storage_lang_languages_id_fk" FOREIGN KEY ("lang") REFERENCES "public"."languages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sub_pages" ADD CONSTRAINT "sub_pages_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sub_pages" ADD CONSTRAINT "sub_pages_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sub_pages_texts_lang" ADD CONSTRAINT "sub_pages_texts_lang_lang_languages_id_fk" FOREIGN KEY ("lang") REFERENCES "public"."languages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sub_pages_texts_lang" ADD CONSTRAINT "sub_pages_texts_lang_subpage_id_sub_pages_id_fk" FOREIGN KEY ("subpage_id") REFERENCES "public"."sub_pages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "subgroup_to_categories" ADD CONSTRAINT "subgroup_to_categories_subgroup_id_subgroups_id_fk" FOREIGN KEY ("subgroup_id") REFERENCES "public"."subgroups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "subgroup_to_categories" ADD CONSTRAINT "subgroup_to_categories_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "subgroups_lang" ADD CONSTRAINT "subgroups_lang_subgroup_id_subgroups_id_fk" FOREIGN KEY ("subgroup_id") REFERENCES "public"."subgroups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "subgroups" ADD CONSTRAINT "subgroups_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "timeline_lang" ADD CONSTRAINT "timeline_lang_lang_languages_id_fk" FOREIGN KEY ("lang") REFERENCES "public"."languages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "timeline_lang" ADD CONSTRAINT "timeline_lang_timeline_id_timeline_id_fk" FOREIGN KEY ("timeline_id") REFERENCES "public"."timeline"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "timeline" ADD CONSTRAINT "timeline_media_id_storage_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."storage"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user" ADD CONSTRAINT "user_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user" ADD CONSTRAINT "user_country_id_countries_id_fk" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user" ADD CONSTRAINT "user_image_id_storage_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."storage"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "activities" ADD CONSTRAINT "activities_report_national_section_id_report_ns_id_fk" FOREIGN KEY ("report_national_section_id") REFERENCES "public"."report_ns"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "email_templates" ADD CONSTRAINT "email_templates_lang_languages_id_fk" FOREIGN KEY ("lang") REFERENCES "public"."languages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "festivals_to_statuses" ADD CONSTRAINT "festivals_to_statuses_festival_id_festivals_id_fk" FOREIGN KEY ("festival_id") REFERENCES "public"."festivals"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "festivals_to_statuses" ADD CONSTRAINT "festivals_to_statuses_status_id_statuses_id_fk" FOREIGN KEY ("status_id") REFERENCES "public"."statuses"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "emailUniqueIndex" ON "user" USING btree (lower("email"));