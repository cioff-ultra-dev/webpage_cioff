CREATE TABLE IF NOT EXISTS "social_media_links" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"link" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
