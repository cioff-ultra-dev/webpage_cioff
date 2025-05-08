import DashboardReportPage from "./base";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Session } from "next-auth";
import {
  getReportsFestivals,
  getOwnerByUserId,
  ReportFestivalsType,
  getReportsGroups,
  ReportGroupsType,
  ReportNationalSectionsProType,
  getReportsNationalSections,
} from "@/db/queries/reports";

const roleKeys = {
  "National Sections": "ns",
  Festivals: "festivals",
  Groups: "groups",
};

function getRoleAvailable(user: Session["user"]) {
  const isEnabled = ["National Sections", "Festivals", "Groups", "Admin"].includes(
    user.role?.name!
  );
  return {
    isEnabled,
    roleName: user.role?.name,
    key: roleKeys[user.role?.name! as keyof typeof roleKeys],
  };
}

export default async function ReportsPage() {
  const session = await auth();

  if (!session?.user) {
    return redirect("/dashboard");
  }

  const user = session.user;
  const role = getRoleAvailable(user);
  const owner = await getOwnerByUserId(session.user.id);

  if (!role.isEnabled) {
    return redirect("/dashboard");
  }

  let reports:
    | ReportFestivalsType
    | ReportGroupsType
    | ReportNationalSectionsProType
    | null = null;

  if (role.key === "ns") {
    reports = (await getReportsNationalSections(
      owner?.nsId!
    )) as ReportNationalSectionsProType;
  }

  if (role.key === "groups" && owner?.groupId) {
    reports = (await getReportsGroups(owner?.groupId!)) as ReportGroupsType;
  }

  if (role.key === "festivals" && owner?.festivalId) {
    reports = (await getReportsFestivals(
      owner?.festivalId!
    )) as ReportFestivalsType;
  }

  return <DashboardReportPage reports={reports} roleKey={role.key!} />;
}
