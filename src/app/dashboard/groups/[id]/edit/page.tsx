import GroupForm from "@/components/common/group/form";
import { getGroupById, GroupDetailsType } from "@/db/queries/groups";

export default async function EditGroup({
  params,
}: {
  params: { id: string };
}) {
  const group: GroupDetailsType | undefined = await getGroupById(
    Number(params.id)
  );

  return <GroupForm currentGroup={group} id={params.id} />;
}
