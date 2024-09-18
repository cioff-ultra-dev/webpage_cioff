import EventForm from "@/components/common/event/form";
import { getCategoryGroupsWithCategories } from "@/db/queries/category-group";
import { getAllLanguages } from "@/db/queries/languages";

export default async function NewEvent() {
  const categoryGroups = await getCategoryGroupsWithCategories();
  const languages = await getAllLanguages();
  return <EventForm categoryGroups={categoryGroups} languages={languages} />;
}
