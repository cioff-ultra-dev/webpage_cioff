import { auth } from "@/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  const headerList = headers();

  const pathname = headerList.get("x-current-path");
  const isRootDashboard = pathname === "/dashboard";

  if (isRootDashboard) {
    if (
      session?.user.role?.name === "Admin" ||
      session?.user.role?.name === "Council" ||
      session?.user.role?.name === "National Sections"
    ) {
      return redirect("/dashboard/national-sections");
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
