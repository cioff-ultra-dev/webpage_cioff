import Link from "next/link";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Header } from "@/components/common/header";
import { Linkedin, Instagram, Facebook } from "lucide-react";
import GlobalFilterPreview from "@/components/common/global-filter-preview";
import { getAllNestedFestivals } from "@/db/queries/events";
import CarouselHistory from "@/components/common/carousel-history";
import { getAllCountryCastFestivals } from "@/db/queries/countries";
import { getLocale, getTranslations } from "next-intl/server";
import { Locale } from "@/i18n/config";
import { getAllCategories } from "@/db/queries/categories";

export default async function Home() {
  const locale = await getLocale();

  const festivals = await getAllNestedFestivals();
  const countryCast = await getAllCountryCastFestivals(locale as Locale);
  const categories = await getAllCategories(locale as Locale);

  const t = await getTranslations("home");

  /*
  <video
            loop
            muted
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="/hero-video.mp4" type="video/mp4" />
          </video>
  */

  return (
    <div>
      <Header text="text-white" className="absolute left-0 right-0 top-0" />
      <main>
        <section className="flex flex-col items-center justify-center h-screen bg-cover bg-center relative">
        <img
          src="/hero-image.webp"
          alt="Hero background"
          className="absolute inset-0 w-full h-full object-cover"
        />
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-center text-white">
            <h1 className="text-6xl font-bold">{t("title")}</h1>
            <h2 className="text-8xl font-bold mt-4">CIOFF</h2>
          </div>
          <div className="absolute bottom-0 left-0 right-0 flex justify-center space-x-2 mb-4 gap-[0.1rem]">
            <Link href="#">
              <Facebook className="w-5 h-5 text-white" />
            </Link>
            <Link href="#">
              <Instagram className="w-5 h-5 text-white" />
            </Link>
            <Link href="#">
              <Linkedin className="w-5 h-5 text-white" />
            </Link>
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
              <div className="flex-1 bg-gray-100 p-4 rounded-lg">
                <div className="animate-pulse">
                  <div className="h-32 sm:h-48 bg-gray-700 rounded-lg" />
                </div>
                <h3 className="text-black mt-2 text-sm sm:text-base">
                  Bruno Ravnikar – In memoriam
                </h3>
                <p className="text-gray-700 text-xs sm:text-sm">11 Sept 2023</p>
                <p className="text-gray-700 text-xs sm:text-sm">
                  We are hear to remember the Master, colleague and dear friend
                  Bruno...
                </p>
              </div>
              <div className="flex-1 bg-gray-100 p-4 rounded-lg">
                <div className="animate-pulse">
                  <div className="h-32 sm:h-48 bg-gray-700 rounded-lg" />
                </div>
                <h3 className="text-black mt-2 text-sm sm:text-base">
                  51st CIOFF World Congress in Puerto Vallarta, Jalisco; Mexico.
                </h3>
                <p className="text-gray-700 text-xs sm:text-sm">19 Oct 2022</p>
                <p className="text-gray-700 text-xs sm:text-sm">
                  We want to thank Dr. Ismael García Ávila, President of CIOFF
                  Mexico...
                </p>
              </div>
              <div className="flex-1 bg-gray-100 p-4 rounded-lg">
                <div className="animate-pulse">
                  <div className="h-32 sm:h-48 bg-gray-700 rounded-lg" />
                </div>
                <h3 className="text-black mt-2 text-sm sm:text-base">
                  Welcome to the Netherlands
                </h3>
                <p className="text-gray-700 text-xs sm:text-sm">19 Oct 2022</p>
                <p className="text-gray-700 text-xs sm:text-sm">
                  Sector Meeting CIOFF® Central and Northern Europe Fifteen
                  delegates...
                </p>
              </div>
            </div>
            <Button variant="default" className="mt-4">
              All News
            </Button>
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
