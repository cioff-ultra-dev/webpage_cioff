import { auth } from "@/auth";
import EventForm from "@/components/common/event/form";
import { getCategoryGroupsWithCategories } from "@/db/queries/category-group";
import { getCategoryForGroups } from "@/db/queries/events";
import { getAllLanguages } from "@/db/queries/languages";
import { getAllStatuses } from "@/db/queries/statuses";
import { getLocale, getTranslations } from "next-intl/server";

export default async function NewEvent() {
  const session = await auth();
  const locale = await getLocale();
  const languages = await getAllLanguages();
  const statuses = await getAllStatuses();
  const t = await getTranslations("form.festival.tag");

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
      session={session!}
    />
  );
}
