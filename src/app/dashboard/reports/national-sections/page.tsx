import { auth } from "@/auth";
import ReportNationalSectionForm from "@/components/common/reports/national-section-form";
import { getFestivalsAndGroupsCounts } from "@/db/queries/reports";

export default async function ReportNationalSection() {
  const session = await auth();

  if (!session?.user) {
    return <p>User not authenticated</p>;
  }

  const counts = await getFestivalsAndGroupsCounts(session.user.countryId!);

  return <ReportNationalSectionForm user={session.user} counts={counts} />;
}
