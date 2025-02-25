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
import { EllipsisVertical } from "lucide-react";
import { SelectFestival } from "@/db/schema";
import {
  getAllNationalSections,
  LangWithNationalSection,
} from "@/db/queries/national-sections";
import { useState } from "react";

export function TabNavigation() {
  return (
    <TabsList>
      <TabsTrigger value="ns">National Sections</TabsTrigger>
      <TabsTrigger value="festivals">Festivals</TabsTrigger>
      <TabsTrigger value="groups">Groups</TabsTrigger>
    </TabsList>
  );
}

const mapTab = {
  ns: { name: "National Section", url: "/dashboard/reports/national-sections" },
  festivals: { name: "Festivals", url: "/dashboard/reports/festivals" },
  groups: { name: "Groups", url: "/dashboard/reports/groups" },
} as const;

export default function DashboardReportPage({
  nationalSections,
}: {
  nationalSections: LangWithNationalSection[];
}) {
  const [tabSelected, setTabSelected] = useState("ns");
  return (
    <Tabs defaultValue="ns" onValueChange={(value) => setTabSelected(value)}>
      <div className="flex items-center">
        <TabNavigation />
        <div className="ml-auto flex items-center gap-2">
          {/* <DropdownMenu> */}
          {/*   <DropdownMenuTrigger asChild> */}
          {/*     <Button variant="outline" size="sm" className="h-8 gap-1"> */}
          {/*       <ListFilterIcon className="h-3.5 w-3.5" /> */}
          {/*       <span className="sr-only sm:not-sr-only sm:whitespace-nowrap"> */}
          {/*         Filter */}
          {/*       </span> */}
          {/*     </Button> */}
          {/*   </DropdownMenuTrigger> */}
          {/*   <DropdownMenuContent align="end"> */}
          {/*     <DropdownMenuLabel>Filter by</DropdownMenuLabel> */}
          {/*     <DropdownMenuSeparator /> */}
          {/*     <DropdownMenuCheckboxItem checked> */}
          {/*       Upcoming */}
          {/*     </DropdownMenuCheckboxItem> */}
          {/*     <DropdownMenuCheckboxItem>Past</DropdownMenuCheckboxItem> */}
          {/*   </DropdownMenuContent> */}
          {/* </DropdownMenu> */}
          {/* <Button size="sm" variant="outline" className="h-8 gap-1"> */}
          {/*   <FileIcon className="h-3.5 w-3.5" /> */}
          {/*   <span className="sr-only sm:not-sr-only sm:whitespace-nowrap"> */}
          {/*     Export */}
          {/*   </span> */}
          {/* </Button> */}
          <Link href={mapTab[tabSelected as keyof typeof mapTab].url}>
            <Button size="sm" className="h-8 gap-1">
              <CirclePlusIcon className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Add {mapTab[tabSelected as keyof typeof mapTab].name}
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
            {nationalSections.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden md:table-cell">Date</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Description
                    </TableHead>
                    <TableHead>
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {nationalSections.map((item) => {
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {item.langs.at(0)?.name}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {format(item.createdAt, "PPP")}
                        </TableCell>
                        <TableCell className="hidden md:table-cell capitalize truncate">
                          {item.langs.at(0)?.about}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                aria-haspopup="true"
                                size="icon"
                                variant="ghost"
                              >
                                <EllipsisVertical className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem disabled>Edit</DropdownMenuItem>
                              <DropdownMenuItem disabled>
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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
            {0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden md:table-cell">Date</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Description
                    </TableHead>
                    <TableHead>
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {nationalSections.map((item) => {
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {item.langs.at(0)?.name}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {format(item.createdAt, "PPP")}
                        </TableCell>
                        <TableCell className="hidden md:table-cell capitalize truncate">
                          {item.langs.at(0)?.about}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                aria-haspopup="true"
                                size="icon"
                                variant="ghost"
                              >
                                <EllipsisVertical className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem disabled>Edit</DropdownMenuItem>
                              <DropdownMenuItem disabled>
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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
            {0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden md:table-cell">Date</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Description
                    </TableHead>
                    <TableHead>
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {nationalSections.map((item) => {
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {item.langs.at(0)?.name}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {format(item.createdAt, "PPP")}
                        </TableCell>
                        <TableCell className="hidden md:table-cell capitalize truncate">
                          {item.langs.at(0)?.about}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                aria-haspopup="true"
                                size="icon"
                                variant="ghost"
                              >
                                <EllipsisVertical className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem disabled>Edit</DropdownMenuItem>
                              <DropdownMenuItem disabled>
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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
