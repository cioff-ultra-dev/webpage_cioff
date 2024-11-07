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
            <CardTitle>{t("festivals")}</CardTitle>
            <CardDescription>
              {t("Manage_your_fest_details")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {festivals.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("name")}</TableHead>
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
                              (item) => item.l?.code === defaultLocale,
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
