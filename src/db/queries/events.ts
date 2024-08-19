import { events, SelectEvent } from "@/db/schema";
import { db } from "@/db";

export async function getAllEvents(): Promise<Array<SelectEvent>> {
  return db.select().from(events).limit(10);
}
