ALTER TABLE "report_ns_activities" ADD COLUMN "name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "report_ns_activities" ADD COLUMN "report_modality_category_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "report_ns_activities" ADD COLUMN "report_length_category_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "report_ns_activities" ADD COLUMN "length_size" integer;--> statement-breakpoint
ALTER TABLE "report_ns_activities" ADD COLUMN "performer_size" integer;--> statement-breakpoint
ALTER TABLE "report_ns" ADD COLUMN "work_description" text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "report_ns_activities" ADD CONSTRAINT "report_ns_activities_report_modality_category_id_report_type_categories_id_fk" FOREIGN KEY ("report_modality_category_id") REFERENCES "public"."report_type_categories"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "report_ns_activities" ADD CONSTRAINT "report_ns_activities_report_length_category_id_report_type_categories_id_fk" FOREIGN KEY ("report_length_category_id") REFERENCES "public"."report_type_categories"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
