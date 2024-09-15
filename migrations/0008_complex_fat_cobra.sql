CREATE SCHEMA "PROD";
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."lang_code" AS ENUM('en', 'es', 'fr');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "PROD"."Account" (
	"user_id" integer,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"provider_account_id" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	CONSTRAINT "Account_provider_provider_account_id_pk" PRIMARY KEY("provider","provider_account_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "PROD"."Authenticator" (
	"credential_id" text NOT NULL,
	"user_id" integer,
	"provider_account_id" text NOT NULL,
	"credential_public_key" text NOT NULL,
	"counter" integer NOT NULL,
	"credential_device_type" text NOT NULL,
	"credential_backed_up" boolean NOT NULL,
	"transports" text,
	CONSTRAINT "Authenticator_credential_id_pk" PRIMARY KEY("credential_id"),
	CONSTRAINT "Authenticator_credential_id_unique" UNIQUE("credential_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "PROD"."CategoriesLang" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"lang" integer,
	"category_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "PROD"."Categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"icon" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "PROD"."CountriesLang" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"country_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "PROD"."Countries" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "PROD"."Design" (
	"id" serial PRIMARY KEY NOT NULL,
	"banner_media_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "PROD"."EmailsDocs" (
	"id" serial PRIMARY KEY NOT NULL,
	"email_id" integer,
	"media_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "PROD"."Emails" (
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
CREATE TABLE IF NOT EXISTS "PROD"."Events" (
	"id" serial PRIMARY KEY NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"festival_id" integer,
	"active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "PROD"."EventsToGroups" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" integer,
	"group_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "PROD"."FestivalPhotos" (
	"id" serial PRIMARY KEY NOT NULL,
	"festival_id" integer,
	"photo_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "PROD"."FestivalToCategories" (
	"id" serial PRIMARY KEY NOT NULL,
	"festival_id" integer,
	"category_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "PROD"."FestivalsLang" (
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
CREATE TABLE IF NOT EXISTS "PROD"."Festivals" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"state_mode" "state_mode" DEFAULT 'offline',
	"url_validated" boolean DEFAULT false,
	"director_name" text DEFAULT '' NOT NULL,
	"email" text NOT NULL,
	"url" text,
	"contact" text,
	"phone" text,
	"location" text,
	"current_dates" text,
	"youtube_id" text,
	"published" boolean DEFAULT false,
	"country_id" integer,
	"logo_id" integer,
	"cover_id" integer,
	"created_by" integer,
	"updated_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	CONSTRAINT "Festivals_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "PROD"."GroupsLang" (
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
CREATE TABLE IF NOT EXISTS "PROD"."Groups" (
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
CREATE TABLE IF NOT EXISTS "PROD"."Languages" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"code" "lang_code" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "PROD"."MenuLang" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text,
	"lang" integer,
	"menu_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "PROD"."Menu" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"order" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "PROD"."NationalSectionLang" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"about" text NOT NULL,
	"about_young" text NOT NULL,
	"ns_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "PROD"."NationalSectionPositionsLang" (
	"id" serial PRIMARY KEY NOT NULL,
	"short_bio" text NOT NULL,
	"lang" integer,
	"ns_positions_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "PROD"."NationalSectionPositions" (
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
	CONSTRAINT "NationalSectionPositions_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "PROD"."NationalSection" (
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
CREATE TABLE IF NOT EXISTS "PROD"."Permissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "PROD"."Roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "PROD"."RolesToPermissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"role_id" integer,
	"permission_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "PROD"."Session" (
	"session_token" text PRIMARY KEY NOT NULL,
	"user_id" integer,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "PROD"."SocialMediaLinks" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"link" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "PROD"."Storage" (
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
CREATE TABLE IF NOT EXISTS "PROD"."SubPagesDocs" (
	"id" serial PRIMARY KEY NOT NULL,
	"order" integer NOT NULL,
	"subpage_id" integer,
	"media_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "PROD"."SubPages" (
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
CREATE TABLE IF NOT EXISTS "PROD"."SubPagesTextsLang" (
	"id" serial PRIMARY KEY NOT NULL,
	"description" text NOT NULL,
	"order" integer NOT NULL,
	"lang" integer,
	"subpage_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "PROD"."TimelineLang" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"lang" integer,
	"timeline_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "PROD"."Timeline" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"video_id" text,
	"media_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "PROD"."TypeGroups" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "PROD"."Users" (
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
	CONSTRAINT "Users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "PROD"."VerificationToken" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "VerificationToken_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "PROD"."Account" ADD CONSTRAINT "Account_user_id_Users_id_fk" FOREIGN KEY ("user_id") REFERENCES "PROD"."Users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "PROD"."Authenticator" ADD CONSTRAINT "Authenticator_user_id_Users_id_fk" FOREIGN KEY ("user_id") REFERENCES "PROD"."Users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "PROD"."CategoriesLang" ADD CONSTRAINT "CategoriesLang_lang_Languages_id_fk" FOREIGN KEY ("lang") REFERENCES "PROD"."Languages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "PROD"."CategoriesLang" ADD CONSTRAINT "CategoriesLang_category_id_Categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "PROD"."Categories"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "PROD"."CountriesLang" ADD CONSTRAINT "CountriesLang_country_id_Countries_id_fk" FOREIGN KEY ("country_id") REFERENCES "PROD"."Countries"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "PROD"."Design" ADD CONSTRAINT "Design_banner_media_id_Storage_id_fk" FOREIGN KEY ("banner_media_id") REFERENCES "PROD"."Storage"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "PROD"."EmailsDocs" ADD CONSTRAINT "EmailsDocs_email_id_Emails_id_fk" FOREIGN KEY ("email_id") REFERENCES "PROD"."Emails"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "PROD"."EmailsDocs" ADD CONSTRAINT "EmailsDocs_media_id_Storage_id_fk" FOREIGN KEY ("media_id") REFERENCES "PROD"."Storage"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "PROD"."Emails" ADD CONSTRAINT "Emails_created_by_Users_id_fk" FOREIGN KEY ("created_by") REFERENCES "PROD"."Users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "PROD"."Emails" ADD CONSTRAINT "Emails_updated_by_Users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "PROD"."Users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "PROD"."Events" ADD CONSTRAINT "Events_festival_id_Festivals_id_fk" FOREIGN KEY ("festival_id") REFERENCES "PROD"."Festivals"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "PROD"."EventsToGroups" ADD CONSTRAINT "EventsToGroups_event_id_Events_id_fk" FOREIGN KEY ("event_id") REFERENCES "PROD"."Events"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "PROD"."EventsToGroups" ADD CONSTRAINT "EventsToGroups_group_id_Groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "PROD"."Groups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "PROD"."FestivalPhotos" ADD CONSTRAINT "FestivalPhotos_festival_id_Festivals_id_fk" FOREIGN KEY ("festival_id") REFERENCES "PROD"."Festivals"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "PROD"."FestivalPhotos" ADD CONSTRAINT "FestivalPhotos_photo_id_Storage_id_fk" FOREIGN KEY ("photo_id") REFERENCES "PROD"."Storage"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "PROD"."FestivalToCategories" ADD CONSTRAINT "FestivalToCategories_festival_id_Festivals_id_fk" FOREIGN KEY ("festival_id") REFERENCES "PROD"."Festivals"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "PROD"."FestivalToCategories" ADD CONSTRAINT "FestivalToCategories_category_id_Categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "PROD"."Categories"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "PROD"."FestivalsLang" ADD CONSTRAINT "FestivalsLang_lang_Languages_id_fk" FOREIGN KEY ("lang") REFERENCES "PROD"."Languages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "PROD"."FestivalsLang" ADD CONSTRAINT "FestivalsLang_festival_id_Festivals_id_fk" FOREIGN KEY ("festival_id") REFERENCES "PROD"."Festivals"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "PROD"."Festivals" ADD CONSTRAINT "Festivals_country_id_Countries_id_fk" FOREIGN KEY ("country_id") REFERENCES "PROD"."Countries"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "PROD"."Festivals" ADD CONSTRAINT "Festivals_logo_id_Storage_id_fk" FOREIGN KEY ("logo_id") REFERENCES "PROD"."Storage"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "PROD"."Festivals" ADD CONSTRAINT "Festivals_cover_id_Storage_id_fk" FOREIGN KEY ("cover_id") REFERENCES "PROD"."Storage"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "PROD"."Festivals" ADD CONSTRAINT "Festivals_created_by_Users_id_fk" FOREIGN KEY ("created_by") REFERENCES "PROD"."Users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "PROD"."Festivals" ADD CONSTRAINT "Festivals_updated_by_Users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "PROD"."Users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "PROD"."GroupsLang" ADD CONSTRAINT "GroupsLang_lang_Languages_id_fk" FOREIGN KEY ("lang") REFERENCES "PROD"."Languages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "PROD"."GroupsLang" ADD CONSTRAINT "GroupsLang_group_id_Groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "PROD"."Groups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "PROD"."Groups" ADD CONSTRAINT "Groups_general_director_photo_id_Storage_id_fk" FOREIGN KEY ("general_director_photo_id") REFERENCES "PROD"."Storage"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "PROD"."Groups" ADD CONSTRAINT "Groups_artistic_director_photo_id_Storage_id_fk" FOREIGN KEY ("artistic_director_photo_id") REFERENCES "PROD"."Storage"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "PROD"."Groups" ADD CONSTRAINT "Groups_type_id_TypeGroups_id_fk" FOREIGN KEY ("type_id") REFERENCES "PROD"."TypeGroups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "PROD"."Groups" ADD CONSTRAINT "Groups_created_by_Users_id_fk" FOREIGN KEY ("created_by") REFERENCES "PROD"."Users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "PROD"."Groups" ADD CONSTRAINT "Groups_updated_by_Users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "PROD"."Users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "PROD"."MenuLang" ADD CONSTRAINT "MenuLang_lang_Languages_id_fk" FOREIGN KEY ("lang") REFERENCES "PROD"."Languages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "PROD"."MenuLang" ADD CONSTRAINT "MenuLang_menu_id_Menu_id_fk" FOREIGN KEY ("menu_id") REFERENCES "PROD"."Menu"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "PROD"."NationalSectionLang" ADD CONSTRAINT "NationalSectionLang_ns_id_NationalSection_id_fk" FOREIGN KEY ("ns_id") REFERENCES "PROD"."NationalSection"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "PROD"."NationalSectionPositionsLang" ADD CONSTRAINT "NationalSectionPositionsLang_lang_Languages_id_fk" FOREIGN KEY ("lang") REFERENCES "PROD"."Languages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "PROD"."NationalSectionPositionsLang" ADD CONSTRAINT "NationalSectionPositionsLang_ns_positions_id_NationalSectionPositions_id_fk" FOREIGN KEY ("ns_positions_id") REFERENCES "PROD"."NationalSectionPositions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "PROD"."NationalSectionPositions" ADD CONSTRAINT "NationalSectionPositions_photo_id_Storage_id_fk" FOREIGN KEY ("photo_id") REFERENCES "PROD"."Storage"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "PROD"."NationalSectionPositions" ADD CONSTRAINT "NationalSectionPositions_ns_id_NationalSection_id_fk" FOREIGN KEY ("ns_id") REFERENCES "PROD"."NationalSection"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "PROD"."NationalSection" ADD CONSTRAINT "NationalSection_country_id_Countries_id_fk" FOREIGN KEY ("country_id") REFERENCES "PROD"."Countries"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "PROD"."NationalSection" ADD CONSTRAINT "NationalSection_created_by_Users_id_fk" FOREIGN KEY ("created_by") REFERENCES "PROD"."Users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "PROD"."NationalSection" ADD CONSTRAINT "NationalSection_updated_by_Users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "PROD"."Users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "PROD"."RolesToPermissions" ADD CONSTRAINT "RolesToPermissions_role_id_Roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "PROD"."Roles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "PROD"."RolesToPermissions" ADD CONSTRAINT "RolesToPermissions_permission_id_Permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "PROD"."Permissions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "PROD"."Session" ADD CONSTRAINT "Session_user_id_Users_id_fk" FOREIGN KEY ("user_id") REFERENCES "PROD"."Users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "PROD"."Storage" ADD CONSTRAINT "Storage_lang_Languages_id_fk" FOREIGN KEY ("lang") REFERENCES "PROD"."Languages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "PROD"."SubPagesDocs" ADD CONSTRAINT "SubPagesDocs_subpage_id_SubPages_id_fk" FOREIGN KEY ("subpage_id") REFERENCES "PROD"."SubPages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "PROD"."SubPagesDocs" ADD CONSTRAINT "SubPagesDocs_media_id_Storage_id_fk" FOREIGN KEY ("media_id") REFERENCES "PROD"."Storage"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "PROD"."SubPages" ADD CONSTRAINT "SubPages_created_by_Users_id_fk" FOREIGN KEY ("created_by") REFERENCES "PROD"."Users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "PROD"."SubPages" ADD CONSTRAINT "SubPages_updated_by_Users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "PROD"."Users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "PROD"."SubPagesTextsLang" ADD CONSTRAINT "SubPagesTextsLang_lang_Languages_id_fk" FOREIGN KEY ("lang") REFERENCES "PROD"."Languages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "PROD"."SubPagesTextsLang" ADD CONSTRAINT "SubPagesTextsLang_subpage_id_SubPages_id_fk" FOREIGN KEY ("subpage_id") REFERENCES "PROD"."SubPages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "PROD"."TimelineLang" ADD CONSTRAINT "TimelineLang_lang_Languages_id_fk" FOREIGN KEY ("lang") REFERENCES "PROD"."Languages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "PROD"."TimelineLang" ADD CONSTRAINT "TimelineLang_timeline_id_Timeline_id_fk" FOREIGN KEY ("timeline_id") REFERENCES "PROD"."Timeline"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "PROD"."Timeline" ADD CONSTRAINT "Timeline_media_id_Storage_id_fk" FOREIGN KEY ("media_id") REFERENCES "PROD"."Storage"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "PROD"."Users" ADD CONSTRAINT "Users_role_id_Roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "PROD"."Roles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "PROD"."Users" ADD CONSTRAINT "Users_country_id_Countries_id_fk" FOREIGN KEY ("country_id") REFERENCES "PROD"."Countries"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "PROD"."Users" ADD CONSTRAINT "Users_image_id_Storage_id_fk" FOREIGN KEY ("image_id") REFERENCES "PROD"."Storage"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
