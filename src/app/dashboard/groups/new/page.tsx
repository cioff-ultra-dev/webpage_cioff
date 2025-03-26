import { getLocale } from "next-intl/server";

import { auth } from "@/auth";
import GroupForm from "@/components/common/group/form";
import { getAllRegions, RegionsType } from "@/db/queries/regions";
import { getAllCategories } from "@/db/queries/categories";
import { Locale } from "@/i18n/config";

export default async function NewGroup() {
  const session = await auth();
  const locale = await getLocale();

 const categories = await getAllCategories(locale as Locale);

  const regions: RegionsType = await getAllRegions();
  return (
    <GroupForm
      categories={categories}
      session={session!}
      locale={locale}
      regions={regions}
    />
  );
}
