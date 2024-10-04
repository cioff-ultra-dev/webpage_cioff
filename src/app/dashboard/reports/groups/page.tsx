import { auth } from "@/auth";
import ReportGroupForm from "@/components/common/reports/group-form";
import { getFestivalsAndGroupsCounts } from "@/db/queries/reports";

export default async function ReportNationalSection() {
  const session = await auth();

  if (!session?.user) {
    return <p>User not authenticated</p>;
  }

  const counts = await getFestivalsAndGroupsCounts(session.user.countryId!);

  return <ReportGroupForm user={session.user} counts={counts} />;
}
