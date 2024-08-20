import EventForm from "@/components/common/event/form";
import { getAllEventTypes } from "@/db/queries";

export default async function NewEvent() {
  const eventTypes = await getAllEventTypes();

  return <EventForm eventTypes={eventTypes} />;
}
