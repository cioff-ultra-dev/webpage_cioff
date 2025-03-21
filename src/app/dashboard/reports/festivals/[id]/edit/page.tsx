import { auth } from "@/auth";
import ReportFestivalForm from "@/components/common/reports/festival-form";
import { getAllCountries } from "@/db/queries/countries";
import { getFestivalById } from "@/db/queries/events";
import {
  getAllRatingQuestionByType,
  getOwnerByUserId,
  getReportFestival,
  getReportTypeCategoriesBySlugs,
} from "@/db/queries/reports";
import { getLocale } from "next-intl/server";
import { redirect } from "next/navigation";

export default async function ReportFestivalDetailsPage({
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
  const reportTypeCategories = await getReportTypeCategoriesBySlugs(
    ["conferences", "workshops", "crafts-fair", "gastronomy-fair/display"],
    locale
  );
  const countries = await getAllCountries();

  if (owner && !owner.festivalId) {
    return redirect("/dashboard/reports");
  }

  const currentFestival = await getFestivalById(owner?.festivalId!, locale);
  const currentRatingQuestions = await getAllRatingQuestionByType(
    "group",
    locale
  );
  const currentReport = await getReportFestival(Number(params.id), locale);

  if (currentReport && !currentReport.draft) {
    return redirect("/dashboard/reports");
  }

  return (
    <ReportFestivalForm
      festivalId={owner?.festivalId!}
      currentFestival={currentFestival}
      reportTypeCategories={reportTypeCategories}
      ratingQuestions={currentRatingQuestions}
      countries={countries}
      currentReport={currentReport}
    />
  );
}
