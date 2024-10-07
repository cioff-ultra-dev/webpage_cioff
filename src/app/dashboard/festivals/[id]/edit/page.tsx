import { auth } from "@/auth";
import EventForm from "@/components/common/event/form";
import { getCategoryGroupsWithCategories } from "@/db/queries/category-group";
import {
  FestivalBySlugType,
  getCategoryForGroups,
  getFestivalBySlug,
} from "@/db/queries/events";
import { getAllLanguages } from "@/db/queries/languages";
import { getAllStatuses } from "@/db/queries/statuses";
import { getLocale, getTranslations } from "next-intl/server";
import slug from "slug";

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
  const statuses = await getAllStatuses();

  const typeOfFestival = await getCategoryForGroups(locale, ["music", "dance"]);
  const ageOfParticipants = await getCategoryForGroups(locale, [
    "teenagers-children",
    "youth-adults-seniors",
  ]);
  const styleOfFestival = await getCategoryForGroups(locale, [
    "stylized",
    "elaborate",
    "authentic",
  ]);
  const typeOfAccomodation = await getCategoryForGroups(locale, [
    "hotel-hostel-campus",
    "family-houses",
    "schools-gym-halls",
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

  return (
    <EventForm
      categoryGroups={[
        {
          // name: t("typeOfFestival"),
          slug: "type-of-festival",
          title: t("typeOfFestival"),
          categories: typeOfFestival,
        },
        {
          // name: t("ageOfParticipants"),
          slug: "age-of-participants",
          title: t("ageOfParticipants"),
          categories: ageOfParticipants,
        },
        {
          // name: t("styleOfFestival"),
          slug: "style-of-festival",
          title: t("styleOfFestival"),
          categories: styleOfFestival,
        },
        {
          // name: t("typeOfAccomodation"),
          slug: "type-of-accomodation",
          title: t("typeOfAccomodation"),
          categories: typeOfAccomodation,
        },
      ]}
      languages={languages}
      statuses={statuses}
      currentLang={currentLang}
      currentFestival={festival}
      currentOwner={currentOwner}
      currentCategoriesSelected={currentCategoriesSelected}
      id={`${festival?.id}`}
      slug={params.id}
      locale={locale}
      session={session!}
    />
  );
}
