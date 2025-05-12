"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ReportFestivalsType,
  ReportGroupsType,
  ReportNationalSectionsProType,
} from "@/db/queries/reports";
import { useFormatter, useTranslations } from "next-intl";
import {
  TabContentComponent,
  ReportItem,
} from "@/components/common/reports/tab-content";

export interface Reports {
  festivals?: ReportFestivalsType | null;
  groups?: ReportGroupsType | null;
  ns?: ReportNationalSectionsProType | null;
}

export interface DashboardReportProps {
  reports: Partial<Reports>;
  roleKey: keyof Reports | "admin";
}

export default function DashboardReportPage({
  reports,
  roleKey,
}: DashboardReportProps) {
  const formatter = useFormatter();
  const t = useTranslations("reports.page");

  return (
    <Tabs defaultValue={roleKey}>
      <TabsList>
        <TabsTrigger value="ns">{t("ns")}</TabsTrigger>
        <TabsTrigger value="festivals">{t("festivals")}</TabsTrigger>
        <TabsTrigger value="groups">{t("groups")}</TabsTrigger>
      </TabsList>
      <TabContentComponent
        tabKey="ns"
        title={t("ns")}
        description={t("nsDescription")}
        createReportUrl="/dashboard/reports/members"
        reports={
          reports?.festivals?.map((item) => ({
            id: item.id,
            name: `REPORT-NS-${item.id}`,
            createdAt: formatter.dateTime(item.createdAt, {
              year: "numeric",
              month: "long",
              day: "numeric",
            }),
            statusColor: "completed",
            status: t("completed"),
            urlDetail: `/dashboard/reports/members/${item.id}`,
          })) as ReportItem[]
        }
      />
      <TabContentComponent
        tabKey="festivals"
        title={t("festivals")}
        description={t("festivalsDescription")}
        createReportUrl="/dashboard/reports/festivals"
        reports={
          reports?.festivals?.map((item) => ({
            id: item.id,
            name: `REPORT-F-${item.id}`,
            createdAt: formatter.dateTime(item.createdAt, {
              year: "numeric",
              month: "long",
              day: "numeric",
            }),
            statusColor: item.draft ? "draft" : "completed",
            status: item.draft ? t("pending") : t("completed"),
            urlDetail: !item.draft
              ? `/dashboard/reports/festivals/${item.id}`
              : undefined,
            urlEdit: item.draft
              ? `/dashboard/reports/festivals/${item.id}/edit`
              : undefined,
          })) as ReportItem[]
        }
      />
      <TabContentComponent
        tabKey="groups"
        title={t("groups")}
        description={t("groupsDescription")}
        createReportUrl="/dashboard/reports/groups"
        reports={
          reports?.festivals?.map((item) => ({
            id: item.id,
            name: `REPORT-G-${item.id}`,
            createdAt: formatter.dateTime(item.createdAt, {
              year: "numeric",
              month: "long",
              day: "numeric",
            }),
            statusColor: item.draft ? "draft" : "completed",
            status: item.draft ? t("pending") : t("completed"),
            urlDetail: !item.draft
              ? `/dashboard/reports/groups/${item.id}`
              : undefined,
            urlEdit: item.draft
              ? `/dashboard/reports/groups/${item.id}/edit`
              : undefined,
          })) as ReportItem[]
        }
      />
    </Tabs>
  );
}
