import { Music, UserCircle, Users } from "lucide-react";
import { getFormatter, getLocale, getTranslations } from "next-intl/server";
import Link from "next/link";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Header } from "@/components/common/header";
import { defaultLocale, Locale } from "@/i18n/config";
import {
  Timeline,
  TimelineItem,
  TimelineConnector,
  TimelineHeader,
  TimelineTitle,
  TimelineIcon,
  TimelineContent,
  TimelineDescription,
} from "@/components/extension/timeline";
import {
  getNationaSectionById,
  NationalSectionTypeById,
} from "@/db/queries/national-sections";
import { ScrollArea } from "@/components/ui/scroll-area";
import Footer from "@/components/common/footer";

interface ItemList {
  name: string;
  logo?: string;
  logoFallback: string;
  email: string;
  detailLink: string;
}

function ItemList({ email, logoFallback, name, logo, detailLink }: ItemList) {
  return (
    <Link
      href={detailLink}
      className="flex items-center gap-4 w-full hover:bg-gray-200 py-2 px-2 rounded-md"
    >
      <Avatar>
        <AvatarImage src={logo} alt={name} />
        <AvatarFallback>{logoFallback}</AvatarFallback>
      </Avatar>
      <div>
        <h3 className="font-semibold">{name}</h3>
        <p className="text-sm text-muted-foreground">{email}</p>
      </div>
    </Link>
  );
}

function Positions({
  positions,
  currentLocale,
  title,
}: {
  positions: NonNullable<NationalSectionTypeById>["positions"];
  currentLocale: string;
  title?: string;
}) {
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-6 w-6" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-56">
          <ul className="space-y-4">
            {positions.map((position, index) => (
              <li key={index} className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src={position.photo?.url} alt={position.name} />
                  <AvatarFallback>
                    {position.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{position.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {position?.type?.langs.find(
                      (item) => item.l?.code === currentLocale
                    )?.name ||
                      position?.type?.langs.find(
                        (item) => item.l?.code === defaultLocale
                      )?.name}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function Festivals({
  festivals,
  currentLocale,
  title,
}: {
  festivals: NonNullable<NationalSectionTypeById>["festivals"];
  currentLocale: string;
  title?: string;
}) {
  const localFestivals = festivals.map((festival) => {
    const name =
      festival.langs.find((lang) => lang.l?.code === currentLocale)?.name ??
      festival.langs?.[0]?.name ??
      "";

    return {
      id: festival.id,
      name,
      logo: festival.logo?.url,
      logoFallback: name?.toUpperCase()?.[0] ?? "",
      email: festival.email ?? festival.owners.at(0)?.user?.email ?? "",
    };
  });

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music className="h-6 w-6" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-56">
          <div className="space-y-4">
            {localFestivals.map((festival) => (
              <ItemList
                key={festival.id}
                {...festival}
                detailLink={`/festivals/${festival.id}`}
              />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function Groups({
  groups,
  currentLocale,
  title,
}: {
  groups: NonNullable<NationalSectionTypeById>["groups"];
  currentLocale: string;
  title?: string;
}) {
  const localGroups = groups.map((group) => {
    const name =
      group.langs.find((lang) => lang.l?.code === currentLocale)?.name ??
      group.langs?.[0]?.name ??
      "";

    return {
      id:group.id,
      name,
      logo: group.logo?.url,
      logoFallback: name?.toUpperCase()?.[0] ?? "",
      email: group.owners.at(0)?.user?.email ?? "",
    };
  });

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCircle className="h-6 w-6" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-56">
          <ul className="space-y-4">
            {localGroups.map((group) => (
              <ItemList
                key={group.id}
                {...group}
                detailLink={`/groups/${group.id}`}
              />
            ))}
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export default async function NationaSectionDetail({
  params,
}: {
  params: { id: string };
}) {
  const locale = await getLocale();
  const t = await getTranslations("page");
  const formatter = await getFormatter();
  const ns = await getNationaSectionById(Number(params.id), locale as Locale);
  return (
    <div className="flex flex-col w-full min-h-screen">
      <Header className="border-b" text="text-black" />
      <main className="flex flex-col flex-1 gap-4 md:gap-8 bg-gray-50">
        <div className="flex flex-col w-full max-w-5xl mx-auto pt-8">
          <h1 className="text-2xl font-bold text-black">
            {ns?.langs.find((item) => item.l?.code === locale)?.name ||
              ns?.langs.find((item) => item.l?.code === defaultLocale)?.name}
          </h1>
          <span className="text-gray-500">
            {ns?.country?.langs.find((item) => item.l?.code === locale)?.name ||
              ns?.country?.langs.find((item) => item.l?.code === defaultLocale)
                ?.name}
          </span>
        </div>
        <div className="flex flex-col w-full max-w-5xl mx-auto mb-6">
          <Tabs defaultValue="profile" className="w-full">
            {/* <TabsList>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="events">Events</TabsTrigger>
              <TabsTrigger value="jobs">Jobs</TabsTrigger>
              <TabsTrigger value="store">Store</TabsTrigger>
            </TabsList> */}
            <TabsContent value="profile">
              <div className="flex flex-col gap-4">
                {/* <div className="flex gap-3"> */}
                {/* <Button variant="outline">Get directions</Button> */}
                {/* <Button variant="outline">Bookmark</Button> */}
                {/* <Button variant="outline">Share</Button> */}
                {/* <Button variant="outline">Leave a review</Button> */}
                {/* <Button variant="outline">Claim listing</Button> */}
                {/* <Button variant="outline">Report</Button> */}
                {/* </div> */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Card className="col-span-1">
                    <CardHeader>
                      <CardTitle>{t("description")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="line-clamp-4">
                        {ns?.langs.find((item) => item.l?.code === locale)
                          ?.about ||
                          ns?.langs.find(
                            (item) => item.l?.code === defaultLocale
                          )?.about}
                      </p>
                    </CardContent>
                  </Card>
                  <Positions
                    positions={ns?.positions ?? []}
                    currentLocale={locale}
                    title={t("ns.positions")}
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Festivals
                    festivals={ns?.festivals ?? []}
                    currentLocale={locale}
                    title={t("ns.festivals")}
                  />
                  <Groups
                    groups={ns?.groups ?? []}
                    currentLocale={locale}
                    title={t("ns.groups")}
                  />
                </div>
                <Card className="col-span-1">
                  <CardHeader>
                    <CardTitle>{t("ns.events")}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-2">
                    <Timeline>
                      {ns?.otherEvents.map((item) => (
                        <TimelineItem key={`event-${item.id}`}>
                          <TimelineConnector />
                          <TimelineHeader>
                            <TimelineIcon />
                            <TimelineTitle>
                              {formatter.dateTimeRange(
                                item.startDate,
                                item.endDate,
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                }
                              )}
                            </TimelineTitle>
                          </TimelineHeader>
                          <TimelineContent>
                            <TimelineDescription>
                              {item.langs.at(0)?.name}
                            </TimelineDescription>
                          </TimelineContent>
                        </TimelineItem>
                      ))}
                    </Timeline>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}
