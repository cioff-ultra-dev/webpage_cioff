import EventForm from "@/components/common/event/form";
import { getCategoryGroupsWithCategories } from "@/db/queries/category-group";
import { getAllLanguages } from "@/db/queries/languages";
import { getAllStatuses } from "@/db/queries/statuses";

export default async function NewEvent() {
  const categoryGroups = await getCategoryGroupsWithCategories();
  const languages = await getAllLanguages();
  const statuses = await getAllStatuses();
  return (
    <EventForm
      categoryGroups={categoryGroups}
      languages={languages}
      statuses={statuses}
    />
  );
}
