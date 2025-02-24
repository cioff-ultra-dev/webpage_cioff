"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";
import { EllipsisVertical, Eye } from "lucide-react";
import {
  getAllNationalSections,
  LangWithNationalSection,
} from "@/db/queries/national-sections";
import {
  ReportFestivalsType,
  ReportGroupsType,
  ReportNationalSectionsProType,
} from "@/db/queries/reports";
import { useFormatter } from "next-intl";
import { Badge } from "@/components/ui/badge";

export function TabNavigation() {
  return (
    <TabsList>
      <TabsTrigger value="ns">National Sections</TabsTrigger>
      <TabsTrigger value="festivals">Festivals</TabsTrigger>
      <TabsTrigger value="groups">Groups</TabsTrigger>
    </TabsList>
  );
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "Completed":
      return "bg-green-500/15 text-green-700 hover:bg-green-500/25";
    case "In Progress":
      return "bg-blue-500/15 text-blue-700 hover:bg-blue-500/25";
    case "Under Review":
      return "bg-yellow-500/15 text-yellow-700 hover:bg-yellow-500/25";
    default:
      return "bg-gray-500/15 text-gray-700 hover:bg-gray-500/25";
  }
};

const mapTab = {
  ns: { name: "National Section", url: "/dashboard/reports/national-sections" },
  festivals: { name: "Festival", url: "/dashboard/reports/festivals" },
  groups: { name: "Group", url: "/dashboard/reports/groups" },
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

  console.log(reports);

  return (
    <Tabs defaultValue={roleKey}>
      <div className="flex items-center">
        {/* <TabNavigation /> */}
        <div className="ml-auto flex items-center gap-2">
          <Link href={mapTab[roleKey as keyof typeof mapTab].url}>
            <Button size="sm" className="h-8 gap-1">
              <CirclePlusIcon className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Create {mapTab[roleKey as keyof typeof mapTab].name} Report
              </span>
            </Button>
          </Link>
        </div>
      </div>
      <TabsContent value="ns">
        <Card x-chunk="dashboard-06-chunk-0">
          <CardHeader>
            <CardTitle>National Sections</CardTitle>
            <CardDescription>
              Manage your NS reports and view their details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {reports?.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report ID</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Date Created
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      Status
                    </TableHead>
                    <TableHead>
                      Actions
                      <span className="sr-only">Actions</span>
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
                            Completed
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
                  Not found groups...
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="festivals">
        <Card x-chunk="dashboard-06-chunk-0">
          <CardHeader>
            <CardTitle>Festivals</CardTitle>
            <CardDescription>
              Manage your festival reports view their details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {reports?.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report ID</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Date Created
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      Status
                    </TableHead>
                    <TableHead>
                      <span className="sr-only">Actions</span>
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((item) => {
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
                          {item.slug}
                          <Badge className={getStatusColor("Completed")}>
                            Completed
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
                              href={`/dashboard/reports/festivals/${item.id}`}
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
                  Not found festivals...
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="groups">
        <Card x-chunk="dashboard-06-chunk-0">
          <CardHeader>
            <CardTitle>Groups</CardTitle>
            <CardDescription>
              Manage your group reports and view their details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {reports?.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report ID</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Date Created
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      Status
                    </TableHead>
                    <TableHead>
                      Actions
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((item) => {
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
                          {item.slug}
                          <Badge className={getStatusColor("Completed")}>
                            Completed
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="View report"
                            asChild
                          >
                            <Link href={`/dashboard/reports/groups/${item.id}`}>
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
                  Not found groups...
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

function CalendarIcon(props: SVGComponentProps) {
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
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
    </svg>
  );
}

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
