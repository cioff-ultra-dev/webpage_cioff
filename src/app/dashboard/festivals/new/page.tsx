import EventForm from "@/components/common/event/form";
import { getCategoryGroupsWithCategories } from "@/db/queries/category-group";
import { getCategoryForGroups } from "@/db/queries/events";
import { getAllLanguages } from "@/db/queries/languages";
import { getAllStatuses } from "@/db/queries/statuses";
import { getLocale, getTranslations } from "next-intl/server";

export default async function NewEvent() {
  const locale = await getLocale();
  const languages = await getAllLanguages();
  const statuses = await getAllStatuses();
  const t = await getTranslations("form.festival.tag");

  const typeOfFestival = await getCategoryForGroups(locale, ["music", "dance"]);
  const ageOfParticipants = await getCategoryForGroups(locale, [
    "children",
    "youth",
    "adults",
    "seniors",
  ]);
  const styleOfFestival = await getCategoryForGroups(locale, [
    "stylized",
    "elaborated",
    "authentic",
  ]);
  const typeOfAccomodation = await getCategoryForGroups(locale, [
    "hotel",
    "family-houses",
    "schools",
  ]);
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
      currentCategoriesSelected={[]}
      languages={languages}
      statuses={statuses}
      locale={locale}
    />
  );
}
