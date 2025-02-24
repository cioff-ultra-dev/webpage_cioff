import { auth } from "@/auth";
import { formReportNationalSectionSchema } from "@/components/common/reports/national-section-form";
import { db } from "@/db";
import {
  activities,
  reportNationalSectionActivities,
  reportNationalSections,
} from "@/db/schema";
import { getTranslations } from "next-intl/server";
import { z } from "zod";

export async function POST(request: Request) {
  const result = (await request.json()) as z.infer<
    typeof formReportNationalSectionSchema
  >;

  const t = await getTranslations("notification");
  // const session = await auth();

  const { _activities, ...mainData } = result;

  // if (session?.user) {
  //   mainData.countryId = session.user.countryId;
  // }

  const reportId: number = await db.transaction(async (tx) => {
    const [report] = await tx
      .insert(reportNationalSections)
      .values({
        nsId: mainData.nsId,
        festivalSize: mainData.festivalSize,
        groupSize: mainData.groupSize,
        activeNationalCommission: mainData.activeNationalCommission ?? false,
        associationSize: mainData.associationSize ?? 0,
        individualMemberSize: mainData.individualMemberSize ?? 0,
        workDescription: mainData.workDescription,
      })
      .returning({
        id: reportNationalSections.id,
        nsId: reportNationalSections.nsId,
      });

    if (!report.id) {
      tx.rollback();
    }

    const activityValues = _activities.map((item) => ({
      reportNsId: report.id,
      lengthSize: item.lengthSize ?? 0,
      name: item.name,
      performerSize: item.performerSize ?? 0,
      reportTypeCategoryId: item.reportTypeCategoryId,
      reportModalityCategoryId: item.reportModalityCategoryId,
      reportLengthCategoryId: item.reportLengthCategoryId,
    }));

    await tx.insert(reportNationalSectionActivities).values(activityValues);

    return report.id;
  });

  return Response.json({ success: t("success"), reportId });
}
