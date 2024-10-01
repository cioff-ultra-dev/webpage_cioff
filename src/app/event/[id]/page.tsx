import Image from "next/image";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getFestivalById } from "@/db/queries/events";
import { Header } from "@/components/common/header";
import { format } from "date-fns";
import { MapMarkerEvent } from "@/components/common/event/map-marker";
import { GalleryImageEvent } from "@/components/common/event/gallery-images";
import { CoverImageEvent } from "@/components/common/event/cover";
import { getLocale } from "next-intl/server";
import { defaultLocale } from "@/i18n/config";
import { SelectFestival } from "@/db/schema";

export default async function EventDetail({
  params,
}: {
  params: { id: string };
}) {
  const locale = await getLocale();
  const festival = await getFestivalById(Number(params.id), locale);

  return (
    <div className="flex flex-col w-full min-h-screen">
      <Header className="border-b" text="text-black" />
      <main className="flex flex-col flex-1 gap-4 md:gap-8 bg-gray-50">
        <div className="relative w-full h-[400px]">
          <CoverImageEvent cover={String(festival?.coverId) || ""} />
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
            <div className="flex items-center gap-2">
              <Avatar>
                <AvatarImage
                  src={String(festival?.logoId) || "/placeholder-user.jpg"}
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
                  {" "}
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
                  <Button variant="outline">Get directions</Button>
                  <Button variant="outline">Call now</Button>
                  <Button variant="outline">Website</Button>
                  {/* <Button variant="outline">Bookmark</Button> */}
                  <Button variant="outline">Share</Button>
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
                      <CardTitle>Location</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <MapMarkerEvent location={festival?.location ?? ""} />
                      <Button variant="outline" className="mt-2">
                        Get Directions
                      </Button>
                    </CardContent>
                  </Card>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Card className="col-span-1">
                    <CardHeader>
                      <CardTitle>Tags</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-2">
                      <Badge>International</Badge>
                      <Badge>CIOFF</Badge>
                      <Badge>Folk dance</Badge>
                      <Badge>Folk music</Badge>
                      <Badge>Folk Singing</Badge>
                      <Badge>Traditional food</Badge>
                      <Badge>Traditional costumes</Badge>
                      <Badge>Handicrafts</Badge>
                      <Badge>Local culture</Badge>
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
                    </CardContent>
                  </Card>
                </div>
                <Card className="col-span-1">
                  <CardHeader>
                    <CardTitle>Festival Date</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-2">
                    {/* {festival?.currentDates?.split(",").map((item) => {
                      return (
                        <Badge key={item}>
                          {format(new Date(Number(item) * 1000), "PPP")}
                        </Badge>
                      );
                    })} */}
                  </CardContent>
                </Card>
                <Card className="col-span-1">
                  <CardHeader>
                    <CardTitle>Gallery</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <GalleryImageEvent event={festival as SelectFestival} />
                  </CardContent>
                </Card>
                {festival?.youtubeId ? (
                  <Card className="col-span-1">
                    <CardHeader>
                      <CardTitle>Video</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <iframe
                        width="560"
                        height="315"
                        src={`https://www.youtube.com/embed/${festival?.youtubeId}`}
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
