import Image from "next/image";
import { Header } from "@/components/common/header";
import GlobalFilter from "@/components/common/global-filter";
import { getAllNestedFestivals } from "@/db/queries/events";
import { getAllCountryCastFestivals } from "@/db/queries/countries";
import { getLocale } from "next-intl/server";
import { Locale } from "@/i18n/config";

export default async function SearchPage({
  searchParams,
}: {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const locale = await getLocale();
  const festivals = await getAllNestedFestivals();
  const countryCast = await getAllCountryCastFestivals(locale as Locale);
  return (
    <div>
      <Header text="text-black" className="border-b" />
      <main>
        <GlobalFilter
          fallbackFestivals={festivals}
          fallbackCountryCast={countryCast}
          searchParams={searchParams}
        />
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
