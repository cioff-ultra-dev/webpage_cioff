import Image from "next/image";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getFestivalById } from "@/db/queries/events";
import { Header } from "@/components/common/header";
import { MapMarkerEvent } from "@/components/common/event/map-marker";
import { GalleryImageEvent } from "@/components/common/event/gallery-images";
import { CoverImageEvent } from "@/components/common/event/cover";
import { getFormatter, getLocale } from "next-intl/server";
import { defaultLocale } from "@/i18n/config";
import { SelectFestival } from "@/db/schema";
import Link from "next/link";
import { ExternalLink, Facebook, Instagram, Link2, Phone } from "lucide-react";
import { Image as GalleryImage } from "react-grid-gallery";
import {
  Timeline,
  TimelineItem,
  TimelineConnector,
  TimelineHeader,
  TimelineTitle,
  TimelineIcon,
  TimelineDescription,
  TimelineContent,
  TimelineTime,
} from "@/components/extension/timeline";
import { InstagramLogoIcon } from "@radix-ui/react-icons";
import { getGroupById } from "@/db/queries/groups";

export interface CustomImage extends GalleryImage {}

export default async function EventDetail({
  params,
}: {
  params: { id: string };
}) {
  const locale = await getLocale();
  const formatter = await getFormatter();
  const festival = await getGroupById(Number(params.id));

  let youtubeId = "";

  if (festival?.youtubeId) {
    const url = new URL(festival.youtubeId);
    const sp = new URLSearchParams(url.search);
    youtubeId = sp.get("v") ?? "";
  }

  const gallery: CustomImage[] =
    festival?.photos.map((item) => ({
      src: item.photo?.url!,
      width: 600,
      height: 600,
    })) || [];

  return (
    <div className="flex flex-col w-full min-h-screen">
      <Header className="border-b" text="text-black" />
      <main className="flex flex-col flex-1 gap-4 md:gap-8 bg-gray-50">
        <div className="relative w-full h-[400px]">
          <CoverImageEvent
            cover={
              festival?.coverPhoto
                ? festival.coverPhoto.url
                : "/placeholder.svg"
            }
          />
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
            <div className="flex items-center gap-2">
              <Avatar>
                <AvatarImage
                  src={String(festival?.logo?.url) || "/placeholder-user.jpg"}
                  alt="Logo"
                />
                <AvatarFallback>
                  {festival?.langs.find((item) => item.l?.code === locale)
                    ?.name ||
                    festival?.langs.find(
                      (item) => item.l?.code === defaultLocale
                    )?.name}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {festival?.langs.find((item) => item.l?.code === locale)
                    ?.name ||
                    festival?.langs.find(
                      (item) => item.l?.code === defaultLocale
                    )?.name}
                </h1>
              </div>
            </div>
          </div>
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
                  <Button variant="outline" asChild>
                    <Link href={`tel:${festival?.phone}`}>Call now</Link>
                  </Button>
                  <Button
                    variant="outline"
                    asChild
                    disabled={!festival?.websiteLink}
                  >
                    <Link href={festival?.websiteLink ?? ""} target="_blank">
                      Website
                    </Link>
                  </Button>
                  {/* <Button variant="outline">Bookmark</Button> */}
                  {/* <Button variant="outline">Share</Button> */}
                  {/* <Button variant="outline">Leave a review</Button> */}
                  {/* <Button variant="outline">Claim listing</Button> */}
                  {/* <Button variant="outline">Report</Button> */}
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Card className="col-span-1">
                    <CardHeader>
                      <CardTitle>Description</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>
                        {festival?.langs.find((item) => item.l?.code === locale)
                          ?.description ||
                          festival?.langs.find(
                            (item) => item.l?.code === defaultLocale
                          )?.description}
                      </p>
                    </CardContent>
                  </Card>
                  {/* <Card className="col-span-1">
                    <CardHeader>
                      <CardTitle>Location</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <MapMarkerEvent
                        location={festival?.location ?? ""}
                        lat={festival?.lat!}
                        lng={festival?.lng!}
                      />
                      <Button
                        variant="outline"
                        className="mt-2 flex gap-1 items-center"
                        asChild
                        disabled={
                          !festival?.location &&
                          !festival?.lat &&
                          !festival?.lng
                        }
                      >
                        <Link
                          href={`https://maps.google.com?q=${festival?.location}&loc:${festival?.lat}+${festival?.lng}`}
                          target="_blank"
                        >
                          <ExternalLink size={14} />
                          <span>Get Direction</span>
                        </Link>
                      </Button>
                    </CardContent>
                  </Card> */}
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Card className="col-span-1">
                    <CardHeader>
                      <CardTitle>Categories</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-2">
                      {festival?.groupToCategories.map((item) => (
                        <Badge key={`category-${item.categoryId}`}>
                          {item?.category?.langs.at(0)?.name}
                        </Badge>
                      ))}
                    </CardContent>
                  </Card>
                  <Card className="col-span-1">
                    <CardHeader>
                      <CardTitle>Contact</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>
                        {festival?.langs.find((item) => item.l?.code === locale)
                          ?.address ||
                          festival?.langs.find(
                            (item) => item.l?.code === defaultLocale
                          )?.address}
                      </p>
                      <p className="flex gap-1 items-center">
                        <Phone size={14} className="text-gray-500" />
                        <span className="text-gray-500">{festival?.phone}</span>
                      </p>
                      <p className="flex gap-2 pt-6">
                        {festival?.websiteLink ? (
                          <Link
                            href={festival?.websiteLink}
                            target="_blank"
                            title="Website"
                          >
                            <Link2 size={20} className="text-gray-500" />
                          </Link>
                        ) : null}
                        {festival?.facebookLink ? (
                          <Link
                            href={festival?.facebookLink}
                            target="_blank"
                            title="Facebook Link"
                          >
                            <Facebook size={20} className="text-gray-500" />
                          </Link>
                        ) : null}
                        {festival?.instagramLink ? (
                          <Link
                            href={festival?.instagramLink}
                            target="_blank"
                            title="Instagram Link"
                          >
                            <Instagram size={20} className="text-gray-500" />
                          </Link>
                        ) : null}
                      </p>
                    </CardContent>
                  </Card>
                </div>
                {/* <Card className="col-span-1">
                  <CardHeader>
                    <CardTitle>Events</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-2">
                    <Timeline>
                      {festival?.events.map((item) => (
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
                        </TimelineItem>
                      ))}
                    </Timeline>
                  </CardContent>
                </Card> */}
                <Card className="col-span-1">
                  <CardHeader>
                    <CardTitle>Gallery</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <GalleryImageEvent gallery={gallery} />
                  </CardContent>
                </Card>
                {youtubeId ? (
                  <Card className="col-span-1">
                    <CardHeader>
                      <CardTitle>Video</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <iframe
                        height="600"
                        className="w-full"
                        src={`https://www.youtube.com/embed/${youtubeId}`}
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </CardContent>
                  </Card>
                ) : null}
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