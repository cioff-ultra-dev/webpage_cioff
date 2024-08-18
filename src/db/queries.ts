import { InsertUser, SelectUser, users } from "@/db/schema";
import { db } from ".";
import { eq } from "drizzle-orm";

export async function getUserById(id: SelectUser["id"]): Promise<
  Array<{
    id: number;
    name: string;
    age: number;
    email: string;
  }>
> {
  return db.select().from(users).where(eq(users.id, id));
}

export async function createUser(user: InsertUser) {
  return db.insert(users).values(user).returning();
}

export async function updateUser(id: SelectUser["id"], user: InsertUser) {
  return db.update(users).set(user).where(eq(users.id, id)).returning({
    updatedId: users.id,
  });
}

export async function deleteUser(id: SelectUser["id"]) {
  return db.delete(users).where(eq(users.id, id)).returning({
    deletedName: users.name,
  });
}
