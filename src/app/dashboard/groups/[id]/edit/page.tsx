import { auth } from "@/auth";
import GroupForm from "@/components/common/group/form";
import {
  AgeGroupsType,
  getAllAgeGroups,
  getAllGroupStyles,
  getAllTypeOfGroups,
  getGroupById,
  GroupDetailsType,
  GroupStyleType,
  TypeOfGroupType,
} from "@/db/queries/groups";
import { getAllRegions, RegionsType } from "@/db/queries/regions";
import { getLocale } from "next-intl/server";

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

  const typeOfGroups: TypeOfGroupType = await getAllTypeOfGroups();
  const ageGroups: AgeGroupsType = await getAllAgeGroups();
  const groupStyles: GroupStyleType = await getAllGroupStyles();

  const regions: RegionsType = await getAllRegions();

  const currentLang = group?.langs.find((lang) => lang.l?.code === locale);
  const currentCategoriesSelected =
    group?.groupToCategories
      .map((relation) => {
        return relation?.category?.id ? String(relation?.category?.id) : "";
      })
      .filter((id) => Boolean(id)) ?? [];

  return (
    <GroupForm
      currentGroup={group}
      id={params.id}
      typeOfGroups={typeOfGroups}
      ageGroups={ageGroups}
      groupStyles={groupStyles}
      session={session!}
      locale={locale}
      currentLang={currentLang}
      currentCategoriesSelected={currentCategoriesSelected}
      regions={regions}
    />
  );
}
