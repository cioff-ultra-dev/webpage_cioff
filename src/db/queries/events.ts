import { events, SelectEvents } from "@/db/schema";
import { db } from "@/db";

export async function getAllEvents(): Promise<Array<SelectEvents>> {
  return db.select().from(events).limit(10);
}
