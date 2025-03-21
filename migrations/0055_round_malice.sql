ALTER TABLE "report_festival_activities" DROP CONSTRAINT "report_festival_activities_report_festival_id_report_festival_id_fk";
--> statement-breakpoint
ALTER TABLE "rating_questions" ADD COLUMN "active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "report_festival_activities" ADD CONSTRAINT "report_festival_activities_report_festival_id_report_festival_id_fk" FOREIGN KEY ("report_festival_id") REFERENCES "public"."report_festival"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
