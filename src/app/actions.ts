"use server";
import { InsertEvent, insertEventSchema, SelectEvent } from "@/db/schema";
import { revalidatePath } from "next/cache";

export async function createEvent(prevState: InsertEvent, formData: FormData) {
  const schema = insertEventSchema.omit({ id: true });

  console.log(Object.fromEntries(formData.entries()));

  revalidatePath("/events/new");
  return { title: "", approved: false, description: "" };
}
