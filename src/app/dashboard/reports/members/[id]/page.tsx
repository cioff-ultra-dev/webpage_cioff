import { auth } from "@/auth";
import ReportNationalSectionForm from "@/components/common/reports/national-section-form";
import { getNationalSectionById } from "@/db/queries/national-sections";
import {
  getFestivalsAndGroupsCounts,
  getOwnerByUserId,
  getReportNationalSection,
  getReportTypeCategoriesBySlugs,
} from "@/db/queries/reports";
import { getLocale } from "next-intl/server";
import { redirect } from "next/navigation";

export default async function ReportNationalSection({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();
  const locale = await getLocale();

  if (!session?.user) {
    return redirect("/dashboard");
  }

  const owner = await getOwnerByUserId(session.user.id);

  if (owner && !owner.nsId) {
    return <p>National Section's Owner not found</p>;
  }

  const currentNationalSection = await getNationalSectionById(
    owner?.nsId!,
    locale
  );

  const reportTypeCategoryActivity = await getReportTypeCategoriesBySlugs(
    ["conference", "workshop", "seminar", "congress", "national-festival"],
    locale
  );

  const reportModalityCategoryActivity = await getReportTypeCategoriesBySlugs(
    ["in-person", "online"],
    locale
  );

  const reportLengthCategoryActivity = await getReportTypeCategoriesBySlugs(
    ["days", "hours"],
    locale
  );

  const counts = await getFestivalsAndGroupsCounts(session.user.countryId!);
  const currentReport = await getReportNationalSection(
    Number(params.id),
    locale
  );

  return (
    <ReportNationalSectionForm
      user={session.user}
      counts={counts}
      currentNationalSection={currentNationalSection}
      reportTypeCategoryActivity={reportTypeCategoryActivity}
      reportModalityCategoryActivity={reportModalityCategoryActivity}
      reportLengthCategoryActivity={reportLengthCategoryActivity}
      currentReport={currentReport}
    />
  );
}
