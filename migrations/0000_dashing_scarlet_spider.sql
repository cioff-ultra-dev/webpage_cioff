DO $$ BEGIN
 CREATE TYPE "public"."state_mode" AS ENUM('offline', 'online');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "countries_lang_index" (
	"id" serial PRIMARY KEY NOT NULL,
	"en" integer,
	"es" integer,
	"fr" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "etl_countries" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text,
	"lang" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "docs" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text,
	"docfile" text NOT NULL,
	"dockeywords" text,
	"lang" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "events" (
	"id" serial PRIMARY KEY NOT NULL,
	"state_mode" "state_mode" DEFAULT 'offline',
	"title" text NOT NULL,
	"description" text NOT NULL,
	"logo" text,
	"url" text,
	"approved" boolean,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "festivals" (
	"id" serial PRIMARY KEY NOT NULL,
	"state_mode" "state_mode" DEFAULT 'offline',
	"name" text NOT NULL,
	"director_name" text NOT NULL,
	"phone" text,
	"description" text NOT NULL,
	"address" text,
	"location" text NOT NULL,
	"current_dates" text NOT NULL,
	"next_dates" text,
	"logo" text,
	"cover" text,
	"photos" text,
	"youtube_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "etl_festivals" (
	"id" serial PRIMARY KEY NOT NULL,
	"address" text,
	"name" text,
	"email" text,
	"url" text,
	"contact" text,
	"country_id" integer,
	"url_validated" boolean,
	"description" text,
	"phone" text,
	"state_mode" "state_mode" DEFAULT 'offline',
	"location" text,
	"current_dates" text,
	"next_dates" text,
	"logo" text,
	"cover" text,
	"photos" text,
	"youtube_id" text,
	"director_name" text,
	"categories" text,
	"lang" integer,
	"publish" boolean,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "festivals_to_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"festival_id" integer,
	"category_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "groups" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"general_director_name" text NOT NULL,
	"general_director_profile" text,
	"general_director_photo" text,
	"artistic_director_name" text,
	"artistic_director_profile" text,
	"artistic_director_photo" text,
	"phone" text,
	"address" text,
	"type_id" integer,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "languages" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text,
	"code" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "permissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text,
	"active" boolean,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text,
	"active" boolean,
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
CREATE TABLE IF NOT EXISTS "type_groups" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
