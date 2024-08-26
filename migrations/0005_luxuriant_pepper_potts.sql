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
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
