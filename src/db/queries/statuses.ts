import { db } from "@/db";
import { SelectStatus } from "@/db/schema";

export async function getAllStatuses(): Promise<SelectStatus[]> {
  return db.query.statuses.findMany();
}
