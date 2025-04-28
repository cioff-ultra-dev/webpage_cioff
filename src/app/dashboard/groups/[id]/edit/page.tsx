import { auth } from "@/auth";
import GroupForm from "@/components/common/group/form";
import { getAllCategories } from "@/db/queries/categories";
import {
  getGroupById,
  GroupDetailsType,
} from "@/db/queries/groups";
import { getAllRegions, RegionsType } from "@/db/queries/regions";
import { Locale } from "@/i18n/config";
import { getLocale } from "next-intl/server";
import { redirect } from "next/navigation";

export default async function EditGroup({
  params,
}: {
  params: { id: string };
}) {
  const group: GroupDetailsType | undefined = await getGroupById(
    Number(params.id)
  );
  const session = await auth();
  const locale = await getLocale();

  const categories = await getAllCategories(locale as Locale);

  const regions: RegionsType = await getAllRegions();

  const currentLang = group?.langs.find((lang) => lang.l?.code === locale);
  const currentCategoriesSelected =
    group?.groupToCategories
      .map((relation) => {
        return relation?.category?.id ? String(relation?.category?.id) : "";
      })
      .filter((id) => Boolean(id)) ?? [];

  if (
    group !== undefined &&
    !group.owners.some((owner) => owner.userId === session?.user.id)
  )
    redirect("/dashboard/groups");

  return (
    <GroupForm
      categories={categories}
      currentGroup={group}
      id={params.id}
      session={session!}
      locale={locale}
      currentLang={currentLang}
      currentCategoriesSelected={currentCategoriesSelected}
      regions={regions}
    />
  );
}
