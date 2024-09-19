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
CREATE TABLE IF NOT EXISTS "statuses" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text,
	"slug" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "festivals" ALTER COLUMN "name" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "festivals" ALTER COLUMN "contact" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "festivals" ALTER COLUMN "contact" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "festivals" ADD COLUMN "lat" text;--> statement-breakpoint
ALTER TABLE "festivals" ADD COLUMN "lng" text;--> statement-breakpoint
ALTER TABLE "festivals" ADD COLUMN "transport_lat" text;--> statement-breakpoint
ALTER TABLE "festivals" ADD COLUMN "transport_lng" text;--> statement-breakpoint
ALTER TABLE "festivals" ADD COLUMN "translator_languages" text;--> statement-breakpoint
ALTER TABLE "festivals" ADD COLUMN "peoples" integer;--> statement-breakpoint
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
