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
import { auth } from "@/auth";

import DashboardReportPage, { Reports, DashboardReportProps } from "./base";

const roleKeys = {
  "National Sections": "ns",
  Festivals: "festivals",
  Groups: "groups",
  Admin: "admin",
};

function getRoleAvailable(user: Session["user"]) {
  const isEnabled = [
    "National Sections",
    "Festivals",
    "Groups",
    "Admin",
  ].includes(user.role?.name!);
  return {
    isEnabled,
    roleName: user.role?.name,
    key: roleKeys[user.role?.name! as keyof typeof roleKeys],
  };
}

export default async function ReportsPage(props:any) {
  const session = await auth();

  if (!session?.user) {
    return redirect("/dashboard");
  }

  const user = session.user;
  const role = getRoleAvailable(user);
  const owner = await getOwnerByUserId(session.user.id);
  const isAdmin = role.key === "admin";

  if (!role.isEnabled) {
    return redirect("/dashboard");
  }

  let reports: Reports = {};

  if (role.key === "ns" || isAdmin) {
    reports.ns = (await getReportsNationalSections(
      isAdmin ? owner?.nsId! : undefined
    )) as ReportNationalSectionsProType;
  }

  if ((role.key === "groups" && owner?.groupId) || isAdmin) {
    reports.groups = (await getReportsGroups(
      isAdmin ? owner?.groupId! : undefined
    )) as ReportGroupsType;
  }

  if ((role.key === "festivals" && owner?.festivalId) || isAdmin) {
    reports.festivals = (await getReportsFestivals(
      isAdmin ? owner?.festivalId! : undefined
    )) as ReportFestivalsType;
  }

  return (
    <DashboardReportPage
      reports={reports}
      roleKey={
        (role.key === "admin"
          ? "ns"
          : role.key) as DashboardReportProps["roleKey"]
      }
    />
  );
}
