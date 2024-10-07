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

export default async function EditGroup({
  params,
}: {
  params: { id: string };
}) {
  const group: GroupDetailsType | undefined = await getGroupById(
    Number(params.id)
  );
  const session = await auth();

  const typeOfGroups: TypeOfGroupType = await getAllTypeOfGroups();
  const ageGroups: AgeGroupsType = await getAllAgeGroups();
  const groupStyles: GroupStyleType = await getAllGroupStyles();

  return (
    <GroupForm
      currentGroup={group}
      id={params.id}
      typeOfGroups={typeOfGroups}
      ageGroups={ageGroups}
      groupStyles={groupStyles}
      session={session!}
    />
  );
}
