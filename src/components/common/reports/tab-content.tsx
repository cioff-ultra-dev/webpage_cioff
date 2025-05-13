import Link from "next/link";
import { cva, VariantProps } from "class-variance-authority";
import { useTranslations } from "next-intl";

import { TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CirclePlusIcon, Eye, Pencil } from "lucide-react";

const BadgeVariants = cva("bg-gray-500/15 text-gray-700 hover:bg-gray-500/25", {
  variants: {
    statusColor: {
      completed: "bg-green-500/15 text-green-700 hover:bg-green-500/25",
      progress: "bg-blue-500/15 text-blue-700 hover:bg-blue-500/25",
      pending: "bg-yellow-500/15 text-yellow-700 hover:bg-yellow-500/25",
    },
  },
});


export interface ReportItem {
  id: number;
  name: string;
  createdAt: string;
  statusColor: VariantProps<typeof BadgeVariants>["statusColor"];
  status: string;
  urlDetail?: string;
  urlEdit?: string;
}

export interface TabContentProps {
  tabKey: string;
  title: string;
  description: string;
  createReportUrl: string;
  reports: ReportItem[];
}

export function TabContentComponent(props: TabContentProps) {
  const { reports, tabKey, description, title, createReportUrl } = props;
  const t = useTranslations("reports.page");

  return (<TabsContent value={tabKey}>
    <Card x-chunk="dashboard-06-chunk-0">
      <CardHeader className="justify-between flex-row">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <div className="flex items-start">
          <Link href={createReportUrl}>
            <Button size="sm" className="h-8 gap-1">
              <CirclePlusIcon className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                {t("createReport")}
              </span>
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {reports?.length ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("reportId")}</TableHead>
                <TableHead className="hidden md:table-cell">
                  {t("dateCreated")}
                </TableHead>
                <TableHead className="hidden md:table-cell">
                  {t("status")}
                </TableHead>
                <TableHead>
                  <span className="sr-only">{t("actions")}</span>
                  {t("actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium">
                    {report.name}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {report.createdAt}
                  </TableCell>
                  <TableCell className="hidden md:table-cell capitalize truncate">
                    <Badge
                      className={BadgeVariants({
                        statusColor: report.statusColor
                      })}
                    >
                      {report.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {report?.urlDetail && (
                      <Button
                        variant="ghost"
                        size="icon"
                        title={t("viewReport")}
                        asChild
                      >
                        <Link
                          href={report.urlDetail}
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    )}
                    {report?.urlEdit && (
                      <Button
                        variant="ghost"
                        size="icon"
                        title={t("editReport")}
                        asChild
                      >
                        <Link
                          href={report?.urlEdit}
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="w-full flex justify-center">
            <span className="text-muted-foreground text-sm">
              {t("notFoundReports")}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  </TabsContent>);
}