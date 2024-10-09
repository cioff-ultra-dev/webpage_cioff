import { auth } from "@/auth";
import GroupForm from "@/components/common/group/form";
import {
  AgeGroupsType,
  GroupStyleType,
  TypeOfGroupType,
  getAllAgeGroups,
  getAllGroupStyles,
  getAllTypeOfGroups,
} from "@/db/queries/groups";
import { getAllRegions, RegionsType } from "@/db/queries/regions";
import { getLocale } from "next-intl/server";

export default async function NewGroup() {
  const session = await auth();
  const locale = await getLocale();

  const typeOfGroups: TypeOfGroupType = await getAllTypeOfGroups();
  const ageGroups: AgeGroupsType = await getAllAgeGroups();
  const groupStyles: GroupStyleType = await getAllGroupStyles();

  const regions: RegionsType = await getAllRegions();
  return (
    <GroupForm
      typeOfGroups={typeOfGroups}
      ageGroups={ageGroups}
      groupStyles={groupStyles}
      session={session!}
      locale={locale}
      regions={regions}
    />
  );
}
