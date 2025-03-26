import { auth } from "@/auth";
import EventForm from "@/components/common/event/form";
import { getAllCategories } from "@/db/queries/categories";
import { getAllLanguages } from "@/db/queries/languages";
import { getAllStatuses } from "@/db/queries/statuses";
import { Locale } from "@/i18n/config";
import { getLocale, getTranslations } from "next-intl/server";

export default async function NewEvent() {
  const session = await auth();
  const locale = await getLocale();
  const languages = await getAllLanguages();
  const statuses = await getAllStatuses();
  const categories = await getAllCategories(locale as Locale);

  return (
    <EventForm
      categoryGroups={categories}
      currentCategoriesSelected={[]}
      languages={languages}
      statuses={statuses}
      locale={locale}
      session={session!}
    />
  );
}
