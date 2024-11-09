import Image from "next/image";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { getFestivalById } from "@/db/queries/events";
import { Header } from "@/components/common/header";
import { getFormatter, getLocale, getTranslations } from "next-intl/server";
import { defaultLocale } from "@/i18n/config";
import { Music, UserCircle, Users } from "lucide-react";
import { Image as GalleryImage } from "react-grid-gallery";
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

export interface CustomImage extends GalleryImage {}

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
                      (item) => item.l?.code === currentLocale,
                    )?.name ||
                      position?.type?.langs.find(
                        (item) => item.l?.code === defaultLocale,
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
          <ul className="space-y-4">
            {festivals.map((festival, index) => (
              <li key={index} className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage
                    src={festival.logo?.url}
                    alt={
                      festival.langs.find(
                        (lang) => lang.l?.code === currentLocale,
                      )?.name ?? ""
                    }
                  />
                  <AvatarFallback>
                    {festival.langs
                      .find((lang) => lang.l?.code === currentLocale)
                      ?.name.charAt(0)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">
                    {
                      festival.langs.find(
                        (lang) => lang.l?.code === currentLocale,
                      )?.name
                    }
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {festival.owners.at(0)?.user?.email}
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

function Groups({
  groups,
  currentLocale,
  title,
}: {
  groups: NonNullable<NationalSectionTypeById>["groups"];
  currentLocale: string;
  title?: string;
}) {
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
            {groups.map((group, index) => (
              <li key={index} className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage
                    src={group.logo?.url}
                    alt={
                      group.langs.find((lang) => lang.l?.code === currentLocale)
                        ?.name ?? ""
                    }
                  />
                  <AvatarFallback>
                    {group.langs
                      .find((lang) => lang.l?.code === currentLocale)
                      ?.name.charAt(0)
                      .toUpperCase() ?? ""}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">
                    {group.langs.find((lang) => lang.l?.code === currentLocale)
                      ?.name ?? ""}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {group.owners.at(0)?.user?.email}
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

export default async function NationaSectionDetail({
  params,
}: {
  params: { id: string };
}) {
  const locale = await getLocale();
  const t = await getTranslations("page");
  const formatter = await getFormatter();
  const ns = await getNationaSectionById(Number(params.id), locale);

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
        <div className="flex flex-col w-full max-w-5xl mx-auto">
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
                <div className="flex gap-3">
                  {/* <Button variant="outline">Get directions</Button> */}
                  {/* <Button variant="outline">Bookmark</Button> */}
                  {/* <Button variant="outline">Share</Button> */}
                  {/* <Button variant="outline">Leave a review</Button> */}
                  {/* <Button variant="outline">Claim listing</Button> */}
                  {/* <Button variant="outline">Report</Button> */}
                </div>
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
                            (item) => item.l?.code === defaultLocale,
                          )?.about}
                      </p>
                    </CardContent>
                  </Card>
                  {/* <Card className="col-span-1"> */}
                  {/*   <CardHeader> */}
                  {/*     <CardTitle>Location</CardTitle> */}
                  {/*   </CardHeader> */}
                  {/*   <CardContent> */}
                  <Positions
                    positions={ns?.positions ?? []}
                    currentLocale={locale}
                    title={t("ns.positions")}
                  />
                  {/*   </CardContent> */}
                  {/* </Card> */}
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
                  {/* <Card className="col-span-1"> */}
                  {/*   <CardHeader> */}
                  {/*     <CardTitle>Contact</CardTitle> */}
                  {/*   </CardHeader> */}
                  {/*   <CardContent> */}
                  {/*     <p> */}
                  {/*       {festival?.langs.find((item) => item.l?.code === locale) */}
                  {/*         ?.address || */}
                  {/*         festival?.langs.find( */}
                  {/*           (item) => item.l?.code === defaultLocale, */}
                  {/*         )?.address} */}
                  {/*     </p> */}
                  {/*     <p className="flex gap-1 items-center"> */}
                  {/*       <Phone size={14} className="text-gray-500" /> */}
                  {/*       <span className="text-gray-500">{festival?.phone}</span> */}
                  {/*     </p> */}
                  {/*     <p className="flex gap-2 pt-6"> */}
                  {/*       {festival?.social?.websiteLink ? ( */}
                  {/*         <Link */}
                  {/*           href={festival?.social?.websiteLink} */}
                  {/*           target="_blank" */}
                  {/*           title="Website" */}
                  {/*         > */}
                  {/*           <Link2 size={20} className="text-gray-500" /> */}
                  {/*         </Link> */}
                  {/*       ) : null} */}
                  {/*       {festival?.social?.facebookLink ? ( */}
                  {/*         <Link */}
                  {/*           href={festival?.social?.facebookLink} */}
                  {/*           target="_blank" */}
                  {/*           title="Facebook Link" */}
                  {/*         > */}
                  {/*           <Facebook size={20} className="text-gray-500" /> */}
                  {/*         </Link> */}
                  {/*       ) : null} */}
                  {/*       {festival?.social?.instagramLink ? ( */}
                  {/*         <Link */}
                  {/*           href={festival?.social?.instagramLink} */}
                  {/*           target="_blank" */}
                  {/*           title="Instagram Link" */}
                  {/*         > */}
                  {/*           <Instagram size={20} className="text-gray-500" /> */}
                  {/*         </Link> */}
                  {/*       ) : null} */}
                  {/*     </p> */}
                  {/*   </CardContent> */}
                  {/* </Card> */}
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
                                },
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
      <footer className="py-4 sm:py-8 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400 text-xs sm:text-sm">info@cioff.org</p>
          <Image
            src="/logo.png"
            width="100"
            height="100"
            alt="CIOFF Logo"
            className="inline-block my-6"
          />
          <p className="text-gray-400 text-xs sm:text-sm">
            © CIOFF 1998 - 2024 | cioff.org
          </p>
        </div>
      </footer>
    </div>
  );
}

type SVGComponentProps = React.ComponentPropsWithoutRef<"svg">;

function FacebookIcon(props: SVGComponentProps) {
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
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function InstagramIcon(props: SVGComponentProps) {
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
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
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

function YoutubeIcon(props: SVGComponentProps) {
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
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
      <path d="m10 15 5-3-5-3z" />
    </svg>
  );
}
