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
import { getAllFestivalsByOwner } from "@/db/queries/events";
import { EllipsisVertical, Send } from "lucide-react";
import { getFormatter, getLocale, getTranslations } from "next-intl/server";
import { defaultLocale } from "@/i18n/config";
import { auth } from "@/auth";
import SendInvitation from "../../../components/common/send-invitation";
import MenuActions from "@/components/common/menu-actions";
import { DialogTrigger } from "@/components/ui/dialog";

export default async function DashboardPage() {
  const session = await auth();
  const locale = await getLocale();
  const t = await getTranslations("page");
  const formatter = await getFormatter();
  const response = await getAllFestivalsByOwner(locale);
  let festivals = response
    .filter((item) => item.festival)
    .map((item) => item.festival);

  if (session?.user.role?.name === "National Sections") {
    const [currentData] = response;

    festivals = currentData.ns?.festivals ?? [];
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
              <Link href="/dashboard/festivals/invitation">
                <Button size="sm" variant="secondary" className="h-8 gap-1">
                  <Send className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    {t("gener_fest_invit")}
                  </span>
                </Button>
              </Link>
            ) : null}
            {session?.user.role?.name === "Admin" ? (
              <Link href="/dashboard/festivals/new">
                <Button size="sm" variant="default" className="h-8 gap-1">
                  <CirclePlusIcon className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    {t("add_festival")}
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
            <CardTitle>Festivals</CardTitle>
            <CardDescription>
              Manage your festivals and view their details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {festivals.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Owner
                    </TableHead>
                    <TableHead className="hidden md:table-cell">Date</TableHead>
                    <TableHead className="hidden md:table-cell">
                      {t("state")}
                    </TableHead>
                    <TableHead>
                      <span className="sr-only">{t("actions")}</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {festivals.map((item) => {
                    return (
                      <TableRow key={item?.id}>
                        <TableCell className="font-medium">
                          {item?.langs.find((item) => item.l?.code === locale)
                            ?.name ||
                            item?.langs.find(
                              (item) => item.l?.code === defaultLocale
                            )?.name}
                        </TableCell>
                        <TableCell className="font-medium">
                          {item?.owners.at(0)?.user?.email || item?.email}
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
                        <TableCell className="hidden md:table-cell capitalize">
                          {item?.stateMode}
                        </TableCell>
                        <TableCell>
                          <MenuActions
                            item={item}
                            roleName="Festivals"
                            fallbackEmail={item?.email || undefined}
                          >
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
                                <DropdownMenuItem>
                                  <Link
                                    href={`/event/${item?.id}`}
                                    target="_blank"
                                    className="cursor-pointer"
                                  >
                                    {t("preview")}
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link
                                    href={`/dashboard/festivals/${item?.slug}/edit`}
                                    className="cursor-pointer"
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
                  {t("not_found_festivals")}
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

function FileIcon(props: SVGComponentProps) {
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
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    </svg>
  );
}

function HomeIcon(props: SVGComponentProps) {
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
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function LineChartIcon(props: SVGComponentProps) {
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
      <path d="M3 3v18h18" />
      <path d="m19 9-5 5-4-4-3 3" />
    </svg>
  );
}

function ListFilterIcon(props: SVGComponentProps) {
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
      <path d="M3 6h18" />
      <path d="M7 12h10" />
      <path d="M10 18h4" />
    </svg>
  );
}

function MoveHorizontalIcon(props: SVGComponentProps) {
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
      <polyline points="18 8 22 12 18 16" />
      <polyline points="6 8 2 12 6 16" />
      <line x1="2" x2="22" y1="12" y2="12" />
    </svg>
  );
}

function PackageIcon(props: SVGComponentProps) {
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
      <path d="m7.5 4.27 9 5.15" />
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  );
}

function PanelLeftIcon(props: SVGComponentProps) {
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
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M9 3v18" />
    </svg>
  );
}

function SearchIcon(props: SVGComponentProps) {
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
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function SettingsIcon(props: SVGComponentProps) {
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
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function UsersIcon(props: SVGComponentProps) {
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
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
