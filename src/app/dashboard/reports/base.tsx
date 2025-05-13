"use client";

import { useMemo } from "react";
import { useFormatter, useTranslations } from "next-intl";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ReportFestivalsType,
  ReportGroupsType,
  ReportNationalSectionsProType,
} from "@/db/queries/reports";
import {
  TabContentComponent,
  ReportItem,
} from "@/components/common/reports/tab-content";

export interface Reports {
  festivals?: ReportFestivalsType | null;
  groups?: ReportGroupsType | null;
  members?: ReportNationalSectionsProType | null;
}

type KeyReports = keyof Reports;

export interface DashboardReportProps {
  reports: Partial<Reports>;
  initialTab: KeyReports;
  roleKey: string;
  allowEdition?: boolean;
}

const reportInfo: Record<
  KeyReports,
  {
    detailUrl: (item?: any) => string;
    editUrl: (item?: any) => string;
    getStatus: (item?: any) => string;
    reportName: string;
  }
> = {
  members: {
    detailUrl: (item) => `/dashboard/reports/members/${item.id}`,
    editUrl: () => "",
    getStatus: () => "completed",
    reportName: "REPORT-NS-",
  },
  festivals: {
    detailUrl: (item) =>
      !item?.draft ? `/dashboard/reports/festivals/${item.id}` : "",
    editUrl: (item) =>
      item?.draft ? `/dashboard/reports/festivals/${item.id}/edit` : "",
    reportName: "REPORT-F-",
    getStatus: (item) => (item?.draft ? "pending" : "completed"),
  },
  groups: {
    reportName: "REPORT-G-",
    detailUrl: (item) =>
      !item?.draft ? `/dashboard/reports/groups/${item.id}` : "",
    editUrl: (item) =>
      item?.draft ? `/dashboard/reports/groups/${item.id}/edit` : "",
    getStatus: (item) => (item?.draft ? "pending" : "completed"),
  },
};

export default function DashboardReportPage({
  reports,
  roleKey,
  allowEdition,
  initialTab,
}: DashboardReportProps) {
  const formatter = useFormatter();
  const t = useTranslations("reports.page");

  const { tabsContent, tabsHeaders } = useMemo(() => {
    const reportKeys = Object.keys(reports) as KeyReports[];

    const tabsHeaders = reportKeys.map((key) => (
      <TabsTrigger key={key} value={key}>
        {t(key)}
      </TabsTrigger>
    ));

    const tabsContent = reportKeys.map((key) => {
      const additionalInfo = reportInfo[key];

      return (
        <TabContentComponent
          key={key}
          tabKey={key}
          title={t(key)}
          description={t(`${key}Description`)}
          createReportUrl={`/dashboard/reports/${key}`}
          reports={
            reports[key]?.map((item) => {
              const status = additionalInfo.getStatus(item);

              return {
                id: item.id,
                name: additionalInfo.reportName + item.id,
                createdAt: formatter.dateTime(item.createdAt, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }),
                statusColor: status,
                status: t(status),
                urlDetail: additionalInfo.detailUrl(item),
                urlEdit:
                  allowEdition || key === roleKey
                    ? additionalInfo.editUrl(item)
                    : "",
              };
            }) as ReportItem[]
          }
        />
      );
    });

    return {
      tabsHeaders,
      tabsContent,
    };
  }, [allowEdition, formatter, reports, roleKey, t]);

  return (
    <Tabs defaultValue={roleKey}>
      <TabsList>{tabsHeaders}</TabsList>
      {tabsContent}
    </Tabs>
  );
}
