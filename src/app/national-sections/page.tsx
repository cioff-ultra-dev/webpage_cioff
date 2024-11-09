import { Header } from "@/components/common/header";
import { getAllNationalSectionsPage } from "@/db/queries/national-sections";
import { SquareArrowOutUpRight } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import Image from "next/image";
import Link from "next/link";

export default async function NationaSectionList() {
  const locale = await getLocale();
  const t = await getTranslations("page");
  const nationalSections = await getAllNationalSectionsPage(locale);

  return (
    <div className="flex flex-col w-full min-h-screen">
      <Header className="border-b" text="text-black" />
      <main className="flex flex-col flex-1 gap-4 md:gap-8 bg-gray-50">
        <div className="flex flex-col w-full max-w-5xl mx-auto pt-8">
          <h1 className="text-3xl font-bold mb-8">{t("national_sections")}</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {nationalSections.map((country, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <div className="p-4">
                  <Link
                    href={`/national-sections/${country.id}`}
                    className="flex w-full justify-between"
                  >
                    <h2 className="text-xl font-semibold mb-2 max-w-40">
                      {
                        country.langs.find((lang) => lang.l?.code === locale)
                          ?.name
                      }
                    </h2>
                    <SquareArrowOutUpRight className="h-3 w-3" />
                  </Link>
                  <p className="text-sm text-gray-700 mb-2 font-medium">
                    {country.owners.at(0)?.user?.email}
                  </p>
                  <p className="text-sm text-gray-500 line-clamp-3">
                    {
                      country.langs.find((lang) => lang.l?.code === locale)
                        ?.about
                    }
                  </p>
                </div>
              </div>
            ))}
          </div>
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
