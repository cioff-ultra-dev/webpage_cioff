import { auth } from "@/auth";
import ReportGroupForm from "@/components/common/reports/group-form";
import { getAllCountries } from "@/db/queries/countries";
import { getGroupById } from "@/db/queries/groups";
import {
  getAllRatingQuestionByType,
  getOwnerByUserId,
  getReportGroup,
  getReportTypeCategoriesBySlugs,
} from "@/db/queries/reports";
import { getLocale } from "next-intl/server";
import { redirect } from "next/navigation";

export default async function ReportGroupDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();
  const locale = await getLocale();

  if (!session?.user) {
    return redirect("/login");
  }

  const owner = await getOwnerByUserId(session.user.id);
  const reportTypeCategoriesLocales = await getReportTypeCategoriesBySlugs(
    ["theatre", "cultural-centre", "open-air", "sports-hall-tent"],
    locale
  );

  const reportTypeCategoriesSleeps = await getReportTypeCategoriesBySlugs(
    ["hotel-residence", "school", "youth-hostel", "family-houses"],
    locale
  );
  const countries = await getAllCountries();

  if (owner && !owner.groupId) {
    return redirect("/dashboard/reports");
  }

  const currentGroup = await getGroupById(owner?.groupId!);
  const currentRatingQuestions = await getAllRatingQuestionByType(
    "festival",
    locale
  );
  const currentReport = await getReportGroup(Number(params.id), locale);

  if (currentReport && !currentReport.draft) {
    return redirect("/dashboard/reports");
  }

  return (
    <ReportGroupForm
      user={session.user}
      currentGroup={currentGroup}
      ratingQuestions={currentRatingQuestions}
      countries={countries}
      reportTypeCategoriesLocales={reportTypeCategoriesLocales}
      reportTypeCategoriesSleeps={reportTypeCategoriesSleeps}
      currentReport={currentReport}
    />
  );
}
