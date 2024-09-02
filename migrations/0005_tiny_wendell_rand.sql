CREATE TABLE IF NOT EXISTS "test_countries" (
	"id" serial PRIMARY KEY NOT NULL,
	"url" text,
	"member_id" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "test_docs" (
	"id" serial PRIMARY KEY NOT NULL,
	"docfile" text NOT NULL,
	"title" text,
	"lang" text,
	"dockeywords" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "test_event_dates" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" integer,
	"begin_date" date,
	"end_date" date
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "test_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text,
	"begin_date" date,
	"duration" integer,
	"international_caract" integer,
	"sector_caract" integer,
	"national_caract" integer,
	"url" text,
	"contact" text,
	"cioff_festival" integer,
	"children_festival" integer,
	"folk_singing" integer,
	"folk_dancing" integer,
	"folk_music" integer,
	"traditional_cooking" integer,
	"expositions" integer,
	"traditional_trades" integer,
	"traditional_games" integer,
	"conferences" integer,
	"authentik" integer,
	"elaborate" integer,
	"stylized" integer,
	"member_id" integer,
	"country_id" integer,
	"bannerenddate" date,
	"end_date" date,
	"begin_date1" date,
	"end_date1" date,
	"begin_date2" date,
	"end_date2" date,
	"aboutdate1" text,
	"aboutdate2" text,
	"publish" boolean,
	"description" text,
	"url_validated" boolean,
	"placename" text,
	"addr1" text,
	"addr2" text,
	"zip" text,
	"city" text,
	"contactname" text,
	"phone" text,
	"fax" text,
	"mobile" text,
	"email" text,
	"cioffLabelEndDate" date
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "test_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text,
	"firstname" text,
	"lastname" text,
	"addr1" text,
	"addr2" text,
	"city" text,
	"zip" text,
	"phone_mobile" text,
	"phone_office" text,
	"phone_private" text,
	"fax_office" text,
	"fax_private" text,
	"email" text,
	"url" text,
	"country_id" integer,
	"password" text,
	"active" boolean,
	"administrator" boolean,
	"events" boolean,
	"shareddocuments" boolean,
	"festival" boolean DEFAULT false,
	"communication" boolean DEFAULT false,
	"legal" boolean DEFAULT false
);
