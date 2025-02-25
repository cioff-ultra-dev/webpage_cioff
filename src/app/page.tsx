import Link from "next/link";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Header } from "@/components/common/header";
import {
  Youtube,
  Instagram,
  Facebook,
  Link as LinkComponent,
} from "lucide-react";
import GlobalFilterPreview from "@/components/common/global-filter-preview";
import { getAllNestedFestivals } from "@/db/queries/events";
import CarouselHistory from "@/components/common/carousel-history";
import { getAllCountryCastFestivals } from "@/db/queries/countries";
import { getLocale, getTranslations } from "next-intl/server";
import { Locale } from "@/i18n/config";
import { getAllCategories } from "@/db/queries/categories";
import { getBannerFromLocale } from "@/db/queries/design";
import { getFirstSocialMediaLink } from "@/db/queries/social-media-links";
import X from "@/components/common/icons/x";
import Tiktok from "@/components/common/icons/tiktok";

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
            <h1 className="text-6xl font-bold">{title?.value}</h1>
            <h2 className="text-8xl font-bold mt-4">{subtitle?.value}</h2>
          </div>
          <div className="absolute bottom-0 left-0 right-0 flex justify-center items-center space-x-2 mb-4 gap-[0.1rem]">
            {socialLink?.facebookLink && (
              <Link href={socialLink?.facebookLink} target="_blank">
                <Facebook className="w-5 h-5 text-white" />
              </Link>
            )}
            {socialLink?.instagramLink && (
              <Link href={socialLink?.instagramLink} target="_blank">
                <Instagram className="w-5 h-5 text-white" />
              </Link>
            )}
            {socialLink?.youtubeLink && (
              <Link href={socialLink?.youtubeLink} target="_blank">
                <Youtube className="text-white" size={24} />
              </Link>
            )}
            {socialLink?.xLink && (
              <Link href={socialLink?.xLink} target="_blank">
                <X className="w-4 h-4 fill-white" />
              </Link>
            )}
            {socialLink?.tiktokLink && (
              <Link href={socialLink?.tiktokLink} target="_blank">
                <Tiktok className="w-5 h-5 fill-white" />
              </Link>
            )}
            {socialLink?.websiteLink && (
              <Link href={socialLink?.websiteLink} target="_blank">
                <LinkComponent className="w-4 h-4 text-white" />
              </Link>
            )}
          </div>
        </section>
        <GlobalFilterPreview
          fallbackFestivals={festivals}
          fallbackCountryCast={countryCast}
          categories={categories}
        />
        <section className="bg-white py-4 sm:py-8">
          <div className="container mx-auto px-4">
            <h2 className="text-xl font-bold text-black sm:text-2xl">
              Latest news
            </h2>
            <div className="flex flex-col space-y-4 mt-4 sm:flex-row sm:space-x-4 sm:space-y-0">
              {articles?.slice(0, 2).map((articleData: any) => {
                // ArticleData
                const text = articleData?.texts?.[0];
                if (!text) return null;

                type ArticleSection = {
                  id: string;
                  type: "image" | "title" | "subtitle" | "paragraph" | "list";
                  content: string;
                };

                const sections = JSON.parse(
                  text.sections ?? "[]"
                ) as ArticleSection[];
                const coverImage = sections.find(
                  (section) => section.type === "image"
                )?.content;

                return (
                  <Link
                    key={articleData.id}
                    href={`/news/${articleData.id}`}
                    className="flex-1 bg-gray-100 p-4 rounded-lg hover:bg-gray-200 transition-colors group"
                  >
                    {coverImage ? (
                      <Image
                        src={coverImage}
                        alt={text.title ?? "Article image"}
                        width={800}
                        height={400}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="h-48 bg-gray-700 rounded-lg" />
                    )}
                    <h3 className="text-black mt-4 text-lg font-semibold group-hover:text-blue-600 transition-colors">
                      {text.title}
                    </h3>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
        <section className="bg-white py-4 sm:py-8">
          <div className="container mx-auto px-4">
            <h2 className="text-xl font-bold text-black sm:text-2xl">
              Our History
            </h2>
            <div className="flex space-y-4 mt-4 sm:flex-row sm:space-x-4 sm:space-y-0">
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
