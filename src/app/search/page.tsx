import { getLocale } from "next-intl/server";

import { Header } from "@/components/common/header";
import GlobalFilter from "@/components/common/global-filter";
import { getAllNestedFestivals } from "@/db/queries/events";
import { getAllCountryCastFestivals } from "@/db/queries/countries";
import { Locale } from "@/i18n/config";
import { getAllCategories } from "@/db/queries/categories";
import Footer from "@/components/common/footer";

export default async function SearchPage({
  searchParams,
}: {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const locale = await getLocale();
  const festivals = await getAllNestedFestivals();
  const countryCast = await getAllCountryCastFestivals(locale as Locale);
  const categories = await getAllCategories(locale as Locale);
  return (
    <div>
      <Header
        text="text-black"
        className="border-b max-sm:fixed max-sm:bg-white w-full"
      />
      <main className="max-sm:pt-16">
        <GlobalFilter
          fallbackFestivals={festivals}
          fallbackCountryCast={countryCast}
          searchParams={searchParams}
          categories={categories}
        />
      </main>
      <Footer />
    </div>
  );
}
