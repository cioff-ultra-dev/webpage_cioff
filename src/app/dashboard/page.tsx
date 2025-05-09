import { auth } from "@/auth";
import { db } from "@/db";
import { addMonths, isAfter } from "date-fns";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  const headerList = headers();

  const pathname = headerList.get("x-current-path") ?? "/dashboard";
  const isRootDashboard = pathname === "/dashboard";

  if (!session) {
    return redirect("/login");
  }

  const currentInfo = await db.query.users.findFirst({
    where(fields, { eq }) {
      return eq(fields.id, session.user.id!);
    },
  });

  if (isRootDashboard) {
    const sixMonthsLater = addMonths(currentInfo?.updatedAt ?? new Date(), 6);
    const passwordIsExpired = isAfter(new Date(), sixMonthsLater);

    if (passwordIsExpired)
      return redirect("/dashboard/settings#password-expired");

    if (!currentInfo?.active)
      return redirect("/dashboard/settings#change-password");

    if (
      session?.user.role?.name === "Admin" ||
      session?.user.role?.name === "Council" ||
      session?.user.role?.name === "National Sections"
    ) {
      return redirect("/dashboard/members");
    }

    if (session?.user.role?.name === "Groups") {
      return redirect("/dashboard/groups");
    }

    if (session?.user.role?.name === "Festivals") {
      return redirect("/dashboard/festivals");
    }
  }

  return null;
}
