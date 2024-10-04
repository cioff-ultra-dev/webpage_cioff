import { auth } from "@/auth";
import { formReportNationalSectionSchema } from "@/components/common/reports/national-section-form";
import { db } from "@/db";
import { activities, reportNationalSections } from "@/db/schema";
import { z } from "zod";

export async function POST(request: Request) {
  const result = (await request.json()) as z.infer<
    typeof formReportNationalSectionSchema
  >;
  const session = await auth();

  const { _activities, ...mainData } = result;

  if (session?.user) {
    mainData.countryId = session.user.countryId;
  }

  const reportId: number = await db.transaction(async (tx) => {
    const [report] = await tx
      .insert(reportNationalSections)
      .values(mainData)
      .returning({ id: reportNationalSections.id });

    if (!report.id) {
      tx.rollback();
    }

    const activityValues = _activities
      .filter((item) => Object.keys(item).length !== 0)
      .map((item) => {
        item.reportNationalSectionId = report.id;
        return item;
      });

    await tx.insert(activities).values(activityValues);

    return report.id;
  });

  return Response.json({ reportId });
}
