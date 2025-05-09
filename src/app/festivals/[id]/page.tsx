import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { getFestivalById } from "@/db/queries/events";
import { Header } from "@/components/common/header";
import { MapMarkerEvent } from "@/components/common/event/map-marker";
import { GalleryImageEvent } from "@/components/common/event/gallery-images";
import { getFormatter, getLocale, getTranslations } from "next-intl/server";
import { defaultLocale } from "@/i18n/config";
import Link from "next/link";
import {
  ExternalLink,
  Facebook,
  Instagram,
  Link2,
  MapPinIcon,
  Phone,
  Youtube,
} from "lucide-react";
import { Image as GalleryImage } from "react-grid-gallery";
import {
  Timeline,
  TimelineItem,
  TimelineConnector,
  TimelineHeader,
  TimelineTitle,
  TimelineIcon,
} from "@/components/extension/timeline";
import { auth } from "@/auth";
import { ForbiddenContent } from "@/components/common/forbidden-content";
import {
  CarouselImage,
  ICarouselImage,
} from "@/components/common/carousel-image";
import Comments from "@/components/common/comments";
import Footer from "@/components/common/footer";
import { Locale } from "@/i18n/config";
import { CategoriesType } from "@/db/queries/categories";
import { CategorySection } from "@/components/common/category-section";
import { Badge } from "@/components/ui/badge";

export interface CustomImage extends GalleryImage {}

export default async function EventDetail({
  params,
}: {
  params: { id: string };
}) {
  const [session, locale, formatter, translations, t] = await Promise.all([
    auth(),
    getLocale(),
    getFormatter(),
    getTranslations("detailProfile"),
    getTranslations("page.festival"),
  ]);

  const festival = await getFestivalById(Number(params.id), locale);

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

  const coverImages: ICarouselImage[] = festival?.coverPhotos.length
    ? festival?.coverPhotos.map(({ photo = {} }) => ({
        name: photo?.name!,
        url: photo?.url!,
      }))
    : [
        {
          url: festival?.coverPhoto?.url ?? "/placeholder.svg",
          name: festival?.coverPhoto?.name ?? "default",
        },
      ];

  const categories = festival?.festivalsToCategories?.map(
    ({ category }) => category
  ) as CategoriesType;

  return (
    <div className="flex flex-col w-full min-h-screen">
      <Header
        text="text-white max-lg:text-black text-roboto text-2xl px-2 py-1 hover:bg-white/40 max-lg:hover:bg-black/20"
        className="absolute left-0 right-0 top-0 max-sm:fixed max-sm:bg-white"
      />
      <main className="flex flex-col flex-1 gap-4 md:gap-8 bg-gray-50 pb-8">
        <div className="relative w-full h-[80vh]">
          <CarouselImage images={coverImages} />
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
                  {/* <Button variant="outline">Bookmark</Button> */}
                  {/* <Button variant="outline">Share</Button> */}
                  {/* <Button variant="outline">Leave a review</Button> */}
                  {/* <Button variant="outline">Claim listing</Button> */}
                  {/* <Button variant="outline">Report</Button> */}
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Card className="col-span-1">
                    <CardHeader>
                      <CardTitle>{translations("description")}</CardTitle>
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
                  <Card className="col-span-1">
                    <CardHeader>
                      <CardTitle>{translations("location")}</CardTitle>
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
                          <span>{translations("direction")}</span>
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <CategorySection
                    categories={categories}
                    locale={locale as Locale}
                    categoryType="festivals"
                  />
                  <Card className="col-span-1">
                    <CardHeader>
                      <CardTitle>{translations("contact")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {session !== null ? (
                        <>
                          <p className="text-gray-500">
                            {translations("director")}:&nbsp;
                            {festival?.directorName ?? "Pending"}
                          </p>
                          <p className="text-gray-500">
                            {translations("email")}:&nbsp;
                            {festival?.email ??
                              festival?.owners[0]?.user?.email ??
                              "Pending"}
                          </p>
                          <p>
                            {festival?.langs.find(
                              (item) => item.l?.code === locale
                            )?.address ||
                              festival?.langs.find(
                                (item) => item.l?.code === defaultLocale
                              )?.address}
                          </p>
                          <p className="flex gap-1 items-center">
                            <Phone size={14} className="text-gray-500" />
                            <Link
                              className="text-gray-500"
                              href={`tel:${festival?.phone}`}
                            >
                              {festival?.phone}
                            </Link>
                          </p>
                          <p className="flex gap-2 pt-6">
                            {festival?.social?.websiteLink ? (
                              <Link
                                href={festival?.social?.websiteLink}
                                target="_blank"
                                title="Website"
                              >
                                <Link2 size={20} className="text-gray-500" />
                              </Link>
                            ) : null}
                            {festival?.social?.facebookLink ? (
                              <Link
                                href={festival?.social?.facebookLink}
                                target="_blank"
                                title="Facebook Link"
                              >
                                <Facebook size={20} className="text-gray-500" />
                              </Link>
                            ) : null}
                            {festival?.social?.instagramLink ? (
                              <Link
                                href={festival?.social?.instagramLink}
                                target="_blank"
                                title="Instagram Link"
                              >
                                <Instagram
                                  size={20}
                                  className="text-gray-500"
                                />
                              </Link>
                            ) : null}
                            {festival?.youtubeId ? (
                              <Link
                                href={festival?.youtubeId}
                                target="_blank"
                                title="youtube Link"
                              >
                                <Youtube size={20} className="text-gray-500" />
                              </Link>
                            ) : null}
                          </p>
                        </>
                      ) : (
                        <ForbiddenContent />
                      )}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>{translations("events")}</CardTitle>
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
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>{translations("logistic")}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-x-2 gap-y-4">
                      {session !== null ? (
                        <section className="flex flex-col flex-wrap gap-4 w-full">
                          <div className="grid grid-cols-1 gap-2 ">
                            <span className="font-semibold">
                              {translations("conditionLink")}
                            </span>
                            {festival?.linkConditions ? (
                              <Link
                                href={festival?.linkConditions}
                                target="_blank"
                                className="hover:underline ml-2 break-words"
                              >
                                {festival?.linkConditions}
                              </Link>
                            ) : (
                              <p className="text-muted-foreground">
                                {translations("emptyLink")}
                              </p>
                            )}
                          </div>
                          <div className="grid grid-cols-1 gap-2 ">
                            <span className="font-semibold">
                              {translations("transport")}
                            </span>
                            <ul className="flex flex-col gap-2  ml-2">
                              {festival?.transports &&
                              festival?.transports.length > 0 ? (
                                festival?.transports.map((item) => (
                                  <li
                                    key={item.id}
                                    className="flex w-full gap-2 items-center py-4 px-2 border-b border-gray-200"
                                  >
                                    <MapPinIcon
                                      size={16}
                                      className="text-primary"
                                    />
                                    {item.location ?? ""}
                                  </li>
                                ))
                              ) : (
                                <p className="text-muted-foreground">
                                  {translations("emptyTransport")}
                                </p>
                              )}
                            </ul>
                          </div>
                          <div className="grid grid-cols-1 gap-2 ">
                            <span className="font-semibold">
                              {translations("searchGroup")}
                            </span>
                            <div className="flex flex-wrap gap-2 ml-2">
                              {festival?.festivalsGroupToRegions &&
                              festival?.festivalsGroupToRegions.length > 0 ? (
                                festival?.festivalsGroupToRegions?.map(
                                  (region) => (
                                    <Badge
                                      key={region.region?.langs?.[0]?.name}
                                    >
                                      {region.region?.langs?.[0]?.name}
                                    </Badge>
                                  )
                                )
                              ) : (
                                <p className="text-muted-foreground">
                                  {translations("notSearchingGroups")}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="grid grid-cols-1 gap-2 ">
                            <span className="font-semibold">
                              {translations("confirmGroup")}
                            </span>
                            <ul className="flex flex-col gap-2 ml-2">
                              {festival?.festivalsToGroups &&
                              festival?.festivalsToGroups?.length > 0 ? (
                                festival?.festivalsToGroups.map((item) => (
                                  <Link
                                    key={item.id}
                                    className="flex flex-col w-full py-2 px-4 border rounded-lg border-gray-100 hover:bg-gray-100"
                                    href={`/groups/${item?.group?.id ?? ""}`}
                                  >
                                    <p className="font-medium">
                                      {item.group?.langs.find(
                                        (lang) => lang?.l?.code === locale
                                      )?.name ??
                                        item.group?.langs?.[0]?.name ??
                                        ""}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      {
                                        item.group?.country?.langs.find(
                                          (lang) => lang?.l?.code === locale
                                        )?.name
                                      }
                                    </p>
                                  </Link>
                                ))
                              ) : (
                                <p className="text-muted-foreground">
                                  {translations("uncomfirmedGroup")}
                                </p>
                              )}
                            </ul>
                          </div>
                          <div className="grid grid-cols-1 gap-2 ">
                            <span className="font-semibold">
                              {translations("accommodation")}
                            </span>
                            <div className="ml-2">
                              {festival?.accomodationPhoto?.url ? (
                                <GalleryImageEvent
                                  thumbnailStyle={{
                                    width: 200,
                                    borderRadius: "5px",
                                  }}
                                  tileViewportStyle={{
                                    width: 200,
                                    borderRadius: "5px",
                                  }}
                                  gallery={[
                                    {
                                      src: festival?.accomodationPhoto?.url,
                                      width: 600,
                                      height: 600,
                                    },
                                  ]}
                                />
                              ) : (
                                <p className="text-muted-foreground">
                                  {translations("noAccommodation")}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="grid grid-cols-1 gap-2 ">
                            <span className="font-semibold">
                              {translations("stage")}
                            </span>
                            <div className="ml-2">
                              {festival?.stagePhotos?.length ? (
                                <GalleryImageEvent
                                  thumbnailStyle={{
                                    height: 100,
                                    width: 150,
                                    borderRadius: "5px",
                                    cursor: "pointer",
                                    objectFit: "cover",
                                    objectPosition: "50% 0%",
                                  }}
                                  tileViewportStyle={{
                                    height: 100,
                                    width: 150,
                                    borderRadius: "5px",
                                  }}
                                  gallery={
                                    festival?.stagePhotos.map((item) => ({
                                      src: item.photo?.url!,
                                      width: 600,
                                      height: 600,
                                    })) || []
                                  }
                                />
                              ) : (
                                <p className="text-muted-foreground">
                                  {translations("stageImage")}
                                </p>
                              )}
                            </div>
                          </div>
                        </section>
                      ) : (
                        <ForbiddenContent
                          text={translations("logisticsSection")}
                        />
                      )}
                    </CardContent>
                  </Card>
                </div>
                <Card className="col-span-1">
                  <CardHeader>
                    <CardTitle>{translations("gallery")}</CardTitle>
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
                {festival?.reportsFromGroups.length ? (
                  <Card className="col-span-1">
                    <CardHeader>
                      <CardTitle>{t("comments")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Comments
                        items={festival.reportsFromGroups.map(
                          (reportToFestival) => {
                            return {
                              authorName:
                                reportToFestival.report.group.langs.find(
                                  (item) => item?.l?.code === locale
                                )?.name! ||
                                reportToFestival.report.group.langs.find(
                                  (item) => item?.l?.code === defaultLocale
                                )?.name!,
                              logoUrl: reportToFestival.report.group.logo?.url,
                              comment: reportToFestival.generalComment,
                              rating: parseFloat(reportToFestival.ratingResult),
                              createdAt: reportToFestival.createdAt,
                            };
                          }
                        )}
                      />
                    </CardContent>
                  </Card>
                ) : null}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
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
