import Image from "next/image";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/common/header";
import {
  GalleryImageEvent,
  CustomImage as GalleryImages,
} from "@/components/common/event/gallery-images";
import {
  CarouselImage,
  ICarouselImage,
} from "@/components/common/carousel-image";
import { getFormatter, getLocale, getTranslations } from "next-intl/server";
import { defaultLocale } from "@/i18n/config";
import Link from "next/link";
import {
  Facebook,
  Instagram,
  Link2,
  Phone,
  Youtube,
  Download,
} from "lucide-react";
import { Image as GalleryImage } from "react-grid-gallery";
import { getGroupById } from "@/db/queries/groups";
import { auth } from "@/auth";
import { ForbiddenContent } from "@/components/common/forbidden-content";
import Comments from "@/components/common/comments";

export interface CustomImage extends GalleryImage {}

export default async function GroupDetail({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();
  const locale = await getLocale();
  const formatter = await getFormatter();
  const festival = await getGroupById(Number(params.id));
  const t = await getTranslations("page.group");
  const ta = await getTranslations("action");
  const translations = await getTranslations("detailFestivals");

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

  return (
    <div className="flex flex-col w-full min-h-screen">
      <Header className="border-b" text="text-black" />
      <main className="flex flex-col flex-1 gap-4 md:gap-8 bg-gray-50">
        <div className="relative w-full h-[400px]">
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
                  <Card className="col-span-1">
                    <CardHeader>
                      <CardTitle>Profiles</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-4">
                        <li className="flex items-center gap-4">
                          <Avatar>
                            <AvatarImage
                              src={festival?.directorPhoto?.url}
                              alt={festival?.generalDirectorName ?? ""}
                            />
                            <AvatarFallback>
                              {festival?.generalDirectorName
                                ?.at(0)
                                ?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold">
                              {festival?.generalDirectorName}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {festival?.langs.find(
                                (item) => item.l?.code === locale
                              )?.generalDirectorProfile ||
                                festival?.langs.find(
                                  (item) => item.l?.code === defaultLocale
                                )?.generalDirectorProfile}
                            </p>
                            <span className="text-xs text-gray-400">
                              {t("general_director")}
                            </span>
                          </div>
                        </li>
                        <li className="flex items-center gap-4">
                          <Avatar>
                            <AvatarImage
                              src={festival?.artisticPhoto?.url}
                              alt={festival?.artisticDirectorName ?? ""}
                            />
                            <AvatarFallback>
                              {festival?.artisticDirectorName
                                ?.at(0)
                                ?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold">
                              {festival?.artisticDirectorName}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {festival?.langs.find(
                                (item) => item.l?.code === locale
                              )?.artisticDirectorProfile ||
                                festival?.langs.find(
                                  (item) => item.l?.code === defaultLocale
                                )?.artisticDirectorProfile}
                            </p>
                            <span className="text-xs text-gray-400">
                              {t("artistic_director")}
                            </span>
                          </div>
                        </li>
                        <li className="flex items-center gap-4">
                          <Avatar>
                            <AvatarImage
                              src={festival?.musicalPhoto?.url}
                              alt={festival?.musicalDirectorName ?? ""}
                            />
                            <AvatarFallback>
                              {festival?.musicalDirectorName
                                ?.at(0)
                                ?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold">
                              {festival?.musicalDirectorName}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {festival?.langs.find(
                                (item) => item.l?.code === locale
                              )?.musicalDirectorProfile ||
                                festival?.langs.find(
                                  (item) => item.l?.code === defaultLocale
                                )?.musicalDirectorProfile}
                            </p>
                            <span className="text-xs text-gray-400">
                              {t("musical_director")}
                            </span>
                          </div>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
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
                      {session !== null ? (
                        <>
                          <p className="text-gray-500">
                            {translations("email")}:&nbsp;
                            {festival?.subgroups[0]?.contactMail ??
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
                          {festival?.phone && (
                            <p className="flex gap-1 items-center">
                              <Phone size={14} className="text-gray-500" />
                              <Link
                                className="text-gray-500"
                                href={`tel:${festival?.phone}`}
                              >
                                {festival?.phone}
                              </Link>
                            </p>
                          )}
                          {festival?.linkPortfolio && (
                            <p className="flex gap-1 items-center text-gray-500">
                              {translations("portfolioLink")}:&nbsp;
                              <Link
                                href={festival?.linkPortfolio!}
                                target="_blank"
                                title="portfolio Link"
                                className="line-clamp-1 hover:underline"
                              >
                                {festival?.linkPortfolio}
                              </Link>
                            </p>
                          )}
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
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Card className="col-span-1">
                    <CardHeader>
                      <CardTitle>Travel Information</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-wrap flex-col gap-2">
                      <div className="mb-1">
                        <p className="text-sm text-muted-foreground">
                          {t("avail_trave_year")}
                        </p>
                        <p className="text-sm">
                          {festival?.isAbleTravel ? ta("yes") : ta("no")}
                        </p>
                      </div>
                      {festival?.specificTravelDateFrom &&
                      festival.specificTravelDateTo ? (
                        <div className="mb-1">
                          <p className="text-sm text-muted-foreground">
                            {t("specific_date")}
                          </p>
                          <p className="text-sm">
                            {formatter.dateTimeRange(
                              festival?.specificTravelDateFrom,
                              festival?.specificTravelDateTo,
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )}
                          </p>
                        </div>
                      ) : null}
                      <div className="mb-1">
                        <p className="text-sm text-muted-foreground">
                          {t("specific_region")}
                        </p>
                        <p className="text-sm">
                          {festival?.specificRegion?.langs.find(
                            (item) => item.l?.code === locale
                          )?.name ||
                            festival?.specificRegion?.langs.find(
                              (item) => item.l?.code === defaultLocale
                            )?.name}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="col-span-1">
                    <CardHeader>
                      <CardTitle>Subgroups</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {festival?.subgroups.map((item, index) => {
                        return (
                          <div key={index}>
                            <p className="text-sm">
                              {item?.langs.find(
                                (item) => item.l?.code === locale
                              )?.name ||
                                item?.langs.find(
                                  (item) => item.l?.code === defaultLocale
                                )?.name}{" "}
                              - ({item.membersNumber} members)
                            </p>
                            <div className="my-1">
                              {item?.subgroupsToCategories.map((sitem) => (
                                <Badge
                                  key={`subgroup-category-${sitem.categoryId}`}
                                >
                                  {sitem?.category?.langs.at(0)?.name}
                                </Badge>
                              ))}
                            </div>
                            <div className="my-1 text-xs text-muted-foreground flex flex-col gap-0.5">
                              <p>{item.contactName}</p>
                              <p>{item.contactMail}</p>
                              <p>{item.contactPhone}</p>
                            </div>
                          </div>
                        );
                      })}
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
                {festival?.reportsFromFestivals.length ? (
                  <Card className="col-span-1">
                    <CardHeader>
                      <CardTitle>{t("comments")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Comments
                        items={festival.reportsFromFestivals.map(
                          (reportToGroup) => {
                            return {
                              authorName:
                                reportToGroup.report.fesival.langs.find(
                                  (item) => item?.l?.code === locale
                                )?.name! ||
                                reportToGroup.report.fesival.langs.find(
                                  (item) => item?.l?.code === defaultLocale
                                )?.name!,
                              logoUrl: reportToGroup.report.fesival.logo?.url,
                              comment: reportToGroup.generalComment,
                              rating: parseFloat(reportToGroup.ratingResult),
                              createdAt: reportToGroup.createdAt,
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
