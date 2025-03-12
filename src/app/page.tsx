import Link from "next/link";
import Image from "next/image";
import {
  Instagram,
  Link as LinkComponent,
} from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Header } from "@/components/common/header";
import GlobalFilterPreview from "@/components/common/global-filter-preview";
import { getAllNestedFestivals } from "@/db/queries/events";
import CarouselHistory from "@/components/common/carousel-history";
import { getAllCountryCastFestivals } from "@/db/queries/countries";
import { Locale } from "@/i18n/config";
import { getAllCategories } from "@/db/queries/categories";
import { getBannerFromLocale } from "@/db/queries/design";
import { getFirstSocialMediaLink } from "@/db/queries/social-media-links";
import X from "@/components/common/icons/x";
import Tiktok from "@/components/common/icons/tiktok";
import Youtube from "@/components/common/icons/youtube";
import Facebook from "@/components/common/icons/facebook";
import News from "@/components/common/news/latest-news";

export default async function Home() {
  const locale = await getLocale();
  const t = await getTranslations("home");

  const socialLink = await getFirstSocialMediaLink();
  const festivals = await getAllNestedFestivals();
  const countryCast = await getAllCountryCastFestivals(locale as Locale);
  const categories = await getAllCategories(locale as Locale);
  const banner = await getBannerFromLocale(locale as Locale);
  const articles: any = []; // testing

  const title = banner.find((banner) => banner.key === "title");
  const subtitle = banner.find((banner) => banner.key === "subtitle");
  const image = banner.find((banner) => banner.key === "image");

  return (
    <div>
      <Header text="text-white" className="absolute left-0 right-0 top-0" />
      <main>
        <section className="flex flex-col items-center justify-center h-screen bg-cover bg-center relative">
          <Image
            src={image?.value || "/hero-image.webp"}
            alt="Hero background"
            className="absolute inset-0 w-full h-full object-cover"
            fill
          />
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-center text-white">
            <h1 className="text-8xl font-extrabold text-secular">
              {title?.value}
            </h1>
            <h2 className="text-7xl font-bold mt-4 text-cursive italic">
              {subtitle?.value?.replace("¡", "")}
            </h2>
          </div>
          <div className="absolute bottom-0 left-0 right-0 flex justify-center items-center space-x-2 mb-4 gap-6">
            {socialLink?.facebookLink && (
              <Link href={socialLink?.facebookLink} target="_blank">
                <Facebook className="w-6 h-6 fill-white" />
              </Link>
            )}
            {socialLink?.instagramLink && (
              <Link href={socialLink?.instagramLink} target="_blank">
                <Instagram className="w-6 h-6 text-white" />
              </Link>
            )}
            {socialLink?.youtubeLink && (
              <Link href={socialLink?.youtubeLink} target="_blank">
                <Youtube className="w-8 h-8 fill-white" />
              </Link>
            )}
            {socialLink?.xLink && (
              <Link href={socialLink?.xLink} target="_blank">
                <X className="w-6 h-6 fill-white" />
              </Link>
            )}
            {socialLink?.tiktokLink && (
              <Link href={socialLink?.tiktokLink} target="_blank">
                <Tiktok className="w-6 h-6 fill-white" />
              </Link>
            )}
            {socialLink?.websiteLink && (
              <Link href={socialLink?.websiteLink} target="_blank">
                <LinkComponent className="w-6 h-6 text-white" />
              </Link>
            )}
          </div>
        </section>
        <p className="text-secular text-2xl text-center mt-[70px] mb-5">{t("firstTitle")}</p>
        <GlobalFilterPreview
          fallbackFestivals={festivals}
          fallbackCountryCast={countryCast}
          categories={categories}
        />
        <div className="relative w-full h-96 flex items-center">
          <Image
            src={image?.value || "/hero-image.webp"}
            alt="Hero background"
            objectPosition="50% 20%"
            className="absolute inset-0 w-full h-full object-cover"
            fill
          />
          <div className="absolute text-white text-roboto font-bold text-end text-3xl right-4 capitalize">
            <p>CIOFF@ Promotes intangible cultural</p>
            <p>Heritage through folklore</p>
            <Button className="bg-white text-black hover:bg-black hover:text-white">Learn about our NGO</Button>
          </div>
        </div>
        <section className="bg-white py-4 sm:py-8">
          <News />
        </section>
        <section className="bg-white py-4 sm:py-8">
          <div className="container mx-auto px-4">
            <h2 className="text-xl font-bold text-black sm:text-2xl">
              Our History
            </h2>
            <div className="flex space-y-4 mt-4 sm:flex-row sm:space-x-4 sm:space-y-0 w-full">
              <CarouselHistory />
            </div>
          </div>
        </section>
        <section className="bg-gray-900 py-4 sm:py-8 hidden">
          <div className="container mx-auto px-4">
            <h2 className="text-xl font-bold text-white sm:text-2xl">
              Publish your event
            </h2>
            <div className="bg-gray-800 p-4 mt-4 rounded-lg">
              <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
                <Input
                  placeholder="Where will your event be?"
                  className="flex-1"
                />
                <Input placeholder="When is your event?" className="flex-1" />
                <Input
                  placeholder="Choose one or more categories"
                  className="flex-1"
                />
              </div>
              <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0 mt-4">
                <Input
                  placeholder="Enter the name of your event"
                  className="flex-1"
                />
                <Input
                  placeholder="Put the event logo here"
                  className="flex-1"
                />
              </div>
              <Textarea
                placeholder="Tell us about your event..."
                className="w-full mt-4"
              />
              <Button variant="secondary" className="mt-4">
                Submit
              </Button>
            </div>
          </div>
        </section>
      </main>
      <footer className="bg-gray-50 py-4 sm:py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-800 text-xs sm:text-sm">info@cioff.org</p>
          <Image
            src="/logo.png"
            width="100"
            height="100"
            alt="CIOFF Logo"
            className="inline-block my-6"
          />
          <p className="text-gray-800 text-xs sm:text-sm">
            © CIOFF 1998 - 2024 | cioff.org
          </p>
        </div>
      </footer>
    </div>
  );
}
