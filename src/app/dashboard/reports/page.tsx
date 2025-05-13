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
  "National Sections": "members",
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

export default async function ReportsPage(props: any) {
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

  if ((role.key === "members" && owner?.nsId) || isAdmin) {
    reports.members = (await getReportsNationalSections(
      isAdmin ? undefined : owner?.nsId!
    )) as ReportNationalSectionsProType;
  } else if (role.key === "members") {
    reports.members = [];
  }

  if ((role.key === "groups" && owner?.groupId) || isAdmin) {
    reports.groups = (await getReportsGroups(
      isAdmin ? undefined : owner?.groupId!
    )) as ReportGroupsType;
  } else if (role.key === "groups") {
    reports.groups = [];
  }

  if ((role.key === "festivals" && owner?.festivalId) || isAdmin) {
    reports.festivals = (await getReportsFestivals(
      isAdmin ? undefined : owner?.festivalId!
    )) as ReportFestivalsType;
  } else if (role.key === "festivals") {
    reports.festivals = [];
  }

  return (
    <DashboardReportPage
      reports={reports}
      allowEdition={user.email === "admin@cioff.org" || isAdmin}
      initialTab={
        (role.key === "admin"
          ? "members"
          : role.key) as DashboardReportProps["initialTab"]
      }
      roleKey={role.key === "admin" ? "members" : role.key}
    />
  );
}
