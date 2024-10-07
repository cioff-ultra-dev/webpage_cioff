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

export default async function NewGroup() {
  const session = await auth();

  const typeOfGroups: TypeOfGroupType = await getAllTypeOfGroups();
  const ageGroups: AgeGroupsType = await getAllAgeGroups();
  const groupStyles: GroupStyleType = await getAllGroupStyles();
  return (
    <GroupForm
      typeOfGroups={typeOfGroups}
      ageGroups={ageGroups}
      groupStyles={groupStyles}
      session={session!}
    />
  );
}
