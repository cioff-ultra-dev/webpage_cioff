import { getLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import EventForm from "@/components/common/event/form";
import { getAllCategories } from "@/db/queries/categories";
import { getAllCountries } from "@/db/queries/countries";
import {
  FestivalBySlugType,
  getComponentForGroups,
  getFestivalBySlug,
} from "@/db/queries/events";
import { getAllLanguages } from "@/db/queries/languages";
import { getAllRegions } from "@/db/queries/regions";
import { getAllStatuses } from "@/db/queries/statuses";
import { Locale } from "@/i18n/config";

export default async function EditFestival({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();
  const locale = await getLocale();
  const t = await getTranslations("form.festival.tag");
  const festival: FestivalBySlugType | undefined = await getFestivalBySlug(
    params.id,
    locale
  );
  const languages = await getAllLanguages();
  const countries = await getAllCountries();
  const regions = await getAllRegions();
  const statuses = await getAllStatuses();
  const categories = await getAllCategories(locale as Locale);

  const componentsRecognized = await getComponentForGroups(locale, [
    "arts-crafts-market",
    "traditional-cuisine",
    "other-exhibitions",
    "traditional-games",
    "workshops",
    "activities-disabled-people",
  ]);
  const componentsPartner = await getComponentForGroups(locale, [
    "live-music-required",
    "traditional-trade",
    "traditional-food",
    "exhibitions",
    "traditional-games",
    "workshops",
    "activities-disabled-people",
  ]);

  const currentCategoriesSelected =
    festival?.festivalsToCategories
      .map((relation) => {
        return relation?.category?.id ? String(relation?.category?.id) : "";
      })
      .filter((id) => Boolean(id)) ?? [];
  const currentLang = festival?.langs.find((lang) => lang.l?.code === locale);
  const currentOwner = festival?.owners.find(
    (owner) => owner.user?.role?.name === "Festivals"
  );
  const currentStatus = festival?.festivalsToStatuses.at(0);

if (
  festival !== undefined &&
  !festival.owners.some((owner) => owner.userId === session?.user.id)
)
  redirect("/dashboard/festivals");

  return (
    <EventForm
      categoryGroups={categories}
      languages={languages}
      statuses={statuses}
      currentLang={currentLang}
      currentFestival={festival}
      currentOwner={currentOwner}
      currentStatus={currentStatus}
      currentCategoriesSelected={currentCategoriesSelected}
      componentsRecognized={componentsRecognized}
      componentsPartner={componentsPartner}
      countries={countries}
      regions={regions}
      id={`${festival?.id}`}
      slug={params.id}
      locale={locale}
      session={session!}
    />
  );
}
