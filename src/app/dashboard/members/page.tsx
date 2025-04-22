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
  getAllNationalSectionsByOwner,
  LangWithNationalSection,
} from "@/db/queries/national-sections";
import { getFormatter, getLocale, getTranslations } from "next-intl/server";
import { defaultLocale } from "@/i18n/config";
import { auth } from "@/auth";

export default async function DashboardPage() {
  const session = await auth();
  const locale = await getLocale();
  const t = await getTranslations("page");
  const formatter = await getFormatter();
  const nationalSections = (await getAllNationalSectionsByOwner(locale))
    .filter((item) => item.ns)
    .map((item) => item.ns);

  return (
    <Tabs defaultValue="all">
      <div className="flex items-center">
        <TabsList>
          <TabsTrigger value="all">{t("all")}</TabsTrigger>
          {/* <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger> */}
        </TabsList>
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
          {session?.user.role?.name === "Admin" ? (
            <Link href="/dashboard/members/new">
              <Button size="sm" className="h-8 gap-1">
                <CirclePlusIcon className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  {t("add_national_section")}
                </span>
              </Button>
            </Link>
          ) : null}
        </div>
      </div>
      <TabsContent value="all">
        <Card x-chunk="dashboard-06-chunk-0">
          <CardHeader>
            <CardTitle>{t("national_sections")}</CardTitle>
            <CardDescription>{t("Manage_your_ns")}</CardDescription>
          </CardHeader>
          <CardContent>
            {nationalSections.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("name")}</TableHead>
                    <TableHead className="hidden md:table-cell">
                      {t("date")}
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      {t("description")}
                    </TableHead>
                    <TableHead>
                      <span className="sr-only">{t("actions")}</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {nationalSections.map((item) => {
                    return (
                      <TableRow key={item?.id}>
                        <TableCell className="font-medium">
                          {item?.langs.find((item) => item.l?.code === locale)
                            ?.name ||
                            item?.langs.find(
                              (item) => item.l?.code === defaultLocale
                            )?.name}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {item?.createdAt
                            ? formatter.dateTime(item?.createdAt, {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })
                            : null}
                        </TableCell>
                        <TableCell className="hidden md:table-cell capitalize truncate">
                          {item?.langs.find((item) => item.l?.code === locale)
                            ?.about ||
                            item?.langs.find(
                              (item) => item.l?.code === defaultLocale
                            )?.about}
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
                              <DropdownMenuLabel>
                                {t("actions")}
                              </DropdownMenuLabel>
                              <DropdownMenuItem
                                asChild
                                className="cursor-pointer"
                                disabled={
                                  session?.user.role?.name !==
                                  "National Sections"
                                }
                              >
                                <Link
                                  href={`/dashboard/members/${item?.slug}/edit`}
                                >
                                  {t("edit")}
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem disabled>
                                {t("delete")}
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
                  {t("not_found_groups")}
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
