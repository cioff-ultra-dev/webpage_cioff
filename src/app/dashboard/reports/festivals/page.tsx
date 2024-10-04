import { auth } from "@/auth";
import ReportFestivalForm from "@/components/common/reports/festival-form";
import { getFestivalsAndGroupsCounts } from "@/db/queries/reports";

export default async function ReportNationalSection() {
  const session = await auth();

  if (!session?.user) {
    return <p>User not authenticated</p>;
  }

  const counts = await getFestivalsAndGroupsCounts(session.user.countryId!);

  return <ReportFestivalForm user={session.user} counts={counts} />;
}
