import { auth } from "@/auth";
import ReportFestivalForm from "@/components/common/reports/festival-form";
import { getAllCountries } from "@/db/queries/countries";
import { getFestivalById } from "@/db/queries/events";
import {
  getAllRatingQuestionByType,
  getOwnerByUserId,
  getReportTypeCategoriesBySlugs,
} from "@/db/queries/reports";
import { getLocale } from "next-intl/server";
import { redirect } from "next/navigation";

export default async function ReportNationalSection() {
  const session = await auth();
  const locale = await getLocale();

  if (!session?.user) {
    return redirect("/dashboard/reports");
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

  return (
    <ReportFestivalForm
      festivalId={owner?.festivalId!}
      currentFestival={currentFestival}
      reportTypeCategories={reportTypeCategories}
      ratingQuestions={currentRatingQuestions}
      countries={countries}
    />
  );
}
