import {
  events,
  InsertEvent,
  SelectEvent,
  festivals,
  InsertFestival,
  SelectFestival,
} from "@/db/schema";
import { db } from "@/db";
import { eq } from "drizzle-orm";

export async function getAllEvents(): Promise<Array<SelectEvent>> {
  return db.select().from(events).limit(10);
}

export async function newEvent(event: InsertEvent) {
  return db.insert(events).values(event).returning();
}

export async function getAllFestivals(): Promise<Array<SelectFestival>> {
  return db.select().from(festivals).limit(10);
}

export async function newFestival(festival: InsertFestival) {
  return db.insert(festivals).values(festival).returning();
}

export async function getFestivalById(
  id: SelectFestival["id"]
): Promise<Array<SelectFestival>> {
  return db.select().from(festivals).where(eq(festivals.id, id));
}
