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
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";
import { EllipsisVertical, Send } from "lucide-react";
import { getAllGroupsByOwner } from "@/db/queries/groups";
import { getFormatter, getLocale, getTranslations } from "next-intl/server";
import { defaultLocale } from "@/i18n/config";
import { auth } from "@/auth";
import { DialogTrigger } from "@/components/ui/dialog";
import MenuActions from "@/components/common/menu-actions";

export default async function DashboardPage() {
  const session = await auth();
  const locale = await getLocale();
  const formatter = await getFormatter();
  const t = await getTranslations("page");
  const response = await getAllGroupsByOwner(locale);
  let groups = response.filter((item) => item.group).map((item) => item.group);

  if (session?.user.role?.name === "National Sections") {
    const [currentData] = response;

    groups = currentData.ns?.groups ?? [];
  }

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
          <div className="flex gap-3">
            {session?.user.role?.name === "National Sections" ? (
              <Link href="/dashboard/groups/invitation">
                <Button size="sm" variant="secondary" className="h-8 gap-1">
                  <Send className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    {t("Gener_group_invitat")}
                  </span>
                </Button>
              </Link>
            ) : null}
            {session?.user.role?.name === "Admin" ? (
              <Link href="/dashboard/groups/new">
                <Button size="sm" className="h-8 gap-1">
                  <CirclePlusIcon className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    {t("add_group")}
                  </span>
                </Button>
              </Link>
            ) : null}
          </div>
        </div>
      </div>
      <TabsContent value="all">
        <Card x-chunk="dashboard-06-chunk-0">
          <CardHeader>
            <CardTitle>{t("groups")}</CardTitle>
            <CardDescription>{t("Manage_your_groups_details")}</CardDescription>
          </CardHeader>
          <CardContent>
            {groups.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("name")}</TableHead>
                    <TableHead className="hidden md:table-cell">
                      {t("owner")}
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      {t("country")}
                    </TableHead>
                    <TableHead>
                      <span className="sr-only">{t("actions")}</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groups.map((item) => {
                    return (
                      <TableRow key={item?.id}>
                        <TableCell className="font-medium">
                          {item?.langs.find((item) => item.l?.code === locale)
                            ?.name ||
                            item?.langs.find(
                              (item) => item.l?.code === defaultLocale,
                            )?.name}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {item?.owners.at(0)?.user?.email}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {item?.country?.langs.find(
                            (lang) => lang.l?.code === locale,
                          )?.name ||
                            item?.country?.langs.find(
                              (lang) => lang.l?.code === defaultLocale,
                            )?.name}
                        </TableCell>
                        <TableCell>
                          <MenuActions item={item} roleName="Groups">
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
                                {/* <DropdownMenuItem
                                asChild
                                className="cursor-pointer"
                              >
                                <Link
                                  href={`/event/${item.id}`}
                                  target="_blank"
                                >
                                  Preview
                                </Link>
                              </DropdownMenuItem> */}
                                <DropdownMenuItem
                                  asChild
                                  className="cursor-pointer"
                                >
                                  <Link
                                    href={`/dashboard/groups/${item?.id}/edit`}
                                  >
                                    {t("edit")}
                                  </Link>
                                </DropdownMenuItem>
                                {session?.user.role?.name ===
                                "National Sections" ? (
                                  <DialogTrigger asChild>
                                    <DropdownMenuItem className="cursor-pointer">
                                      {t("send_invitation")}
                                    </DropdownMenuItem>
                                  </DialogTrigger>
                                ) : null}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </MenuActions>
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
