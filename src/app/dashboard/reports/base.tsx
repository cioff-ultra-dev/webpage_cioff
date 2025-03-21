"use client";

import { Tabs, TabsContent } from "@/components/ui/tabs";
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
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Eye, Pencil } from "lucide-react";
import {
  ReportFestivalsType,
  ReportGroupsType,
  ReportNationalSectionsProType,
} from "@/db/queries/reports";
import { useFormatter, useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";

const getStatusColor = (status: string) => {
  switch (status) {
    case "Completed":
      return "bg-green-500/15 text-green-700 hover:bg-green-500/25";
    case "In Progress":
      return "bg-blue-500/15 text-blue-700 hover:bg-blue-500/25";
    case "Draft":
      return "bg-yellow-500/15 text-yellow-700 hover:bg-yellow-500/25";
    default:
      return "bg-gray-500/15 text-gray-700 hover:bg-gray-500/25";
  }
};

const mapTab = {
  ns: {
    key: "ns",
    url: "/dashboard/reports/national-sections",
  },
  festivals: {
    key: "festival",
    url: "/dashboard/reports/festivals",
  },
  groups: { key: "group", url: "/dashboard/reports/groups" },
} as const;

export default function DashboardReportPage({
  reports,
  roleKey,
}: {
  reports:
    | ReportFestivalsType
    | ReportGroupsType
    | ReportNationalSectionsProType
    | null;
  roleKey: string;
}) {
  const formatter = useFormatter();
  const t = useTranslations("reports.page");

  return (
    <Tabs defaultValue={roleKey}>
      <div className="flex items-center">
        <div className="ml-auto flex items-center gap-2">
          <Link href={mapTab[roleKey as keyof typeof mapTab].url}>
            <Button size="sm" className="h-8 gap-1">
              <CirclePlusIcon className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                {t("createReport")}
              </span>
            </Button>
          </Link>
        </div>
      </div>
      <TabsContent value="ns">
        <Card x-chunk="dashboard-06-chunk-0">
          <CardHeader>
            <CardTitle>{t("ns")}</CardTitle>
            <CardDescription>{t("nsDescription")}</CardDescription>
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
                      {t("actions")}
                      <span className="sr-only">{t("actions")}</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((item) => {
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          REPORT-NS-{item.id}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {formatter.dateTime(item.createdAt, {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </TableCell>
                        <TableCell className="hidden md:table-cell capitalize truncate">
                          {item.slug}
                          <Badge className={getStatusColor("Completed")}>
                            {t("completed")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="View report"
                            asChild
                          >
                            <Link
                              href={`/dashboard/reports/national-sections/${item.id}`}
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
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
      </TabsContent>
      <TabsContent value="festivals">
        <Card x-chunk="dashboard-06-chunk-0">
          <CardHeader>
            <CardTitle>{t("festivals")}</CardTitle>
            <CardDescription>{t("festivalsDescription")}</CardDescription>
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
                  {reports.map((item) => {
                    item = item as unknown as ReportFestivalsType[number];
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          REPORT-F-{item.id}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {formatter.dateTime(item.createdAt, {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </TableCell>
                        <TableCell className="hidden md:table-cell capitalize truncate">
                          <Badge
                            className={getStatusColor(
                              item.draft ? "Draft" : "Completed"
                            )}
                          >
                            {item.draft ? t("pending") : t("completed")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {!item.draft ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              title={t("viewReport")}
                              asChild
                            >
                              <Link
                                href={`/dashboard/reports/festivals/${item.id}`}
                              >
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                          ) : (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                title={t("editReport")}
                                asChild
                              >
                                <Link
                                  href={`/dashboard/reports/festivals/${item.id}/edit`}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Link>
                              </Button>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
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
      </TabsContent>
      <TabsContent value="groups">
        <Card x-chunk="dashboard-06-chunk-0">
          <CardHeader>
            <CardTitle>{t("groups")}</CardTitle>
            <CardDescription>{t("groupsDescription")}</CardDescription>
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
                      {t("actions")}
                      <span className="sr-only">{t("actions")}</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((item) => {
                    item = item as unknown as ReportGroupsType[number];

                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          REPORT-G-{item.id}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {formatter.dateTime(item.createdAt, {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </TableCell>
                        <TableCell className="hidden md:table-cell capitalize truncate">
                          <Badge
                            className={getStatusColor(
                              item.draft ? "Draft" : "Completed"
                            )}
                          >
                            {item.draft ? t("pending") : t("completed")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {!item.draft ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              title={t("viewReport")}
                              asChild
                            >
                              <Link
                                href={`/dashboard/reports/groups/${item.id}`}
                              >
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                          ) : (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                title={t("editReport")}
                                asChild
                              >
                                <Link
                                  href={`/dashboard/reports/groups/${item.id}/edit`}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Link>
                              </Button>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
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
      </TabsContent>
    </Tabs>
  );
}

type SVGComponentProps = React.ComponentPropsWithoutRef<"svg">;

function CirclePlusIcon(props: SVGComponentProps) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M8 12h8" />
      <path d="M12 8v8" />
    </svg>
  );
}
